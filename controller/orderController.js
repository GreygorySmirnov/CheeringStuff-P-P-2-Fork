"use strict";

const Cart = require("../models/carts");
const Order = require("../models/orders");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/* Méthode qui est appelée quand l'utilisateur valide son panier. Elle crée une commande avec les informations 
   du panier et supprime le panier de la collection dans la base de données simultanément. */
exports.validateCart = async (req, res) => {
  try {
    // Vérifier l'authentification de l'utilisateur
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    // S'assurer que itemsCart est une chaîne d'ID de panier
    const itemsCartId = req.body.itemsCart;
    if (typeof itemsCartId !== "string") {
      return res
        .status(400)
        .json({ message: "Le format de itemsCart est incorrect." });
    }

    // Recherche du panier dans la base de données à partir de l'ID
    const userCart = await Cart.findOne({
      _id: itemsCartId,
      userId: req.user.userId,
    });

    if (!userCart) {
      return res.status(404).json({ message: "Panier introuvable." });
    }

    // Créer la commande (Order) à partir du panier
    const order = new Order({
      userId: req.user.userId,
      itemsCart: userCart.itemsCart.map((item) => ({
        productId: item.product,
        quantity: item.quantity,
      })),
    });

    // Sauvegarder la commande dans la collection "Orders"
    await order.save();

    // Supprimer du panier de l'utilisateur
    await Cart.findOneAndRemove({ _id: itemsCartId, userId: req.user.userId });

    res.status(200).json({
      message: "La commande a été validée avec succès.",
    });
  } catch (error) {
    console.error("Une erreur empêche de valider le panier.", error);
    res.status(500).json({
      error: error.message || "Une erreur empêche de valider le panier.",
    });
  }
};

exports.stripeConfrimOrder = async (req, res) => {
  // https://dashboard.stripe.com/webhooks/create?endpoint_location=hosted&events=checkout.session.async_payment_succeeded%2Ccheckout.session.completed%2Ccheckout.session.async_payment_failed%2Ccheckout.session.expired
  const event = req.body;

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.expired"
  ) {
    const checkoutSession = event.data.object;

    try {
      // Create the order
      const order = new Order({
        userId: checkoutSession.metadata.userId,
        itemsCart: checkoutSession.metadata.itemsCart.map((item) => ({
          productId: item.product,
          quantity: item.quantity,
        })),
        /*payment: {
          stripeCheckoutSessionId: checkoutSession.id,
          paymentMethod: checkoutSession.payment_method_types[0],
          paymentStatus: checkoutSession.payment_status,
          cardBrand: checkoutSession.payment_method_details.card.brand,
          cardNumber: checkoutSession.payment_method_details.card.last4,
        },*/
        totalAmount: checkoutSession.amount_total / 100,
        shipping: checkoutSession.shipping,
      });

      // Save the order
      await order.save();

      // Delete the cart
      const deletedCart = await Cart.findOneAndRemove({ userId: order.userId });
      console.log(`Cart ${deletedCart._id} has been deleted`);
    } catch (error) {
      console.error("An error occurred while creating the order", error);
      return res.status(500).json({
        error: "An error occurred while creating the order",
      });
    }
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};

// Méthode qui retourne les commandes des utilisateurs à l'administrateur
exports.getOrdersAdmin = async (req, res) => {
  try {
    // Vérifiez si l'utilisateur est administrateur (ajoutez votre logique d'authentification ici)
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        message:
          "Accès non autorisé. Seuls les administrateurs peuvent effectuer cette action.",
      });
    }

    // Récupérez toutes les commandes depuis la base de données
    const orders = await Order.find();

    // Envoyez la liste des commandes en tant que réponse
    res.status(200).json({ orders });
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de la récupération des commandes.",
      error
    );
    res.status(500).json({
      error: "Une erreur s'est produite lors de la récupération des commandes.",
    });
  }
};

// Méthode qui retourne les commandes de l'utilisateur connecté
exports.getOrdersUser = async (req, res) => {
  try {
    // Récupérez toutes les commandes de l'utilisateur depuis la base de données
    const orders = await Order.find({ userId: req.user.userId });

    // Envoyez la liste des commandes en tant que réponse
    res.status(200).json({ orders });
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de la récupération des commandes.",
      error
    );
    res.status(500).json({
      error: "Une erreur s'est produite lors de la récupération des commandes.",
    });
  }
};
