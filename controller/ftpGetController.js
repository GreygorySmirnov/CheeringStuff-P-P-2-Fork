// FTPGET :Fonctions exécutant l'ensemble des fonctionnalités pour récupérer le contenu ajouté des dossiers images et produits du serveur FTP
exports.ftpGet = async (req, res) => {

    // MODULES DE DÉPENDANCES (intégration): Librairies FTP, Gestionnaire de fichier FS, Gerstionnaire de décompression AdmZip)
    const basicFtp = require('basic-ftp'); // Module Gestionnaire d'interactions avec le serveur FTP
    const fs = require('fs'); // Module Gestionnaire de fichiers/(File System)
    const zipController = require('../controller/zipController');


    async function downloadRemoteFtpFiles() {
        // CRÉATION INSTANCE CLIENT: connexion au client
        const solusoftFTP = new basicFtp.Client();

        try {
            // FTP ACCÈS - Connexion au serveur FTP
            await solusoftFTP.access({
                host: 'ftp.solusoft-erp.com',
                user: 'Ricart@solusoft-erp.com',
                password: 'ric2024art',
            });

            // EMPLACEMENT DES DOSSIERS DISTANTS À TÉLÉCHARGER DU SERVEUR FTP (produits et photos à traiter)
            const remoteProductsDir = '/Produits/A traiter';
            const remotePhotosDir = '/Photos/A traiter';
            // EMPLACEMENT DES DOSSIERS LOCAUX POUR LA RÉCEPTION (produits et photos à traiter)
            const solusoftFolder = 'solusoft';
            const localReceivedFilesProduits = 'solusoft/ftpReceivedFiles/Produits';
            const localReceivedFilesPhotos = 'solusoft/ftpReceivedFiles/Photos';

            if (!fs.existsSync(solusoftFolder)) {
                // CRÉATION DU DOSSIER RACINE "Solusoft" LOCAL s'il n'existe pas déjà
                fs.mkdirSync(solusoftFolder, { recursive: true });
                console.log("Le dossier local 'solusoftFolder' a été créé.");
            } else {
                console.log("Le dossier local 'solusoftFolder' existe déjà.");
            }
            
            if (!fs.existsSync(localReceivedFilesProduits)) {
                // CRÉATION DU DOSSIER "PRODUITS" LOCAL s'il n'existe pas déjà
                fs.mkdirSync(localReceivedFilesProduits, { recursive: true });
                console.log("Le dossier local 'ftpReceivedFiles/Produits' a été créé.");
            } else {
                console.log("Le dossier local 'ftpReceivedFiles/Produits' existe déjà.");
            }

            if (!fs.existsSync(localReceivedFilesPhotos)) {
                // CRÉATION DU DOSSIER "PHOTOS" LOCAL s'il n'existe pas déjà
                fs.mkdirSync(localReceivedFilesPhotos, { recursive: true });
                console.log("Le dossier local 'ftpReceivedFiles/Photos' a été créé.");
            } else {
                console.log("Le dossier local 'ftpReceivedFiles/Photos' existe déjà.");
            }

            // CRÉATION DE LA LISTE DES FICHIERS PRODUITS contenus dans le dossiers Produits à traiter du serveur FTP
            try {
                const productFilesList = await solusoftFTP.list(remoteProductsDir);


                // TÉLÉCHARGEMENT DES PRODUITS (dossier '/Produits/A traiter' du serveur FTP)
                for (const productFile of productFilesList) {
                    if (productFile.isDirectory) {
                        continue; // Ignorer les répertoires
                    }

                    // CHEMIN D'ACCÈS DISTANT AUX PRODUITS (dossier + nom du fichier sur le serveur FTP)
                    const remoteProductsPath = `${remoteProductsDir}/${productFile.name}`;
                    // CHEMIN D'ACCÈS LOCAL AUX PRODUITS (dossier + nom du fichier)
                    const localProductsPath = `solusoft/ftpReceivedFiles/Produits/${productFile.name}`;

                    // TÉLÉCHARGEMENT DES PRODUITS CIBLÉS (lisaison Serveur vers Local)
                    await solusoftFTP.downloadTo(localProductsPath, remoteProductsPath);
                }

                console.log('Les produits ont été téléchargé avec succès!');
            } catch (error) {
                console.log("Erreur lors du téléchargement du dossier des produits")
            }

            // CRÉATION DE LA LISTE DES FICHIERS PHOTOS contenues dans le dossier Photos à traiter du serveur FTP
            try {
                const photoFilesList = await solusoftFTP.list(remotePhotosDir);


                // TÉLÉCHARGEMENT DES PHOTOS (dossier '/Photos/A traiter' du serveur FTP)
                for (const photoFiles of photoFilesList) {
                    if (photoFiles.isDirectory) {
                        continue; // Ignorer les répertoires
                    }

                    // CHEMIN D'ACCÈS DISTANT AUX PHOTOS (dossier + nom du fichier sur le serveur FTP)
                    const remotePhotosPath = `${remotePhotosDir}/${photoFiles.name}`;
                    // CHEMIN D'ACCÈS LOCAL AUX PHOTOS (dossier + nom du fichier)
                    const localPhotosPath = `solusoft/ftpReceivedFiles/Photos/${photoFiles.name}`;

                    // TÉLÉCHARGEMENT DES PHOTOS CIBLÉES (lisaison Serveur vers Local)
                    await solusoftFTP.downloadTo(localPhotosPath, remotePhotosPath);
                }

                console.log('Les photos ont été téléchargé avec succès!');
            } catch (error) {
                console.log("Erreur lors du téléchargement des dossiers photos")
            }
        } catch (error) {
            console.error('Erreur lors de la connexion au serveur FTP', error);
        } finally {
            // FERME LA CONNEXION FTP au serveur Solusoft
            solusoftFTP.close();
        }
        zipController.extractZipFiles();
    }

    // APPEL de la fonction de téléchargement du dossier
    downloadRemoteFtpFiles();
    
}
