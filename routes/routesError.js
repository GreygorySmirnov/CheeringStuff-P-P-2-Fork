// Importe le module Express pour créer des routes
const express = require('express');

// Crée un objet Router d'Express pour définir les routes
const router = express.Router();

// Importe des controllers et middlewares
const errorController = require('../controller/errorController');


// Route pour gérer les erreurs 404 (Page non trouvée)
router.get('*', errorController.get404);

// Exporte le router pour qu'il puisse être utilisé dans d'autres fichiers
module.exports = router

