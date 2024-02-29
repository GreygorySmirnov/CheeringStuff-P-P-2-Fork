"use strict";

const User = require("../models/users");
const Product = require("../models/products");
const Cart = require("../models/carts");

// Méthode pour ajouter un produit dans le panier de l'utilisateur connecté et créer simultanément son panier
exports.addToCart = async (req, res) => {
  try {
    const { itemsCart, quantity } = req.body;

    // Recherche du produit
    const product = await Product.findById(itemsCart);
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable." });
    }

    // Recherche le panier de l'utilisateur ou le crée si aucun
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user.userId },
      { $setOnInsert: { userId: req.user.userId, itemsCart: [] } },
      { upsert: true, new: true }
    );

    // Vérifie si le produit est déjà dans le panier
    const existingCartItem = cart.itemsCart.find((cartItem) => {
      return cartItem.product.toString() === product._id.toString();
    });

    if (existingCartItem) {
      // Ajuster la quantité du produit s'il est déjà dans le panier
      existingCartItem.quantity += quantity;
    } else {
      // Ajouter le produit dans le panier avec la quantité si le produit n'est pas déjà dans le panier
      cart.itemsCart.push({ product, quantity });
    }

    // Enregistrer le panier
    await cart.save();

    res.status(200).json({
      message: "Le produit a été ajouté au panier avec succès.",
    });
  } catch (error) {
    console.error("Une erreur empêche d'ajouter un produit au panier.", error);
    res.status(500).json({
      error:
        error.message || "Une erreur empêche d'ajouter un produit au panier.",
    });
  }
};

// Supprimer un produit du panier de l'utilisateur connecté
exports.deleteFromCart = async (req, res) => {
  try {
    // Vérification de l'authentification de l'utilisateur
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    //Récupération de l'ID de l'utilisateur et du produit
    const userId = req.user.userId;
    const productId = req.params.productId;

    console.log("UserID:", userId);
    console.log("ProductID to delete:", productId);

    // Recherche du panier de l'utilisateur
    const userCart = await Cart.findOne({ userId: userId });

    if (!userCart) {
      return res.status(404).json({ message: "Panier introuvable." });
    }

    // Vérifier si le produit existe dans le panier
    const existingCartItem = userCart.itemsCart.find(
      (cartItem) => cartItem.product.toString() === productId
    );

    if (!existingCartItem) {
      return res
        .status(404)
        .json({ message: "Produit introuvable dans le panier." });
    }

    // Supprimer le produit du panier
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: userId },
      {
        $pull: { itemsCart: { product: productId } },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Le produit a été retiré du panier avec succès.",
    });
  } catch (error) {
    console.error(
      "Une erreur empêche de supprimer le produit du panier.",
      error
    );
    res.status(500).json({
      error:
        error.message ||
        "Une erreur empêche de supprimer le produit du panier.",
    });
  }
};

// Voir le cart de l'utilisateur connecté
exports.getCart = async (req, res) => {
  try {
    // Récupération de l'ID de l'utilisateur
    const userId = req.user.userId;

    // Recherche du panier de l'utilisateur
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Panier non trouvé" });
    }

    // Réponse avec le contenu du panier
    res.status(200).json({ cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération du panier de l'utilisateur",
    });
  }
};




exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Récupérer le panier de l'utilisateur depuis la base de données
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Panier non trouvé" });
    }

    // Construire les lignes d'articles pour la session de paiement
    const lineItems = cart.itemsCart.map(item => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.name,
      
          },
          unit_amount: item.product.price * 100, // Convertir le prix en centimes
        },
        quantity: item.quantity,
      };
    });

    // Créer une session de paiement avec Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://example.com/success', // URL de redirection après le paiement réussi
      cancel_url: 'https://example.com/cancel', // URL de redirection en cas d'annulation du paiement
    });

    res.status(200).json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Erreur lors de la création de la session de paiement :", error);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la création de la session de paiement."
    });
  }
};

