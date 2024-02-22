const express = require('express');
const router = express.Router();
const ProductController = require('../controller/productController');
const authId = require('../middleware/auth_id');
const authAdmin = require('../middleware/authAdmin');


// Route pour obtenir la liste des produits (accessible par tous les utilisateurs)
router.get('/products',   ProductController.getProducts);

// Route pour obtenir un produit spécifique par son ID (accessible par un utilisateur authentifié)
router.get('/products/:id', authId, ProductController.getProductById);

// Route pour mettre à jour un produit (accessible par un administrateur)
router.put('/products/:id', authAdmin,  ProductController.updateProduct);

// Route pour créer un nouveau produit (accessible par un administrateur)
router.post('/products', authAdmin,  ProductController.createProduct);

// Route pour supprimer un produit (accessible par un administrateur)
router.delete('/products/:id', authAdmin, ProductController.deleteProduct);


module.exports = router;