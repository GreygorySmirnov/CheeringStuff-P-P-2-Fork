"use strict";

const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const Product = require("../models/products");
require("dotenv").config();

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