const express = require('express');
const router = express.Router();
const ProductController = require('../controller/productController');
const authId = require('../middleware/auth_id');

// CRUD des produits (Create Read Update Delete)
// Route pour OBTENIR (read) la liste des produits (accessible par tous les utilisateurs)
router.get('/products', ProductController.getProducts);

// Route pour OBTENIR (read) un produit spécifique par son ID (accessible par un utilisateur authentifié)
router.get('/products/:id', authId, ProductController.getProductById);

// Route pour AJOUTER (create) un produit spécifique par son ID (accessible par un utilisateur authentifié)
// router.post('/products/newProduct', authId, ProductController.createProductByTextFile);

// Route pour MODIFIER (update) un produit spécifique déjà existant par son ID (accessible par un utilisateur authentifié)
// (à venir) router.put('/products/:id', authId, ProductController.updateProductById);

// Route pour SUPPRIMER un produit spécifique déjà existant par son ID (accessible par un utilisateur authentifié)
// (à venir) router.delete('/products/:id', authId, ProductController.deleteProductById);

module.exports = router;