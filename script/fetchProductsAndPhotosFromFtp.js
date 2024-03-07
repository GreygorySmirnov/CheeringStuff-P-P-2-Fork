// Function FTP Connexion / Download / Download
exports.fetchProductsAndPhotosFromFtp = (req, res) => {
    const cron = require('node-cron');// MODULES DE DÉPENDANCES (inclusion): Planificateur CRON, Librairie FTP, Gestionnaire de fichier FS, Gestionnaire de téléchargement AdmZip
    const ftpController = require('../controller/ftpController')     // Importer le script ftpController pour accéder à la fonction ftpGet.js

    // CRON SCRIPT DAILY - Exécution du script à 08:59am à tous les jours du mois." (Référence: https://crontab.guru/#0_*/1_*_*_*)
    cron.schedule('59 8 */1 * *', function () {
        console.log('Script Cron exécuté à 08:59am à tous les jours')
    })

    // APPEL LA FONCTION de téléchargement de produits dans ftpController
    ftpController.fetchProductsAndPhotos();
}
