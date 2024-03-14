// cronScriptFtp >>> cronScriptFtp DOIT ÊTRE RENOMMÉ! >>> fetchOrdersFromMongo.js + refaire le import en haut de app.js
// Function FTP Connexion / Download / Download
exports.ftpCronConnect = (req, res) => {
    // IMPORTATION DU SCRIPT scriptOrders
    const scriptOrders = require("./scriptOrders");

    // EXÉCUTION DES SCRIPTS importOrders + exportOrdersToFTP
    scriptOrders.importOrders();
    scriptOrders.exportOrdersToFTP();
}