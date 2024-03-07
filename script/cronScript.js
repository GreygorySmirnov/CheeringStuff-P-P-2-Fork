// Function FTP Connexion / Download / Download
exports.fetchProductsAndPhotosFromFtp = (req, res) => {

    // Importer le script ftpGetController pour accéder à la fonction ftpGet.js
    const ftpController = require('../controller/ftpController');

    // APPEL LA FONCTION de téléchargement de produits dans ftpController + APPELLE la fonction d'extraction de fichier dans zipController
    ftpController.fetchProductsAndPhotos();
}
