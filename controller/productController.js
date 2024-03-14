"use strict";

require("dotenv").config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const Product = require("../models/products");
const productSoluSoft = require("../models/productSoluSoft"); // nouveau modèle/schema de produits avec les attributs de solusoft
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
      return res
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
  const fetchedProductsTxtFilePath = './solusoft/ftpReceivedFiles/Produits/20240228_08271080_Produit.txt';

  try {
    let parseProductTxtFile = fs.readFileSync(fetchedProductsTxtFilePath, 'utf8')
    const productsJsonData = JSON.parse(parseProductTxtFile); // readFileSync (module FS): analyse le fichier *produit.txt et convertit objet JSON
    const productsToInsert = []; // Tableau qui contient les produits sans les dupliquer (m_eIDProduit n'est pas déjà présent dans la collection)
    const productsToUpdate = []; // Tableau qui contient les produits à mettre à jour (m_eIDProduit est déjà présent dans la colleciton)
    const existingProductNumbers = new Set(); // Conserve les m_eIDProduit déjà existants dans la collection 'products' de MongoDB

    // Vérifie les numéros de produit déjà existant avant de les insérer
    for (const product of productsJsonData) { // Parcours tout les produits à l'intérieur du tableau productsJsonData. Crée une promesse avec retour pour chacun des produits trouvés
      // findOne itère sur les produits et les trie en deux catégories : productsToUpdate (à modifier) et productsToInsert (à ajouter)
      const existingProduct = await productSoluSoft.findOne({ m_eIDProduit: product.m_eIDProduit }); // findOne itère sur les produits dans l'objet JSON et vérifie pour chaque produit s'il existe déjà dans la collection 'products'. Si un produit avec le même attribut m_eIDProduit est trouvé, le produit est ajouté au tableau productsToUpdate. Sinon, il est ajouté au tableau productsToInsert.

      if (!existingProduct) { // Si aucune concordance de l'attribut m_eIDProduit, le produit il devra être ajouté
        productsToInsert.push(product); // Ajouter le produit dans la liste des produit à ajouter (ToInsert).
        console.warn(`Liste des IDProduit à ajouter (ToInsert): ${product.m_eIDProduit}`);
      } else {
        productsToUpdate.push(product); // S'il ya  concordance de l'attribut m_eIDProduit, le produit il devra être ajouté mis à jour (ToUpdate).
        existingProductNumbers.add(product.m_eIDProduit);
        console.warn(`Liste des IDProduit à modifié (ToUpdate): ${product.m_eIDProduit}`);
      }
    }

    if (productsToUpdate.length > 0) {

      for (let product of productsToUpdate) {
        // console.log(product)
        await productSoluSoft.updateOne({ m_eIDProduit: product.m_eIDProduit },
          // Détermine (set) les attributs qui doivent être modifiés
          {
            $set: {
              m_sDescFra: product.m_sDescFra, // Description Française
              m_sDescAng: product.m_sDescAng // Description Anglaise
            },
          }
        )
        // { $set: {  } })
        console.log(`MongoDB Update Product: ${productsToUpdate.length} produit(s) modifié(s) avec succès.`);
      }
    } else {
      console.log('MongoDB Update Product: Aucun produit déjà existant trouvé (aucune correspondance "m_eIDProduit").');

    }
    if (productsToInsert.length > 0) { // FONCTION qui s'exécutera si le tableau de produits à a inséré n'est pas vide. (ligne 135)
      await productSoluSoft.insertMany(productsToInsert); // Ajoute les produts à ajouté (ToInsert) dans la collection 'products' de MongoDB
      console.log(`MongoDB Insert Product: ${productsToInsert.length} produit(s) ajouté(s) avec succès.`);
    } else {
      console.log('MongoDB Insert Product: Aucun nouveau produit trouvé (Correspondance "m_eIDProduit" déjà présent dans la base de donnée MongoDB).');
    }

  }
  catch (error) {
    console.error("Erreur lors du traitement des données du *DATE_HEURE_Produit.txt provenant du FTP SoluSoft", error);
  }
}