"use strict";

const express = require('express');
const app = express();
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const imagesPath = path.join(__dirname, 'images');
const ftp = require('ftp');
const fs = require('fs');
const AdmZip = require('adm-zip');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Middleware pour ajouter les headers CORS
const allowedOrigins = ['http://localhost:3000', 'https://api-cheeringstuff.onrender.com'];
app.use(cors({
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}));


// // Middleware pour vérifier l'adresse IP avant de traiter les requêtes
// app.use((req, res, next) => {
//   const allowedIPs = [
//     '::1', // Localhost
//     '24.201.81.165' , //Antoine Bergeron Public IP
//     '64.228.23.191', // Raphael Doucet Public IP
//     '24.201.110.120', // Nathan Thibault Public IP
//     '70.52.74.125', // Andreann Poirier Public IP
//     '69.4.211.26', // Sebastien Arseneault Public IP
//     '184.162.183.82', // Daniel Lelievre Public IP 
//     '184.162.235.220', // Hamza Arfaoui Public IP
//     '184.145.194.159', // Toufik Dellys Public IP
//     '206.167.109.133', // Cegep Garneau Public IP - Andreann Poirier
//     '206.167.109.141', // Cegep Garneau Public IP - Daniel L-L
//     '206.167.109.162', // Cegep Garneau Public IP - Antoine B.
//     '206.167.109.231', // Cegep Garneau Public IP - Seb Ars.
//     '206.167.109.159', // Cegep Garneau Public IP - Toufik D.
//     '206.167.109.158', // Cegep Garneau Public IP - Hamza 
//   ]; 

//   const allowedIPPrefix = '206.167.109.';

//   // Use the x-forwarded-for header if present
//   const forwardedFor = req.headers['x-forwarded-for'];
//   const clientIP = forwardedFor ? forwardedFor.split(',')[0] : req.socket.remoteAddress;

//   console.log('Client IP:', clientIP);

//   if (clientIP.startsWith(allowedIPPrefix) || allowedIPs.includes(clientIP)) {
//     // The IP address is allowed, continue with the processing
//     next();
//   } else {
//     // The IP address is not allowed, send a 403 forbidden response
//     res.status(403).send('Accès interdit maudit hacker!');
//   }
// });


// Vos routes et le reste de votre configuration
app.get('/', (req, res) => {
  res.send('Bienvenue sur votre API sécurisée.');
});


// Servir les images statiques depuis le dossier 'images'
app.use('/images', express.static(imagesPath));

// Importe les routes
const routesUser = require('./routes/routesUser');
const routesProduct = require('./routes/routesProduct');
const routesOrder = require('./routes/routesOrder');
const routesCart = require('./routes/routesCart');
const routesError = require('./routes/routesError');
const routesSearch = require('./routes/routesSearch');

app.use(routesUser, routesProduct, routesSearch, routesCart, routesOrder, routesError);


// Gestions des erreurs
const errorController = require('./controller/errorController');
app.use(errorController.logErrors);
app.use(errorController.get404);


// MONGODB -Connexion à la base de données
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority`)
  .then(() => {
    console.log('La connexion à la base de données est établie, http://localhost:3030');

    app.listen(3030, () => {
      console.log('Le serveur écoute sur le port 3030');
    });
  })
  .catch(err => {
    console.log('La connexion à la base de données a échoué', err);
  });

// FTP CONNEXION (dependencies: node-ftp) - Connexion à ftp.solusoft-erp.com (+ Création des sous-dossiers Solusoft + Décompression des fichiers)
const client = new ftp();
const config = {
  host: 'ftp.solusoft-erp.com',
  port: 21,
  user: 'Ricart@solusoft-erp.com',
  password: 'ric2024art'
};

client.connect(config);

// FTP Active l'écoute des événements et déclanche les callbacks.
client.on('ready', () => {
  client.list((err, list) => {
    if (err) throw err;
    // Ajout du fichier temporaire pour recevoir le WriteStream

    const fs = require('fs');
    const path = require('path');
    
    const folderPath = './folder';
    
    // Vérification SI dossier "solusoft/compressedFiles" existe déjà, sinon le créé.
    fs.access("solusoft/compressedFiles", fs.constants.F_OK, (err) => {
        if (err) {
            // Directory does not exist, so create it
            fs.mkdir("solusoft/compressedFiles", { recursive: true }, (err) => {
                if (err) {
                    console.error('Erreur de création du dossier "solusoft/compressedFiles":', err);
                } else {
                    console.log('Dossier "solusoft/compressedFiles" créé avec succès"');
                }
            });
        } else {
            console.log('Le dossier "solusoft/compressedFiles" existe déjà');
        }
    });

        // Vérification SI dossier "solusoft/uncompressedFiles" existe déjà, sinon le créé.
        fs.access("solusoft/uncompressedFiles", fs.constants.F_OK, (err) => {
          if (err) {
              // Directory does not exist, so create it
              fs.mkdir("solusoft/uncompressedFiles", { recursive: true }, (err) => {
                  if (err) {
                      console.error('Erreur de création du dossier "solusoft/uncompressedFiles":', err);
                  } else {
                      console.log('Dossier "solusoft/uncompressedFiles" créé avec succès"');
                  }
              });
          } else {
              console.log('Le dossier "solusoft/uncompressedFiles" existe déjà');
          }
      });
    

    const pathName = 'solusoft/compressedFiles/downloadedFile.zip';

    // FTP Sélection du fichier à télécharger sur le serveuer - produitTest.zip (temporaire)
    const remoteFilePath = '/Produits/produitTest.zip'; // Fichier sur le FTP
    //GET - Méthode pour télécharger un fichier
    client.get(remoteFilePath, (err, stream) => {
      if (err) {
        console.error('Error downloading file:', err);
        return;
      }

      // FTP PIPE PROCESS - WriteStream du fichier Serveur vers Stream Local
      stream.pipe(fs.createWriteStream(pathName));


      // FTP CLOSE EVENT - Écoute de la terminaison du processus de téléchargement
      stream.once('close', () => {
        console.log('fichier "downloadedFile.zip" téléchargé avec succès');
        client.end(); // Close the FTP connection

      // ADM-ZIP - Gestionnaire de compression/décompression de fichier
      // ZIP - Chemin d'accès vers le fichier zip (produits)
      const zipFilePath = 'solusoft/compressedFiles/downloadedFile.zip';


      // Crée une instance d'AdmZip
      const zip = new AdmZip(zipFilePath);


      // Extrait le contenu du fichier compressé (produits)
      zip.extractAllTo('solusoft/uncompressedFiles', true);

      });
    });
  });
});

// FTP Gestion des événements
client.on('error', (err) => {
  console.log('FTP error occurred: ' + err);
});

