const express = require("express");
const router = express.Router();
const authId = require("../middleware/auth_id");
const authAdmin = require("../middleware/authAdmin");
const orderController = require("../controller/orderController");

// Route pour lister les commandes sur le panneau de bord de l'administrateur
router.get("/orders", authAdmin, orderController.getOrdersAdmin);

// Route pour lister les commandes d'un utilisateur connecté
router.get("/orders/user", authId, orderController.getOrdersUser);

// Route pour créer une session Stripe pour le paiement
router.post("/orders/stripe", orderController.stripeConfrimOrder);

module.exports = router;
