// fetchProductsAndPhotosFromFtpDaily :Fonctions exécutant l'ensemble des fonctionnalités pour récupérer le contenu ajouté des dossiers images et produits du serveur FTP
exports.fetchProductsAndPhotosFromFtpDaily = async (req, res) => {
    // MODULES DE DÉPENDANCES NODE.JS (importation)
    const basicFtp = require('basic-ftp'); // Librairies Basic FTP
    const zipController = require('../controller/zipController'); // Gerstionnaire de décompression AdmZip
    const fsController = require('../controller/fsController') // // Gestionnaire de fichier FS

    // EXÉCUTER LES FONCTIONS CRÉATIONS DE DOSSIERS LOCAUX ET DISTANT FTP (PRODUITS + PHOTOS)
    fsController.createProductsFolder();
    fsController.createPhotosFolder();

    async function fetchRemoteFtpProductsFiles() {

        // CRÉATION DE L'INSTANCE CLIENT (client solusoftFTP)
        const solusoftFTP = new basicFtp.Client();

        // FTP ACCÈS - Création d'une connexion au FTP de Solusoft
        try {
            await solusoftFTP.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
            });

            // CRÉATION DE LA LISTE DES FICHIERS PRODUITS contenus dans le dossiers 'Produits' à traiter du serveur FTP
            try {
                // EMPLACEMENT DU DOSSIER PRODUITS DISTANTS À TÉLÉCHARGER DU SERVEUR FTP (produits et photos à traiter)
                const remoteProductsDir = '/Produits/A traiter';
                // TÉLÉCHARGEMENT DES PRODUITS (dossier '/Produits/A traiter' du serveur FTP)
                const productFilesList = await solusoftFTP.list(remoteProductsDir);
                console.log(remoteProductsDir)
                for (const productFile of productFilesList) {
                    if (productFile.isDirectory) {
                        continue; // Ignorer les répertoires
                    }
                    // CHEMIN D'ACCÈS DISTANT AUX PRODUITS (dossier + nom du fichier sur le serveur FTP)
                    const remoteProductsPath = `${remoteProductsDir}/${productFile.name}`;
                    // CHEMIN D'ACCÈS LOCAL AUX PRODUITS (dossier + nom du fichier locaux)
                    const localProductsPath = `solusoft/ftpReceivedFiles/Produits/${productFile.name}`;
                    // BASIC-FTP DOWNLOADTO - TÉLÉCHARGEMENT DES PRODUITS CIBLÉS (lisaison Serveur vers Local)
                    await solusoftFTP.downloadTo(localProductsPath, remoteProductsPath);
                }
                console.log('Les produits ont été téléchargé avec succès!');
                // GESTION ERREUR DE TÉLÉCHARGEMENTS DES PRODUITS
            } catch (error) {
                console.log("Erreur lors du téléchargement du dossier des produits")
            }

            // GESTION ERREUR DE CONNEXION AU SERVEUR FTP
        } catch (error) {
            console.error('Error connecting to FTP server', error);
        } finally {
            // CLOSES THE FTP CONNECTION to the Solusoft server
            solusoftFTP.close();
        }
    }

    async function fetchRemoteFtpPhotosFiles() {

        // CRÉATION INSTANCE CLIENT: connexion au client
        const solusoftFTP = new basicFtp.Client();

        // FTP ACCÈS Création d'une connexion au FTP de Solusoft
        try {
            await solusoftFTP.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
            });

            // CRÉATION DE LA LISTE DES FICHIERS PHOTOS contenus dans le dossiers 'Photos' à traiter du serveur FTP
            try {
                // EMPLACEMENT DU DOSSIER PHOTOS DISTANTS À TÉLÉCHARGER DU SERVEUR FTP (photos et photos à traiter)
                const remotePhotosDir = '/Photos/A traiter';
                // TÉLÉCHARGEMENT DES PHOTOS (dossier '/Photos/A traiter' du serveur FTP)
                const photoFilesList = await solusoftFTP.list(remotePhotosDir);
                console.log(remotePhotosDir);
                for (const photoFiles of photoFilesList) {
                    if (photoFiles.isDirectory) {
                        continue; // Ignorer les dossiers
                    }
                    // CHEMIN D'ACCÈS DISTANT AUX PHOTOS (dossier + nom du fichier sur le serveur FTP)
                    const remotePhotosPath = `${remotePhotosDir}/${photoFiles.name}`;
                    // CHEMIN D'ACCÈS LOCAL AUX PHOTOS (dossier + nom du fichier locaux)
                    const localPhotosPath = `solusoft/ftpReceivedFiles/Photos/${photoFiles.name}`;
                    // DOWNLOADING TARGETED PHOTOS (Server to Local link)
                    await solusoftFTP.downloadTo(localPhotosPath, remotePhotosPath);
                }
                console.log('Les photos ont été téléchargé avec succès!');


                // APPELLE la fonction d'extraction de fichier dans zipController
                zipController.extractZipPhotosFiles();
                // GESTION ERREUR DE TÉLÉCHARGEMENTS DES PHOTOS
            } catch (error) {
                console.log("Erreur lors du téléchargement du dossier des photos");
            }

            // GESTION ERREUR DE CONNEXION AU SERVEUR FTP
        } catch (error) {
            console.error('Erreur de connexion au serveur FTP', error);
        } finally {
            // CLOSES THE FTP CONNECTION to the Solusoft server
            solusoftFTP.close();
        }
    }

    // APPEL FONCTIONS DE TÉLÉCHARGEMENTS (produits + photos)
    fetchRemoteFtpProductsFiles();
    fetchRemoteFtpPhotosFiles();
}