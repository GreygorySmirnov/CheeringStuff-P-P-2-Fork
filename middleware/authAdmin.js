const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;

// Middleware pour vérifier l'authentification de ladministateur
const authAdmin = (req, res, next) => {
  // Récupère le token JWT depuis l'en-tête Authorization de la requête
  const token = req.headers.authorization?.split(" ")[1];

  // Vérifie si le token JWT n'est pas présent dans la requête
  if (!token) {
    // Renvoie une réponse d'erreur avec un code 401 (Non autorisé)
    return res.status(401).json({
      error: "Vous devez être administrateur pour effectuer cette opération !",
    });
  }

  try {
    // Décrypte le token JWT à l'aide de la clé secrète
    const decodedToken = jwt.verify(token, secretKey);

    // Initialise l'objet req.user s'il n'existe pas déjà
    req.user = req.user || {};
    // Ajoute l'information isAdmin à l'objet req.user à partir du token décrypté
    req.user.isAdmin = decodedToken.isAdmin;

    // Vérifie si l'utilisateur est un administrateur
    if (req.user.isAdmin !== true) {
      // Renvoi une réponse d'erreur avec un code HTTP 403 (Interdit)
      return res.status(403).json({ error: "Vous devez être administrateur." });
    }

    // Passe au middleware suivant
    next();
  } catch (error) {
    // Gère les erreurs lors du décryptage du token JWT
    console.error("Error decoding JWT token:", error);
    // Renvoi une réponse d'erreur avec un code 401 (Non autorisé)
    res.status(401).json({
      error: "Vous devez être administrateur pour effectuer cette opération !",
    });
  }
};

// Exporte le middleware pour qu'il puisse être utilisé dans d'autres fichiers
module.exports = authAdmin;
