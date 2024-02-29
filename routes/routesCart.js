// Importe le module Express pour créer des routes
const express = require('express');

// Crée un objet Router d'Express pour définir les routes
const router = express.Router();

// Importe le contrôleur de panier
const cartController = require('../controller/cartController');

// Importe le middleware d'authentification par identifiant
const authId = require('../middleware/auth_id');

// Route pour obtenir le contenu du panier
router.get('/cart', authId, cartController.getCart); 

// Route pour supprimer un produit du panier
router.delete('/cart/:productId', authId, cartController.deleteFromCart); 

// Route pour créer un panier
router.post('/cart', authId, cartController.addToCart); 

// Route pour checkout
router.post('/cart/checkout', authId, cartController.createCheckoutSession);


// Exporte le router pour qu'il puisse être utilisé dans d'autres fichiers
module.exports = router;
 