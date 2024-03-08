"use strict";
const basicFtp = require("basic-ftp");
const ftp = require("ftp");
const fs = require("fs");
const Order = require("../models/orders");
const fsExtra = require("fs-extra");

// Connexion au serveur FTP

const config = {
  host: "ftp.solusoft-erp.com",
  port: 21,
  user: "Ricart@solusoft-erp.com",
  password: "ric2024art",
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

// Fonction pour créer le répertoire distant
const createRemoteDirectory = async (client, remoteDirectory) => {
  try {

    await client.mkdir(remoteDirectory, true);
    console.log(`Répertoire ${remoteDirectory} créé avec succès .`);
  } catch (error) {
    console.error(
      `Erreur lors de la création du répertoire ${remoteDirectory} :`,
      error
    );
  }

};
const ftpHandler = async (fn) => {
  const client = new ftp();
  await client.connect(config);

  try {
    await fn(client);
  } catch (error) {
    console.error("Une erreur est survenue lors de l'opération FTP :", error);
  } finally {
    await client.end();
    console.log("**Déconnexion du serveur FTP réussie**");
  }
};

// Fonction pour importer les commandes depuis MongoDB et les convertir en fichiers JSON.
exports.importOrders = async () => {
  try {
    // Récupérer toutes les commandes de la base de données MongoDB
    const orders = await Order.find();

    // Créer le répertoire 'orders/' s'il n'existe pas
    const directoryPath = "solusoft/parseOrdersFiles";

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Parcourir les commandes et les convertir en fichiers JSON

    for (const order of orders) {
      const orderJSON = orderToJSON(order);
      const fileName = `c-${order._id}.json`;
      const localFilePathForUpload = `${directoryPath}/${fileName}`;

      // Ecrire le fichier JSON dans le dossier 'solusoft/orders'
      fs.writeFileSync(localFilePathForUpload, orderJSON);
    }

    console.log("Importation des commandes terminée.");
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de l'importation des commandes :",
      error
    );
  }
};

// Fonction pour exporter les commandes vers le serveur FTP
exports.exportOrdersToFTP = async () => {
  await ftpHandler(async (client) => {
    
    // Récupérer toutes les commandes de la base de données MongoDB
    const orders = await Order.find();

    // Définir le répertoire cible sur le serveur FTP en dehors de la fonction de rappel
    const remoteDirectory = "/Commandes/commandeTraiter"; // Répertoire sur le serveur FTP

    // DÉCOMMENTER POUR RÉACTIVER LA CRÉATION du répertoire distant "Commandes"
    // await createRemoteDirectory(remoteDirectory);

    //// Parcourir les commandes et les exporter vers le serveur FTP
    for (const order of orders) {
      const directoryPath = "solusoft/parseOrdersFiles";
      const orderJSON = orderToJSON(order);
      const fileName = `c-${order._id}.json`;
      const localFilePathForUpload = `${directoryPath}/${fileName}`;

      // Valider le nom du fichier
      if (!/\bc-[0-9a-z]{12,}\.json\b/.test(fileName)) {
        console.error(` ${fileName} est invalide.`);
        continue;
      }

      // Écrire le fichier JSON temporairement localement
      fs.writeFileSync(localFilePathForUpload, orderJSON);

      // Téléverser le fichier JSON vers le serveur FTP
      if (fs.existsSync(localFilePathForUpload) && client.connected) {
        client.put(
          localFilePathForUpload,
          `${remoteDirectory}/${fileName}`,
          (err) => {
            if (err) {
              console.error(
                `Erreur lors de l'envoi du fichier ${fileName} au serveur FTP :`,
                err
              );
              return;
            }
            console.log(client.connected);
            console.log(`${fileName} a été téléversé avec succès.`);
          }
        );
      } else {
        console.error(`${fileName} n'existe pas.`);
      }
    }
  });
};
