// Function FTP Connexion / Download / Download
exports.fetchOrdersAndExportToFTP = (req, res) => {

    // MODULES DE DÉPENDANCES (inclusion): Planificateur CRON, Librairie FTP, Gestionnaire de fichier FS, Gestionnaire de téléchargement AdmZip
    const scriptOrders = require("./scriptOrders");
    // APPEL LA FONCTION de téléchargement de produits dans ftpGetController
    // APPELLE la fonction d'extraction de fichier dans zipController
    ftpGetController.ftpGetProducts();
      // AJOUTER cronScriptOrders pour intégré les 2 fonctions de Toufik (mais le script/cronScript.s ne pull pas)
  scriptOrders.importOrders();
  scriptOrders.exportOrdersToFTP();
    
}
