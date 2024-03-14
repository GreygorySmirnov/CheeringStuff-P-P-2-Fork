const bcrypt = require("bcrypt");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.JWT_SECRET;
const transporter = require("../services/nodemailer");

// Fonction de création de l'utilisateur (sign up)
exports.getAddUser = (req, res, next) => {
  var valide = true;
  var error = [];
  const { email, firstname, lastname, city, password } = req.body;

  // Vérifier si le mot de passe est assez long
  if (password.length < 10) {
    // Renvoyer une réponse d'erreur si le mot de passe est trop court
    valide = false;
    error.push("Le mot de passe doit contenir au moins 10 caractères.");
  }
  // Vérifier si le mot de passe contient au moins un chiffre
  if (!/\d/.test(password)) {
    valide = false;
    error.push("Le mot de passe doit contenir au moins un chiffre.");
  }
  // Vérifier si le mot de passe contient au moins une lettre majuscule
  if (!/[A-Z]/.test(password)) {
    valide = false;
    error.push("Le mot de passe doit contenir au moins une lettre majuscule.");
  }
  // Vérifier si le mot de passe contient au moins une lettre minuscule
  if (!/[a-z]/.test(password)) {
    valide = false;
    error.push("Le mot de passe doit contenir au moins une lettre minuscule.");
  }
  // Vérifier si le mot de passe contient au moins un caractère spécial
  if (!/\W/.test(password)) {
    valide = false;
    error.push("Le mot de passe doit contenir au moins un caractère spécial.");
  }

  if (valide === false) {
    return res.status(400).json({ error: error });
  }

  // Générer un hachage du mot de passe avec bcrypt
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      // Créer un nouvel objet utilisateur avec les données fournies
      const user = new User({
        email,
        firstname,
        lastname,
        city,
        password: hashedPassword,
        isAdmin: false,
      });

      // Sauvegarde de l'utilisateur dans la base de données
      user
        .save()
        .then((savedUser) => {
          // Renvoi les détails de l'utilisateur créé en cas de succès
          res.status(201).json(savedUser);
        })
        .catch((error) => {
          // Gestion des erreurs lors de la sauvegarde de l'utilisateur
          console.error("Erreur lors de la création de l'utilisateur:", error);
          // Gestion des erreurs spécifiques (déjà utilisé, validation, etc.)
          if (error.code === 11000) {
            res.status(500).json({ error: "Le courriel est déjà utilisé" });
          } else if (error.name === "ValidationError") {
            res.status(500).json({ error: error.message });
          } else {
            // Erreur générale en cas d'échec avec un code HTTP 500
            res.status(500).json({ error: "Une erreur est survenue !" });
          }
        });
    })
    .catch((error) => {
      // Gérer les erreurs lors de l'encryptage du mot de passe
      console.error("Erreur durant l'encryptage du mot de passe:", error);
      // Renvoyer une réponse d'erreur en cas d'échec de l'encryptage du mot de passe
      res.status(500).json({
        error: "Une erreur est survenue lors de la création du user.",
      });
    });
};

// Fonction de connexion de l'utilisateur (sign in)
exports.loginUser = (req, res) => {
  // Extraction des données du corps de la requête
  const { email, password } = req.body;

  // Recherche de l'utilisateur dans la base de données par son adresse e-mail
  User.findOne({ email })
    .then((user) => {
      // Vérifie si l'utilisateur existe
      if (!user) {
        return res.status(404).json({ error: "L'utilisateur n'existe pas" });
      }

      // Vérifie si le compte de l'utilisateur est actif
      if (user.isActive === false) {
        return res.status(401).json({
          error: "Votre compte a été désactivé par l'administrateur.",
        });
      }

      // Compare le mot de passe entré avec le hachage enregistré dans la base de données
      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          // Si les mots de passe ne correspondent pas, renvoyer une erreur d'identification invalide
          if (!isMatch) {
            return res.status(401).json({ error: "Identification invalide !" });
          }
          // Si les mots de passe correspondent, créer un token JWT
          const payload = { userId: user._id, isAdmin: user.isAdmin };
          // Renvoi le token et un message de succès
          const token = jwt.sign(payload, secretKey, { expiresIn: "240h" }); // remettre a 1h par la suite apres test
          // Renvoi la réponse avec le token et isAdmin
          res.status(200).json({
            token,
            isAdmin: user.isAdmin,
            message: `Vous êtes bien connecté ${user.firstname}!`,
          });
        })
        .catch((error) => {
          // Gère les erreurs lors de la comparaison du mot de passe
          console.error(
            "Erreur lors de la comparaison du mot de passe:",
            error
          );
          res.status(500).json({ error: "Une erreur est survenue !" });
        });
    })
    .catch((error) => {
      // Gère les erreurs lors de la recherche de l'utilisateur dans la base de données
      console.error("L'utilisateur est introuvable:", error);
      res.status(500).json({ error: "Une erreur est survenue !" });
    });
};

