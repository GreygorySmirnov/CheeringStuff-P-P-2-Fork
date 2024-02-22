const Product = require("../models/products");

// Fonction qui définit une route de recherche des produit par mot clé
exports.getSearch = (req, res) => {
  // Extraie le paramètre de requête 'q' (mot-clé)
  const { q } = req.query;

  // Conversion du mot-clé en une chaîne de caractères
  const searchString = String(q);

  // Recherche des produits qui correspondent au mot-clé dans certains champs
  Product.find({
    $or: [
      { NOPROD: { $regex: searchString, $options: "i" } },
      { DESCFRA: { $regex: searchString, $options: "i" } },
    ],
  })
    .select("NOPROD DESCFRA")
    .then((products) => {
      // Répond avec les produits correspondants
      res.status(200).json(products);
    })
    .catch((error) => {
      console.error(error);
      // Répond avec un statut 500 et un message d'erreur générique
      res.status(500).json({ error: "Une erreur est survenue !" });
    });
};
