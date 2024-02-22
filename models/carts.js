// Importe le module mongoose pour la modélisation des schémas MongoDB
const mongoose = require("mongoose");

// Importe la classe Schema de mongoose pour définir la structure du schéma
const Schema = mongoose.Schema;

// Définit le schéma de la collection "carts" dans la base de données
const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId, // Type ObjectId de mongoose pour représenter les identifiants MongoDB
      ref: "User", // Référence à la collection "users"
      required: true, // Le champ est obligatoire
    },
    // Liste des articles dans le panier avec leur quantité
    itemsCart: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true } // Ajoute des champs "createdAt" et "updatedAt"
);

// Crée un modèle mongoose pour la collection "carts" en utilisant le schéma défini
const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;

