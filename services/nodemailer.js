const nodemailer = require('nodemailer');
require('dotenv').config(); 

// Configurer le transporteur avec des variables d'environnement
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
});

module.exports = transporter;