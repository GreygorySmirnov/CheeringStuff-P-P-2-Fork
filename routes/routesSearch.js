const express = require('express');
const router = express.Router();

const searchController = require('../controller/searchController');

// Route pour effectuer une recherche
router.get('/search', searchController.getSearch);

module.exports = router