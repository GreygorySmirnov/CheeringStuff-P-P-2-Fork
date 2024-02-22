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

// Fonction qui met à jour un produit par son ID
exports.updateProduct = (req, res) => {
  const productId = req.params.id;
  const updateOps = {};

  /* Construction de l'objet des opérations de mise à jour
  à partir du corps de la requête
  */
  for (const propName in req.body) {
    updateOps[propName] = req.body[propName];
  }

  // Mise à jour du produit dans la base de données
  Product.updateOne({ _id: productId }, { $set: updateOps })
    .exec()
    .then(() => {
      res.status(200).json({
        message: "Produit mis à jour avec succès.",
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la mise à jour du produit :", error);
      res.status(500).json({
        error: "Une erreur s'est produite lors de la mise à jour du produit.",
      });
    });
};

// Fonction qui crée un nouveau produit
exports.createProduct = (req, res) => {
  const {
    NOPROD,
    DESCFRA,
    PRIX,
    PRIX2,
    PRIX3,
    PRIX4,
    PRIX5,
    PRIX6,
    PRIX7,
    QTEMAIN,
    POINTIMAG,
  } = req.body;

  // Vérifier si un produit avec le même NOPROD existe déjà
  Product.findOne({ NOPROD })
    .then((existingProduct) => {
      if (existingProduct) {
        // Le produit avec le même NOPROD existe déjà
        res.status(409).json({
          error: "Un produit avec le même NOPROD existe déjà.",
        });

        return;
      }

      // Créer un nouveau produit
      const newProduct = new Product({
        NOPROD,
        DESCFRA,
        PRIX,
        PRIX2,
        PRIX3,
        PRIX4,
        PRIX5,
        PRIX6,
        PRIX7,
        QTEMAIN,
        POINTIMAG,
      });

      // Enregistrer le nouveau produit
      return newProduct.save();
    })
    .then((result) => {
      // Vérifie si une réponse a déjà été envoyée
      if (!res.headersSent) {
        // Répond avec un message de succès et les propriétés du produit créé
        res.status(201).json({
          message: "Produit créé avec succès.",
          product: {
            _id: result._id,
            NOPROD: result.NOPROD,
            DESCFRA: result.DESCFRA,
            PRIX: result.PRIX,
            PRIX2: result.PRIX2,
            PRIX3: result.PRIX3,
            PRIX4: result.PRIX4,
            PRIX5: result.PRIX5,
            PRIX6: result.PRIX6,
            PRIX7: result.PRIX7,
            QTEMAIN: result.QTEMAIN,
            POINTIMAG: result.POINTIMAG,
          },
        });
      }
    })
    .catch((error) => {
      // Journalise l'erreur
      console.error("Erreur lors de la création du produit :", error);
      // Vérifie si une réponse a déjà été envoyée
      if (!res.headersSent) {
        // Répond avec un message d'erreur générique
        res.status(500).json({
          error: "Une erreur s'est produite lors de la création du produit.",
        });
      }
    });
};

// Fonction qui supprime un produit (panneau d'administration)
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Vérifie d'abord si le produit existe
    const product = await Product.findById(productId);

    if (!product) {
      // Si le produit n'existe pas, retourne une erreur 404
      return res
        .status(404)
        .json({ error: "Le produit n'existe pas ou a déjà été supprimé !." });
    }

    // Supprime le produit de la base de données
    await Product.deleteOne({ _id: productId });

    // Répond avec un message de succès si la suppression est réussie
    return res
      .status(200)
      .json({ message: "Le produit a été supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression du produit :", error);

    // Répond avec un message d'erreur générique en cas d'échec
    return res.status(500).json({
      error: "Une erreur s'est produite lors de la suppression du produit.",
    });
  }
};
