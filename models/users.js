// Importe le module mongoose pour la modélisation des schémas MongoDB
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Expression régulière pour valider une adresse e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Définit le schéma de la collection "users" dans la base de données
const userSchema = new Schema(
  {
    // Prénom de l'utilisateur
    firstname: {
      type: String,
      required: false, // Le champ n'est pas obligatoire
      minlength: 3, // Longueur minimale du prénom
      maxlength: 50 // Longueur maximale du prénom
    },
    // Nom de famille de l'utilisateur
    lastname: {
      type: String,
      required: false, // Le champ n'est pas obligatoire
      minlength: 3, // Longueur minimale du nom de famille
      maxlength: 50 // Longueur maximale du nom de famille
    },
    // Adresse e-mail de l'utilisateur
    email: {
      type: String,
      required: true, // Le champ est obligatoire
      unique: true, // L'adresse e-mail doit être unique dans la collection
      maxlength: 50, // Longueur maximale de l'adresse e-mail
      validate: {
        // Validation personnalisée pour vérifier le format de l'adresse e-mail
        validator: function (value) {
          return emailRegex.test(value);
        },
        message: "Adresse e-mail invalide", // Message d'erreur personnalisé en cas de validation échouée
      }
    },
    // Ville de l'utilisateur
    city: {
      type: String,
      required: false, // Le champ n'est pas obligatoire
      maxlength: 50 // Longueur maximale de la ville
    },
    // Mot de passe de l'utilisateur
    password: {
      type: String,
      minlength: 6, // Longueur minimale du mot de passe
      required: true // Le champ est obligatoire
    },
    // Statut administrateur de l'utilisateur (true s'il est administrateur, false sinon)
    isAdmin: {
      type: Boolean,
      default: false // Valeur par défaut si le champ n'est pas défini lors de la création
    },
    // Statut d'activation de l'utilisateur (true s'il est actif, false sinon)
    isActive: {
      type: Boolean,
      default: true, // Valeur par défaut si le champ n'est pas défini lors de la création
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
