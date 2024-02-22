"use strict";

exports.logErrors = (err, req, res, next) => {
  // Afficher l'erreur dans la console
  console.error(`Il y a une erreur ! ${err.stack}`);

  // Renvoie une réponse avec un statut 500 et un message d'erreur
  res.status(500).json({ error: "Quelque chose ne fonctionne pas !" });
};

exports.get404 = (req, res) => {
  // Renvoi une réponse avec un statut 404 et un message indiquant que la page n'a pas été trouvée
  res
    .status(404)
    .json({
      error:
        "Nous avons cherché de fond en comble, mais cette page ne semble pas exister!",
    });
};
