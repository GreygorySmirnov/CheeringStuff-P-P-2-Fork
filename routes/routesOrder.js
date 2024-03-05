const express = require("express");
const router = express.Router();
const authId = require('../middleware/auth_id');
const authAdmin = require('../middleware/authAdmin');
const orderController = require("../controller/orderController");


// Route pour créer une nouvelle commande à partir d'un panier validé et supprimé
router.post("/orders", authId, orderController.validateCart);

// Route pour lister les commandes sur le panneau de bord de l'administrateur
router.get("/orders", authAdmin, orderController.getOrdersAdmin);

router.post("/orders/stripe", orderController.stripeConfrimOrder);

module.exports = router;



