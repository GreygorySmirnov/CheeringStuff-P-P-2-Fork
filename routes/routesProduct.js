const express = require('express');
const router = express.Router();
const ProductController = require('../controller/productController');
const authId = require('../middleware/auth_id');
const authAdmin = require('../middleware/authAdmin');


// Route pour obtenir la liste des produits (accessible par tous les utilisateurs)
router.get('/products',   ProductController.getProducts);

// Route pour obtenir un produit spécifique par son ID (accessible par un utilisateur authentifié)
router.get('/products/:id', authId, ProductController.getProductById);

module.exports = router;