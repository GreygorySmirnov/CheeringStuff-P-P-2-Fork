// FTPGET :Fonctions exécutant l'ensemble des fonctionnalités pour récupérer le contenu ajouté des dossiers images et produits du serveur FTP
exports.ftpGet = async (req, res) => {

    // MODULES DE DÉPENDANCES (intégration): Librairies FTP, Gestionnaire de fichier FS, Gerstionnaire de décompression AdmZip)
    const ftp = require('ftp');
    const fs = require('fs');
    const AdmZip = require('adm-zip');
    const path = require('path');
    const remoteDirPath = '/Produits/a_traiter'; // Dossier distant à téléchargé
    const localDirPath = 'solusoft/compressedFiles/'; // Dossier local sélectionné

    // NEW solusoftFTP solusoftFTP: Création d'une nouvelle instance de connexion au solusoftFTP "ftp.solusoft-erp.com" (dependencies: node-ftp): (+ Création des sous-dossiers Solusoft + Décompression des fichiers)
    const solusoftFTP = new ftp();
    // Détails de connexion au FTP (login)
    const solusoftDetails = {
        host: 'ftp.solusoft-erp.com',
        port: 21,
        user: 'Ricart@solusoft-erp.com',
        password: 'ric2024art'
    };
    // CONNEXION AU solusoftFTP solusoft-erp à l'aide de l'objet solusoftDetails (host, port, user, password)
    solusoftFTP.connect(solusoftDetails);

    // FTP solusoftFTP ON: Active l'écoute des événements et déclanche les callbacks.
    solusoftFTP.on('ready', () => {
        solusoftFTP.list((err, list) => {
            if (err) throw err;


            /* 
            // CRÉATION DES DOSSIERS DE TÉLÉCHARGEMENTS LOCAUX (solusoft/compressedFiles + solusoft/uncompressedFiles)
            // Vérification SI dossier "solusoft/compressedFiles" existe déjà, sinon le créé.
            fs.access("solusoft/compressedFiles", fs.constants.F_OK, (err) => {
                if (err) {
                    // Si dossier "solusoft/compressedFiles" n'existe pas, le créé
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
                    // Si dossier "solusoft/uncompressedFiles" n'existe pas, le créé
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
            }); */




            // Créé le chemin d'accès vers la destination locale du WriteStream
            const pathName = 'solusoft/compressedFiles/downloadedFile.zip';
            // FTP Sélection du fichier à télécharger sur le serveur - produitTest.zip (temporaire)
            const remoteFilePath = '/Produits/produitTest.zip'; // Fichier sur le FTP



            //GET 1 FILE - Méthode pour télécharger un fichier (remoteFilePath)
            solusoftFTP.get(remoteFilePath, (err, stream) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    return;
                }
                // FTP PIPE PROCESS - WriteStream du fichier Serveur vers Stream Local
                stream.pipe(fs.createWriteStream(pathName));
                // FTP CLOSE EVENT - Écoute de la terminaison du processus de téléchargement
                stream.once('close', () => {
                    console.log('fichier "downloadedFile.zip" téléchargé avec succès');
                    solusoftFTP.end(); // Close the FTP connection

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



    // TEST ICI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


    // Connecter au serveur FTP
    solusoftFTP.on('ready', function () {
        downloadDirectory(remoteDirPath, localDirPath);
    });

    
    function downloadDirectory(remoteDirPath, localDirPath) {
        solusoftFTP.list(remoteDirPath, function (err, list) {
            if (err) throw err;

            list.forEach(function (getProduit) {
                const remoteFilePath = path.join(remoteDirPath, getProduit.name);
                const localFilePath = path.join(localDirPath, getProduit.name);
                console.log("DOSSIER FTP REMOTE: " + remoteFilePath)
                console.log(localFilePath)

                if (getProduit.type === 'd') { // Dossier
                    fs.mkdirSync(localFilePath, { recursive: true });
                    downloadDirectory(remoteFilePath, localFilePath);
                } else { // Fichier
                    solusoftFTP.get(remoteFilePath, function (err, stream) {
                        if (err) throw err;
                        stream.once('close', function () { client.end(); });
                        stream.pipe(fs.createWriteStream(localFilePath));
                    });
                }
            });
        });
    }

    // TEST FIN ICI!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!




    // FTP Gestion des événements
    solusoftFTP.on('error', (err) => {
        console.log('Une erreur est survenue: ' + err);
    })
}
/* 
// Exporter la fonction ftpGet
module.exports = ftpGet;
 */