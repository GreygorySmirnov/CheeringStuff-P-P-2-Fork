const ftp = require("ftp");
const fs = require("fs");
const AdmZip = require("adm-zip");

// ZIP - Chemin d'accès vers le fichier zip (produits)
const zipFilePath = "solusoft/compressedFiles/produitTest666.zip";

try {
  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo("solusoft/uncompressedFiles", true);
} catch (err) {
  if (err.message.includes("Aucun en-tête END trouvé")) {
    console.error(
      "Erreur : Format ZIP invalide ou non pris en charge. Le fichier est peut-être corrompu."
    );
  } else {
    console.error("Erreur inattendue lors de lextraction ZIP :", err);
  }
}

// FTP - Importation  des commandes
const Order = require("./models/orders"); //
//const Client = require('ftp');

// Fonction pour importer les commandes depuis MongoDB et les convertir en fichiers JSON.
const importOrders = async () => {
  try {
    // Récupérer toutes les commandes de la base de données MongoDB
    const orders = await Order.find();

    // Parcourir les commandes et les convertir en fichiers JSON
    for (const order of orders) {
      const orderJSON = orderToJSON(order);
      const fileName = `commande-${order._id}.json`;
      const filePath = `solusoft/orders/${fileName}`;

      // Ecrire le fichier JSON dans le dossier 'solusoft/orders'
      fs.writeFileSync(filePath, orderJSON);
    }
    // Créer un fichier dans le dossier 'orders'
    const createFileInOrdersFolder = () => {
      try {
        // Nom du fichier à créer
        const fileName = "nouveau-fichier.txt";

        // Chemin complet du fichier à créer
        const filePath = path.join(__dirname, "solusoft", "orders", fileName);

        // Contenu du fichier
        const fileContent = "Contenu du nouveau fichier.";

        // Créer le fichier avec le contenu spécifié
        fs.writeFileSync(filePath, fileContent);

        console.log(
          `Le fichier ${fileName} a été créé avec succès dans le dossier 'orders'.`
        );
      } catch (error) {
        console.error(
          "Une erreur est survenue lors de la création du fichier :",
          error
        );
      }
    };
    // Appeler la fonction pour créer le fichier dans le dossier 'orders'
    createFileInOrdersFolder();

    // Se connecter au serveur FTP
    client.connect(config);
    // Fonction pour gérer les erreurs
    function handleError(error) {
      console.error("Une erreur est survenue :", error);
      client.end(); // Fermer la connexion FTP en cas d'erreur
    }
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de l'importation des commandes :",
      error
    );
  }
  client.end();
};

// Fonction pour convertir une commande en fichier JSON
const orderToJSON = (order) => {
  const orderData = {
    _id: order._id,
    userId: order.userId,
    itemsCart: order.itemsCart,
  };
  return JSON.stringify(orderData);
};

// Démarrer l'importation des commandes
importOrders();
