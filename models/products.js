// Importe le module mongoose pour la modélisation des schémas MongoDB
const mongoose = require("mongoose");

// Définit le schéma de la collection "products" dans la base de données
const productSchema = new mongoose.Schema(
  {
    NOPROD: {
      // Identifiant unique du produit (Numéro de produit)
      type: String,
      required: true,
    },
    // Description française du produit
    DESCFRA: {
      type: String,
      required: true,
    },
    // Commenté car le champ DESCANG n'est pas utilisé dans le schéma
    /* DESCANG: {
        type: String,
        required: true
    }, */
    // Prix du produit (Niveau 1)
    PRIX: {
      type: String,
      required: true,
    },
    // Prix du produit (Niveau 2 à 7)
    PRIX2: {
      type: String,
      required: true,
    },
    PRIX3: {
      type: String,
      required: true,
    },
    PRIX4: {
      type: String,
      required: true,
    },
    PRIX5: {
      type: String,
      required: true,
    },
    PRIX6: {
      type: String,
      required: true,
    },
    PRIX7: {
      type: String,
      required: true,
    },
    // Quantité en stock du produit
    QTEMAIN: {
      type: Number,
      required: true,
    },
    // Pointeur vers une image du produit (URL)
    POINTIMAG: {
      type: [
        {
          type: String,
          maxLength: [
            255,
            "Veuillez entrer une URL d'image avec un maximum de 255 caractères",
          ],
        },
      ],
      default: [], // Valeur par défaut, un tableau vide
    },
  },
  { timestamps: true }
);

// Crée un modèle mongoose pour la collection "products" en utilisant le schéma défini
const Product = mongoose.model("Products", productSchema);

// Exporte le modèle pour qu'il puisse être utilisé dans d'autres fichiers
module.exports = Product;
