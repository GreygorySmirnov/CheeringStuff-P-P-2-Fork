const express = require("express");
const router = express.Router();

// Importation des controllers et middlewares
const userController = require("../controller/userController");
const authId = require("../middleware/auth_id");
const authAdmin = require("../middleware/authAdmin");

// Routes pour les opérations liées aux utilisateurs

// Route pour l'inscription d'un nouvel utilisateur
router.post("/signup", userController.getAddUser);

// Route pour la connexion d'un utilisateur existant
router.post("/login", userController.loginUser);

// Route pour obtenir la liste des utilisateurs (accessible par l'administrateur)
router.get("/users", authAdmin, userController.getListUsers);

// Route pour obtenir le profil de l'utilisateur authentifié
router.get("/users/profil", authId, userController.getUserProfil);

// Route pour obtenir un utilisateur spécifique par son ID (accessible par l'administrateur)
router.get("/users/:id", authAdmin, userController.getUserById);

// Route pour mettre à jour le profil de l'utilisateur authentifié
router.put("/users/:id", authId, userController.updateUser);

// Route pour désactiver ou réactiver un utilisateur (accessible par un administrateur)
router.put(
  "/users/:id/disable",
  authAdmin,
  userController.toggleUserActivation
);

// Route pour désactiver ou réactiver un utilisateur (Business Account) (accessible par un administrateur)
router.put(
  "/users/:id/businessAccount",
  authAdmin,
  userController.toggleUserIsBusiness
);

// Route pour la réinitialisation du mot de passe
router.post("/resetpassword", userController.forgotPassword);

module.exports = router;