// Fonction pour récupérer la liste des utilisateurs
exports.getListUsers = (req, res) => {
  // Recherche tous les utilisateurs dans la base de données
  User.find()
    .then((users) => {
      // Mapper les données des utilisateurs pour créer une liste simplifiée
      const listUsers = users.map((user) => ({
        nameUser: user.firstname + " " + user.lastname,
        email: user.email,
        city: user.city,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        _id: user._id,
        createdAt: user.createdAt,
      }));
      // Renvoi la liste des utilisateurs sous forme de réponse JSON avec un code HTTP 200 (OK)
      res.status(200).json(listUsers);
    })
    .catch((error) => {
      // Gère les erreurs lors de la recherche des utilisateurs
      console.error(error);
      // Renvoi une réponse d'erreur avec un code HTTP 500 (Erreur interne du serveur)
      res.status(500).json({ error: "Une erreur est survenue !" });
    });
};

// Fonction pour récupérer un utilisateur par son id
exports.getUserById = (req, res) => {
  // Rechercher un utilisateur dans la base de données par son identifiant
  User.findById(req.params.id)
    .then((user) => {
      // Créer un objet utilisateur simplifié avec les données nécessaires
      const userObject = {
        fullname: `${user.firstname} ${user.lastname}`,
        email: user.email,
        city: user.city,
        _id: user._id,
      };

      // Renvoi l'objet utilisateur sous forme de réponse JSON avec un code HTTP 200 (OK)
      res.status(200).json(userObject);
    })
    .catch((error) => {
      // En cas d'erreur, renvoi une réponse d'erreur avec un code HTTP 500 (Erreur interne du serveur)
      res.status(500).json({
        error:
          "Une erreur s'est produite lors de la récupération de l'utilisateur.",
      });
    });
};

// Fonction pour récupérer le profil de l'utilisateur authentifié
exports.getUserProfil = (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ error: "Vous n'êtes pas autorisé à accéder à ce profil." });
  }
  // Récupère l'identifiant de l'utilisateur authentifié
  const userId = req.user.userId;

  // Recherche l'utilisateur dans la base de données par son identifiant
  User.findById(userId)
    .then((user) => {
      // Vérifie si l'utilisateur existe
      if (!userId) {
        // Renvoi une réponse d'erreur si l'utilisateur n'est pas autorisé à accéder au profil
        return res
          .status(401)
          .json({ error: "Vous n'êtes pas autorisé à accéder à ce profil." });
      }

      // Crée un objet userProfile avec les informations nécessaires du profil utilisateur
      const userProfile = {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        city: user.city,
        _id: user._id,
      };

      // Renvoi l'objet de profil utilisateur en JSON avec un code 200
      res.status(200).json(userProfile);
    })
    .catch((error) => {
      // En cas d'erreur, log l'erreur et renvoi une réponse d'erreur avec un code 500
      console.error("Error retrieving user profile:", error);
      res.status(500).json({
        error:
          "Une erreur est survenue lors de la récupération du profil utilisateur",
      });
    });
};

