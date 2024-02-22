// Importe le module jsonwebtoken pour la gestion des JWT
const jwt = require("jsonwebtoken");
// Récupère la clé secrète JWT depuis une variable d'environnement
const secretKey = process.env.JWT_SECRET;

// Middleware pour vérifier l'authentification de l'utilisateur
const authId = (req, res, next) => {
  // Récupère le token JWT depuis l'en-tête Authorization de la requête
  const token = req.headers.authorization?.split(" ")[1];

  try {
    // Vérifie si le token JWT existe dans l'en-tête de la requête
    if (token) {
      // Décrypte le token JWT à l'aide de la clé secrète
      const decodedToken = jwt.verify(token, secretKey);

      // Ajoute l'id de l'utilisateur décrypté à l'objet de requête
      req.user = {
        userId: decodedToken.userId,
      };
    }

    // Passe au middleware suivant
    next();
  } catch (error) {
    // Gère les erreurs lors du décryptage du token JWT
    console.error("Error decoding JWT token:", error);
    // Renvoi une réponse d'erreur avec un code 401 (Non autorisé)
    res.status(401).json({ error: "Erreur d'authentification Utilisateur !" });
  }
};

// Exporte le middleware pour qu'il puisse être utilisé dans d'autres fichiers
module.exports = authId;
