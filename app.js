"use strict";
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const imagesPath = path.join(__dirname, "images");
const ftp = require('ftp');
const fs = require('fs');
const AdmZip = require('adm-zip');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware pour ajouter les headers CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://api-cheeringstuff.onrender.com",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Vos routes et le reste de votre configuration
app.get("/", (req, res) => {
  res.send("Bienvenue sur votre API sécurisée.");
});

// Servir les images statiques depuis le dossier 'images'
app.use("/images", express.static(imagesPath));

// Importe les routes
const routesUser = require('./routes/routesUser');
const routesProduct = require('./routes/routesProduct');
const routesOrder = require('./routes/routesOrder');
const routesCart = require('./routes/routesCart');
const routesError = require('./routes/routesError');
const routesSearch = require('./routes/routesSearch');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const cronScriptFtp = require('./script/cronScriptFtp')

app.use(
  routesUser,
  routesProduct,
  routesSearch,
  routesCart,
  routesOrder,
  routesError
);

// Gestions des erreurs
const errorController = require("./controller/errorController");
app.use(errorController.logErrors);
app.use(errorController.get404);

// MONGODB -Connexion à la base de données

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log(
      "La connexion à la base de données est établie, http://localhost:3030"
    );

    app.listen(3030, () => {
      console.log("Le serveur écoute sur le port 3030");
    });
    cronScriptFtp.ftpCronConnect();
  })
  .catch((err) => {
    console.log("La connexion à la base de données a échoué", err);
  });

  
 