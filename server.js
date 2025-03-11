const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Désactive le buffering des commandes MongoDB
mongoose.set('bufferCommands', false);

// Connexion à MongoDB
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connecté");

    // Démarrez le serveur Express une fois la connexion établie
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Serveur démarré sur le port ${process.env.PORT || 5000}`);
    });
  } catch (err) {
    console.error("Erreur de connexion à MongoDB :", err);
    process.exit(1); // Quitte l'application en cas d'erreur
  }
};

// Routes
app.use('/', require('./routes/testRoutes'));
app.use('/products', require('./routes/productRoutes'));

// Démarrez le serveur
startServer();

// Exportez l'application Express pour Vercel
module.exports = app;