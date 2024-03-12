"use strict";

const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const Product = require("../models/products");
const productSoluSoft = require("../models/productsNewModel"); // nouveau modèle/schema de produits avec les attributs de solusoft
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
  const productTextFilePath = './solusoft/ftpReceivedFiles/Produits/20240228_08271080_Produit.txt';

  try {
    // Fonction qui lit et converti en JSON les produits téléchargés en format txt contenu dans le dossier de réception.
    const productDataText = JSON.parse(fs.readFileSync(productTextFilePath, 'utf8'));

    const productsToInsert = []; // Tableau qui contient les produits sans les dupliquer
    const existingProductNumbers = new Set(); // Set pour conserver/enregistré les numéros de produits existant || Configurer pour stocker des numéros de produits existants uniques

    // Vérifie les numéros de produit déjà existant avant de les insérer
    await Promise.all(productDataText.map(async (product) => {
      const existingProduct = await productSoluSoft.findOne({ m_sNoProduit: product.m_sNoProduit });
      if (!existingProduct) {
        productsToInsert.push(product);
      } else {
        // LES PRODUITS DÉJÀ EXISTANT DOIVENT ÊTRE UPDATER!!!!!!!
        existingProductNumbers.add(product.m_sNoProduit);
        console.warn(`MongoDB: Les produits avec l'attribut m_sNoProduit en double seront ignorés: ${product.m_sNoProduit}`);
      }
    }));

    if (productsToInsert.length > 0) {
      // Insère les produits sans duplication de l'attribut m_sNoProduit.
      // Fonction mongoose qui qppelle le nouveau modèle/schema de produits pour effectuer l'opération insertMany (ajouter).
      // Ces produits parseJSON seront ajoutés dans la collection 'products' de mongoDb avec l'ensemble de leurs attrituts recueillit dans productDataText.
      await productSoluSoft.insertMany(productsToInsert);
      console.log(`MongoDB: ${productsToInsert.length} produit(s) inséré(s) avec succès.`);
    } else {
      console.log('MongoDB: Aucun nouveau produit trouvé (Leurs attributs "m_sNoProduit" existe déjà dans la base de donnée MongoDB).');
    }
  } catch (error) {
    console.error("Erreur lors du traitement des données produit:", error);
  }
};
