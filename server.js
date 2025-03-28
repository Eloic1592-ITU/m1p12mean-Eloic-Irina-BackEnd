const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Désactive le buffering des commandes MongoDB
mongoose.set('bufferCommands', true);

// Connexion a MongoDB
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
app.use('/admin', require('./routes/administrateurRoutes'));
app.use('/mecanicien', require('./routes/mecanicienRoutes'));
app.use('/client', require('./routes/clientRoutes'));
app.use('/service', require('./routes/servicesRoutes'));
app.use('/facture', require('./routes/factureRoutes'));
app.use('/rendezvous', require('./routes/rendezvousRoutes'));
app.use('/demande', require('./routes/demandeRoutes'));
app.use('/evenement', require('./routes/evenementRoutes'));
app.use('/promotion', require('./routes/promotionRoutes'));
app.use('/vehicule', require('./routes/vehiculeRoutes'));
app.use('/maintenance', require('./routes/maintenanceRoutes'));
app.use('/servicevehicule', require('./routes/service_vehiculeRoutes'));
app.use('/avis', require('./routes/avisRoutes'));
app.use('/auth', require('./routes/authRoutes'));

// Connexion a MongoDB
startServer();

// Exportez l'application Express pour Vercel
module.exports = app;