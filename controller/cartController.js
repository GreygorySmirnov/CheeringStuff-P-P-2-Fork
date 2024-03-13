"use strict";

const User = require("../models/users");
const Product = require("../models/products");
const Order = require("../models/orders");
const Cart = require("../models/carts");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

    // Vérifier si un panier a été trouvé
    if (!cart) {
      return res
        .status(404)
        .json({ message: "Panier non trouvé pour cet utilisateur." });
    }

    // Vérifier si le panier contient des articles
    if (cart.itemsCart.length === 0) {
      return res
        .status(400)
        .json({ message: "Le panier de l'utilisateur est vide." });
    }

    // Construire les lignes d'articles pour la session de paiement
    const lineItems = [];
    for (const item of cart.itemsCart) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: "Produit introuvable." });
      }

      // Vérifier si la propriété PRIX4 existe et contient une valeur numérique
      if (!product.PRIX4 || isNaN(product.PRIX4)) {
        console.error(`Prix invalide pour le produit ${product.name}`);
        return res
          .status(400)
          .json({ message: "Prix invalide pour le produit" });
      }

      lineItems.push({
        price_data: {
          currency: "cad",
          product_data: {
            name: product.DESCFRA,
          },
          unit_amount: product.PRIX4 * 100, // Convertir le prix en centimes
        },
        quantity: item.quantity,
      });
    }

    // Vérifier si des articles valides ont été trouvés
    if (lineItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Aucun article valide trouvé dans le panier." });
    }

    // Créer une session de paiement avec Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        userId: userId,
        itemsCart: cart.itemsCart,
      },
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["CA"], // Pays où la livraison est autorisée
      },
      success_url: "http://localhost:3000/", // URL de redirection après le paiement réussi https://cheering-stuff-front-end.vercel.app
      cancel_url: "http://localhost:3000/cart", // URL de redirection en cas d'annulation du paiement https://cheering-stuff-front-end.vercel.app/cart
    });

    /*if (session.id) {
      // Créer la commande (Order) à partir du panier
      const newOrder = new Order({
        userId: req.user.userId,
        stripeCheckoutId: session.id,
        itemsCart: cart.itemsCart.map((item) => ({
          productId: item.product,
          quantity: item.quantity,
        })),
        status: "pending",
      });

      // Sauvegarder la commande dans la collection "Orders"
      await newOrder.save();
    }*/

    // Réponse avec l'URL de paiement
    res.status(200).json({ checkoutUrl: session.url });
  } catch (error) {
    console.error(
      "Erreur lors de la création de la session de paiement :",
      error
    );
    res.status(500).json({
      message:
        "Une erreur s'est produite lors de la création de la session de paiement.",
    });
  }
};