// Fonction pour mettre à jour le profil de l'utilisateur connecté
exports.updateUser = (req, res) => {
  // Retire le champ isAdmin et cart du corps de la requête
  delete req.body.isAdmin;
  delete req.body.cart;

  // Récupère l'id de l'utilisateur connecté
  const authenticatedUserId = req.user.userId;
  // Récupère l'id de l'utilisateur à mettre à jour depuis les paramètres de la requête
  const userIdToUpdate = req.params.id;

  // Vérifie si l'utilisateur connecté est le même que l'utilisateur à mettre à jour
  if (authenticatedUserId !== userIdToUpdate) {
    return res
      .status(401)
      .json({ error: "Vous n'êtes pas autorisé à modifier ce profil." });
  }

  var error = [];
  // Vérifie le mot de passe actuel de l'utilisateur
  User.findById(userIdToUpdate).then((user) => {
    bcrypt
      // Compare le mot de passe actuel de l'utilisateur avec le mot de passe fourni
      .compare(req.body.currentPassword, user.password)
      .then((isMatch) => {
        if (!isMatch) {
          return res
            .status(401)
            .json({ error: "Le mot de passe actuel est incorrect." });
        }

        // Si un nouveau mot de passe est fourni, générer un hash pour le nouveau mot de passe
        if (req.body.newPassword) {
          // Vérifier si le mot de passe est assez long
          if (req.body.newPassword.length < 10) {
            // Renvoyer une réponse d'erreur si le mot de passe est trop court
            valide = false;
            error.push("Le mot de passe doit contenir au moins 10 caractères.");
          }
          // Vérifier si le mot de passe contient au moins un chiffre
          if (!/\d/.test(req.body.newPassword)) {
            valide = false;
            error.push("Le mot de passe doit contenir au moins un chiffre.");
          }
          // Vérifier si le mot de passe contient au moins une lettre majuscule
          if (!/[A-Z]/.test(req.body.newPassword)) {
            valide = false;
            error.push(
              "Le mot de passe doit contenir au moins une lettre majuscule."
            );
          }
          // Vérifier si le mot de passe contient au moins une lettre minuscule
          if (!/[a-z]/.test(req.body.newPassword)) {
            valide = false;
            error.push(
              "Le mot de passe doit contenir au moins une lettre minuscule."
            );
          }
          // Vérifier si le mot de passe contient au moins un caractère spécial
          if (!/\W/.test(req.body.newPassword)) {
            valide = false;
            error.push(
              "Le mot de passe doit contenir au moins un caractère spécial."
            );
          }

          if (valide === false) {
            return res.status(400).json({ error: error });
          }

          // Générer le hash du nouveau mot de passe avec bcrypt
          bcrypt.hash(req.body.newPassword, 12, (error, hash) => {
            if (error) {
              console.error(
                "Erreur lors de la génération du hash du mot de passe :",
                error
              );
              // Renvoi une réponse d'erreur en cas d'échec de la génération du hash
              return res.status(500).json({
                error:
                  "Une erreur s'est produite lors de la mise à jour du profil de l'utilisateur.",
              });
            }

            // Remplace le mot de passe en clair par le hash dans req.body
            req.body.password = hash;

            // Appel de la fonction pour mettre à jour le profil de l'utilisateur
            updateUserProfil();
          });
        } else {
          /* Si aucun nouveau mot de passe n'est fourni, appeler directement la fonction 
          pour mettre à jour le profil de l'utilisateur */
          updateUserProfil();
        }
      })
      .catch((error) => {
        // Gère les erreurs lors de la comparaison du mot de passe
        console.error("Erreur lors de la comparaison du mot de passe :", error);
        // Renvoi une réponse d'erreur en cas d'échec de la comparaison du mot de passe
        res.status(500).json({
          error:
            "Une erreur s'est produite lors de la mise à jour du profil de l'utilisateur.",
        });
      });
  });

  // Fonction pour mettre à jour le profil de l'utilisateur
  function updateUserProfil() {
    // Utiliser findByIdAndUpdate pour mettre à jour l'utilisateur dans la base de données
    User.findByIdAndUpdate(userIdToUpdate, req.body, { new: true })
      .then((updatedUser) => {
        if (!updatedUser) {
          // Renvoi une réponse d'erreur si l'utilisateur n'est pas trouvé
          return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        // Renvoi les détails de l'utilisateur mis à jour en cas de succès avec un code HTTP 201 (Créé)
        res.status(201).json(updatedUser);
      })
      .catch((error) => {
        // Gère les erreurs lors de la mise à jour du profil de l'utilisateur
        console.error(
          "Erreur lors de la mise à jour du profil de l'utilisateur :",
          error
        );
        // Renvoyer une réponse d'erreur en cas d'échec de la mise à jour du profil
        res.status(500).json({
          error:
            "Une erreur s'est produite lors de la mise à jour du profil de l'utilisateur.",
        });
      });
  }
};

// Fonction pour gérer le processus de réinitialisation de mot de passe
exports.forgotPassword = async (req, res) => {
  // Extraire l'e-mail depuis le corps de la requête
  const { email } = req.body;

  try {
    // Vérifie si l'utilisateur existe dans la base de données
    const user = await User.findOne({ email });
    if (!user) {
      // Renvoi une réponse d'erreur si l'utilisateur n'existe pas
      return res.status(404).json({ error: "L'utilisateur n'existe pas" });
    }

    // Générer un token de réinitialisation du mot de passe
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "240h",
    }); // Remettre à 1h par la suite après test

    /* Enregistre le token et son expiration dans la base de données 
    pour l'utilisateur concerné (expire au bout de 240h) */
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 864000000; // remettre à 3600000 par la suite après test (1h)
    await user.save();

    // Configure les options du courriel de réinitialisation du mot de passe
    const mailOptions = {
      from: "cheeringstuff.db@gmail.com",
      to: user.email,
      subject: "Réinitialisation du mot de passe",
      html: `
        <h1>Réinitialisation du mot de passe</h1>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur ce <a href="http://localhost:3030/reset-password/${token}">lien</a> pour réinitialiser votre mot de passe.</p>
        <p>Ce lien expire dans 240 heures.</p>
      `,
    };

    // Envoyer le courriel de réinitialisation du mot de passe
    await transporter.sendMail(mailOptions);

    // Renvoi une réponse de succès avec un message indiquant l'envoi du courriel
    res
      .status(200)
      .json({ message: "Un courriel a été envoyé à l'adresse fournie." });
  } catch (error) {
    // Gère les erreurs lors de la réinitialisation du mot de passe
    console.error(
      "Erreur lors de la réinitialisation du mot de passe :",
      error
    );
    // Renvoi une réponse d'erreur avec un code HTTP 500 (Erreur interne du serveur)
    res.status(500).json({
      error:
        "Une erreur s'est produite lors de la réinitialisation du mot de passe.",
    });
  }
};

