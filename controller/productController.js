"use strict";

const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const Product = require("../models/products");
const productSoluSoft = require("../models/productSoluSoft"); // nouveau modèle/schema de produits avec les attributs de solusoft
require("dotenv").config();
const fs = require("fs");

// Fonction qui récupère et liste tous les produits de la base de données
exports.getProducts = (req, res) => {
  // Extrait le token JWT de l'en-tête de la requête
  const token = req.headers.authorization?.split(" ")[1];

  // Définit les champs de prix et de quantité par défaut
  let priceFields = ["PRIX"];
  let quantityFields = [" "];

  /* Si un token est présent, il est décodé et les champs
     sont ajustés en fonction du rôle de l'utilisateur */
  if (token) {
    try {
      const decodedToken = jwt.verify(token, secretKey);
      if (decodedToken.isAdmin) {
        priceFields = [
          "PRIX",
          "PRIX2",
          "PRIX3",
          "PRIX4",
          "PRIX5",
          "PRIX6",
          "PRIX7",
        ];
        quantityFields = ["QTEMAIN"];
      } else {
        priceFields = ["PRIX4"];
        quantityFields = [" "];
      }
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      res
        .status(401)
        .json({ error: "Erreur d'authentification Utilisateur !" });
    }
  }

  // Recherche de tous les produits dans la base de données
  Product.find()
    .select(
      `NOPROD DESCFRA ${priceFields.join(" ")} ${quantityFields.join(
        " "
      )} POINTIMAG`
    )

    .then((products) => {
      res.status(200).json(products);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Une erreur est survenue !" });
    });
};

// Fonction récupérer un produit par son ID.
exports.getProductById = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  // Définit les champs de prix et de quantité par défaut
  let priceFields = ["PRIX"];
  let quantityFields = [" "];

  /* Si un token est généré, le décode et ajuste champs prix et quantité 
  en main selon l'utilisateur
  */
  if (token) {
    try {
      const decodedToken = jwt.verify(token, secretKey);
      if (decodedToken.isAdmin) {
        priceFields = [
          "PRIX",
          "PRIX2",
          "PRIX3",
          "PRIX4",
          "PRIX5",
          "PRIX6",
          "PRIX7",
        ];
        quantityFields = ["QTEMAIN"];
      } else {
        priceFields = ["PRIX4"];
        quantityFields = [" "];
      }
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      res
        .status(401)
        .json({ error: "Erreur d'authentification Utilisateur !" });
    }
  }

  // Recherche du produit par ID dans la base de données
  Product.findById(req.params.id)

    .select(
      `NOPROD DESCFRA ${priceFields.join(" ")} ${quantityFields.join(
        " "
      )} POINTIMAG`
    )
    .then((Product) => {
      res.status(200).json(Product);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Une erreur est survenue !" });
    });
};


// createProductByTextFile: Création d'un nouveau produit dans la collection 'products' de MongoDb. (s'il n'existe pas déjà)
exports.createProductByTextFile = async (req, res) => {
  const fetchedProductsTxtFile = './solusoft/ftpReceivedFiles/Produits/20240228_08271080_Produit.txt';

  try {
    const productsJsonData = JSON.parse(fs.readFileSync(fetchedProductsTxtFile, 'utf8')); // Fonction readFileSync du module FS qui lit un fichier TXT et l'analyse en objet JSON (JSON.parse).
    const productsToInsert = []; // Tableau qui contient les produits sans les dupliquer (m_sNoProduit n'est pas déjà présent dans la collection)
    const productsToUpdate = []; // Tableau qui contient les produits à mettre à jour (m_sNoProduit est déjà présent dans la colleciton)
    const existingProductNumbers = new Set(); // Conserve les m_sNoProduit déjà existants dans la collection 'products' de MongoDB

    // Vérifie les numéros de produit déjà existant avant de les insérer
    for (const product of productsJsonData) { // Parcours tout les produits à l'intérieur du tableau productsJsonData et crée une promesse/retour pour tout les produits trouvés
      const existingProduct = await productSoluSoft.findOne({ m_sNoProduit: product.m_sNoProduit }); // findOne itère sur les produits dans l'objet JSON et vérifie pour chaque produit s'il existe déjà dans la collection 'products'. Si un produit avec le même attribut m_sNoProduit est trouvé, le produit est ajouté au tableau productsToUpdate. Sinon, il est ajouté au tableau productsToInsert.

      if (!existingProduct) { // Si la variable existingProduct est vide...
        productsToInsert.push(product); // Ajouter le produit dans la variable productsToInsert.
      } else {
        productsToUpdate.push(product); // Ajouter le produit dans la variable productsToInsert.
        existingProductNumbers.add(product.m_sNoProduit);
        console.warn(`MongoDB: Les produits avec l'attribut m_sNoProduit en double seront ignorés: ${product.m_sNoProduit}`);
      }
    }

    if (productsToUpdate.length > 0) {
      // await productSoluSoft.updateMany({}, { $set: { m_eIDProduit: 12345 } })
      await productSoluSoft.updateMany({},
        // PROBLÈME: BESOIN D'UNE BOUCLE POUR [0] ET SEULEMENT CAPABLE D'UPDATER UN ATTRIBUT SÉLECTIONNÉ (ici m_sDescFra)
        { $set: { m_sDescFra: productsToUpdate[0].m_sDescFra } },
        )
        // { $set: {  } })
      console.log(`LIGNE 150 MongoDB: ${productsToUpdate.length} produit(s) modifié(s) avec succès.`);
    }
 
    if (productsToInsert.length > 0) { // FONCTION qui s'exécutera si le tableau de produits à a inséré n'est pas vide. (ligne 135)
      await productSoluSoft.insertMany(productsToInsert); // Ajoute les produts à inséré dans la collection 'products' de MongoDB
      console.log(`MongoDB: ${productsToInsert.length} produit(s) inséré(s) avec succès.`);
    } else {
      console.log('MongoDB: Aucun nouveau produit trouvé (Leurs attributs "m_sNoProduit" existe déjà dans la base de donnée MongoDB).');
    }

  }
  catch (error) {
    console.error("Erreur lors du traitement des données produit:", error);
  }
}