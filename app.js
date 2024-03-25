"use strict";

// MODULES & FUNCTIONS REQUIRE (prérequis - npm i)
const express = require("express");
const app = express();
const mongoose = require("mongoose")
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const imagesPath = path.join(__dirname, "images");
const fsController = require('./controller/fsController') // Importe les fonctions du gestionnaire de fichier FS
const cronScheduledTasks = require('./script/cronScheduledTasks') // Importe les fonctions du planificateur de tâches CRON
const cronScriptFtp = require('./script/cronScriptFtp')
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware pour ajouter les headers CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4242",
  "https://api-cheeringstuff.onrender.com",
  "https://cheeringstuff-p-p-2.onrender.com",
  "https://cheeringstuff-p-p-2-vlyt.onrender.com",
  "https://cheering-stuff-front-end.vercel.app",
  "https://cheering-stuff-front-end-swart.vercel.app",
  "https://dashboard.stripe.com",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Vos routes et le reste de votre configuration
app.get("/", (req, res) => {
  res.send("Bienvenue sur votre API sécurisée.");
});

// Servir les images statiques depuis le dossier 'images'
app.use("/images", express.static(imagesPath));

// Importe les routes
const routesUser = require('./routes/routesUser');
const routesProduct = require('./routes/routesProduct');
const routesOrder = require('./routes/routesOrder');
const routesCart = require('./routes/routesCart');
const routesError = require('./routes/routesError');
const routesSearch = require('./routes/routesSearch');

app.use(
  routesUser,
  routesProduct,
  routesSearch,
  routesCart,
  routesOrder,
  routesError
);

// Gestions des erreurs
const errorController = require("./controller/errorController");
app.use(errorController.logErrors);
app.use(errorController.get404);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log(
      "Mongoose: La connexion à la base de données est établie, http://localhost:4242"
    );

    app.listen(4242, () => {
      console.log("Mongoose: Le serveur écoute sur le port 4242");
    });
    // cronScriptFtp est désactivé pour prévenir la multiplication des fichiers orders dans le dossier "parseOrdersFiles" et sur le serveur FTP.
    // cronScriptFtp.ftpCronConnect(); // devra être déplacer dans cronScheduledTasks et programmé 1x par heure: (0 */1 * * *)
  })
  .catch((err) => {
    console.log("Mongoose: La connexion à la base de données a échoué", err);
  });

// APPEL DES SCRIPTS ET FONCTIONS AU DÉMARRAGE DE L'API
fsController.createSolusoftRootFolder(); // CRÉE le dossier Solusoft
cronScheduledTasks.fetchProductsAndPhotosFromFtpDaily() // TÉLÉCHARGE les produits et photos du ftp quotidiennement;