// Fonction pour activer ou désactiver un utilisateur
exports.toggleUserActivation = (req, res) => {
  // Récupérer l'id de l'utilisateur à activer/désactiver depuis les paramètres de la requête
  const userIdToToggle = req.params.id;

  // Recherche l'utilisateur dans la base de données par son id
  User.findById(userIdToToggle)
    .then((user) => {
      // Vérifie si l'utilisateur existe
      if (!user) {
        // Renvoi une réponse d'erreur si l'utilisateur n'est pas trouvé
        return res.status(404).json({ error: "Utilisateur introuvable." });
      }

      // Bascule le status isActive de l'utilisateur
      user.isActive = !user.isActive;

      // Détermine l'action effectuée (activation ou désactivation)
      const action = user.isActive ? "réactivé" : "désactivé";

      // Enregistrer les modifications dans la base de données
      user
        .save()
        .then(() => {
          // Renvoi une réponse de succès avec un message indiquant l'action effectuée
          res.status(200).json({
            message: `Le profil de l'utilisateur a été ${action} avec succès.`,
          });
        })
        .catch((error) => {
          // Gère les erreurs lors de l'enregistrement des modifications dans la base de données
          console.error(
            `Erreur lors de la ${action} du profil d'utilisateur :`,
            error
          );
          // Renvoi une réponse d'erreur avec un code 500
          res.status(500).json({
            error: `Une erreur s'est produite lors de la ${action} du profil de l'utilisateur.`,
          });
        });
    })
    .catch((error) => {
      // Gère les erreurs lors de la recherche de l'utilisateur dans la base de données
      console.error("Erreur lors de la recherche de l'utilisateur :", error);
      // Renvoi une réponse d'erreur avec un code 500
      res.status(500).json({
        error:
          "Une erreur s'est produite lors de la recherche de l'utilisateur.",
      });
    });
};
// Fonction pour activer ou desactiver un compte utilisateur isBusness
exports.toggleUserIsBusiness = (req, res) => {
  // Récupérer l'id de l'utilisateur à activer/désactiver depuis les paramètres de la requête
  const userIdToToggle = req.params.id;

  // Recherche l'utilisateur dans la base de données par son id
  User.findById(userIdToToggle)
    .then((user) => {
      // Vérifie si l'utilisateur existe
      if (!user) {
        // Renvoi une réponse d'erreur si l'utilisateur n'est pas trouvé
        return res.status(404).json({ error: "Utilisateur introuvable." });
      }

      // Bascule le status isBusiness de l'utilisateur
      user.isBusiness = !user.isBusiness;

      // Détermine l'action effectuée (activation ou désactivation)
      const action = user.isBusiness ? "Entreprise" : "Particulier";

      // Enregistrer les modifications dans la base de données
      user
        .save()
        .then(() => {
          // Renvoi une réponse de succès avec un message indiquant l'action effectuée
          res.status(200).json({
            message: `Le profil de l'utilisateur a été marqué comme ${action} avec succès.`,
          });
        })
        .catch((error) => {
          // Gère les erreurs lors de l'enregistrement des modifications dans la base de données
          console.error(
            `Erreur lors de la ${action} du profil d'utilisateur :`,
            error
          );
          // Renvoi une réponse d'erreur avec un code 500
          res.status(500).json({
            error: `Une erreur s'est produite lors de la ${action} du profil de l'utilisateur.`,
          });
        });
    })
    .catch((error) => {
      // Gère les erreurs lors de la recherche de l'utilisateur dans la base de données
      console.error("Erreur lors de la recherche de l'utilisateur :", error);
      // Renvoi une réponse d'erreur avec un code 500
      res.status(500).json({
        error:
          "Une erreur s'est produite lors de la recherche de l'utilisateur.",
      });
    });
};
