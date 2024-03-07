// Function FTP Connexion / Download / Download
exports.ftpCronConnect = (req, res) => {

    // MODULES DE DÉPENDANCES (inclusion): Planificateur CRON, Librairie FTP, Gestionnaire de fichier FS, Gestionnaire de téléchargement AdmZip
    const cron = require('node-cron');

    // Importer le script ftpGetController pour accéder à la fonction ftpGet.js
    const ftpGetController = require('../controller/ftpGetController');
    const scriptOrders = require("./scriptOrders");

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // CRON START - Exécution du script cron - CRON *OFF* (Référence: https://crontab.guru/#0_*/1_*_*_*)
    // MODE TEST: exécution toute les minute: Remplacer: * * * * * par: 0 */1 * * *)
    /* 
        cron.schedule('* * * * *', function () {
            console.log('Script Cron exécuté à toute les minutes (mode test). (cronScriptFtp.js)');
    */
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // APPEL LA FONCTION de téléchargement de produits dans ftpGetController
    // APPELLE la fonction d'extraction de fichier dans zipController
    ftpGetController.ftpGetProducts();
    
    
    scriptOrders.importOrders();
    scriptOrders.exportOrdersToFTP();
    // CRON END !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    /*     
    })
    */
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

}
