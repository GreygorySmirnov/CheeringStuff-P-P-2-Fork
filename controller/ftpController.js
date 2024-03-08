// FTPGET :Fonctions exécutant l'ensemble des fonctionnalités pour récupérer le contenu ajouté des dossiers images et produits du serveur FTP
exports.fetchProductsAndPhotos = async (req, res) => {
    // MODULES DE DÉPENDANCES (intégration): Librairies FTP, Gestionnaire de fichier FS, Gerstionnaire de décompression AdmZip)
    const basicFtp = require('basic-ftp'); // Module Gestionnaire d'interactions avec le serveur FTP
    const zipController = require('../controller/zipController');
    const fsController = require('../controller/fsController')

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

            // EXÉCUTER LES FONCTIONS CRÉATIONS DE DOSSIERS LOCAUX ET DISTANT FTP (PRODUITS + PHOTOS)
            fsController.createProductsFolder();
            fsController.createPhotosFolder();

            // CRÉATION DE LA LISTE DES FICHIERS PRODUITS contenus dans le dossiers Produits à traiter du serveur FTP
            try {
                const remoteProductsDir = '/Produits/A traiter';
                const productFilesList = await solusoftFTP.list(remoteProductsDir);
                // EMPLACEMENT DU DOSSIER PRODUITS DISTANTS À TÉLÉCHARGER DU SERVEUR FTP (produits et photos à traiter)
                console.log(remoteProductsDir)
                // TÉLÉCHARGEMENT DES PRODUITS (dossier '/Produits/A traiter' du serveur FTP)
                for (const productFile of productFilesList) {
                    if (productFile.isDirectory) {
                        continue; // Ignorer les répertoires
                    }
                    // CHEMIN D'ACCÈS DISTANT AUX PRODUITS (dossier + nom du fichier sur le serveur FTP)
                    const remoteProductsPath = `${remoteProductsDir}/${productFile.name}`;
                    // CHEMIN D'ACCÈS LOCAL AUX PRODUITS (dossier + nom du fichier)
                    const localProductsPath = `solusoft/ftpReceivedFiles/Produits/${productFile.name}`;

                    // BASIC-FTP DOWNLOADTO - TÉLÉCHARGEMENT DES PRODUITS CIBLÉS (lisaison Serveur vers Local)
                    await solusoftFTP.downloadTo(localProductsPath, remoteProductsPath);
                }

                console.log('Les produits ont été téléchargé avec succès!');
            // PRODUCTS DOWNLOAD ERREUR
            } catch (error) {
                console.log("Erreur lors du téléchargement du dossier des produits")
            }

            // CRÉATION DE LA LISTE DES FICHIERS PHOTOS contenues dans le dossier Photos à traiter du serveur FTP
            try {
                const remotePhotosDir = '/Photos/A traiter';
                const photoFilesList = await solusoftFTP.list(remotePhotosDir);
                // EMPLACEMENT DU DOSSIERS PHOTOS DISTANTS À TÉLÉCHARGER DU SERVEUR FTP (produits et photos à traiter)


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
            // PRODUCTS DOWNLOAD ERREUR
            } catch (error) {
                console.log("Erreur lors du téléchargement des dossiers photos")
            }
        // FTP CONNEXION - ERREUR
        } catch (error) {
            console.error('Erreur lors de la connexion au serveur FTP', error);
        } finally {
            // FERME LA CONNEXION FTP au serveur Solusoft
            solusoftFTP.close();
        }
        // APPELLE la fonction d'extraction de fichier dans zipController
        zipController.extractZipFiles();
    }







    // APPEL de la fonction de téléchargement du dossier
    downloadRemoteFtpFiles();

}
