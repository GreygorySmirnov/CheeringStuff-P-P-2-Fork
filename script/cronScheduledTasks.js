// Function FTP Connexion / Download / Download
exports.fetchProductsAndPhotosFromFtpDaily = (req, res) => {
    const cron = require('node-cron');// MODULES DE DÉPENDANCES (inclusion): Planificateur CRON, Librairie FTP, Gestionnaire de fichier FS, Gestionnaire de téléchargement AdmZip
    const ftpController = require('../controller/ftpController')     // Importer le script ftpController pour accéder à la fonction ftpGet.js

    // CRON SCRIPT - Exécution du script planifié (Référence: https://crontab.guru/#0_*/1_*_*_*)
    // cron.schedule('*/1 * * * *', function () { // MODE TEST (À TOUTES LES MINUTES): */1 * * * *
        console.log("Cron Script activé. - Insérez votre fonction sous ce message pour l'exécuter au moment désiré") // ('*/1 * * * *') == Toutes les minutes || ('59 8 */1 * *') à 08:59am à tous les jours
         ftpController.fetchProductsAndPhotosFromFtpDaily;
    // })

    // MODE TEST: APPEL LA FONCTION de téléchargement de produits dans ftpController INSTANNÉMENT (pour TESTER et pour le bouton fetch, si nécessaire)
    ftpController.fetchProductsAndPhotosFromFtpDaily();
    
}
