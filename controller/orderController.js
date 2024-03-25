"use strict";

const Cart = require("../models/carts");
const Order = require("../models/orders");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Méthode pour confirmer une commande avec Stripe
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
        // Parse the itemsCart from the metadata
        itemsCart: JSON.parse(checkoutSession.metadata.itemsCart).map(
          (item) => ({
            productId: item.product,
            quantity: item.quantity,
          })
        ),
        totalAmount: checkoutSession.amount_total / 100,
        shipping: checkoutSession.shipping_details,
      });

      // Save the order
      await order.save();
      console.log(`Order ${order._id} has been created`);

      // Delete the cart, but first check if it exists
      const deletedCart = await Cart.findOneAndRemove({ userId: order.userId });
      if (deletedCart) {
        console.log(`Cart ${deletedCart._id} has been deleted`);
      }
      else {
        console.log(`Cart was already deleted`);
      }
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
