const { generateToken } = require("../config/jwt");
const Admin = require("../models/Administrateur");
const Mecanicien = require("../models/Mecanicien");
const Client = require("../models/Client");
const express = require('express');
const { authmiddleware } = require("../middleware/authmiddleware");
const router = express.Router();
require('dotenv').config();

// Connexion
router.post('/login', async (req, res) => {
  const { email, motdepasse, role } = req.body;
  console.log(email+ motdepasse+role);
  let userModel;
  switch (role) {
    case "admin":
      userModel = Admin;
      break;
    case "mecanicien":
      userModel = Mecanicien;
      break;
    case "client":
      userModel = Client;
      break;
    default:
      return res.status(400).json({ message: "Rôle invalide" });
  }

  try {
    const user = await userModel.findOne({ email,motdepasse });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    const token = generateToken(user._id, role);
    console.log(token);
    res.json({ 
      token, 
      role,
      user: {
        id: user._id,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Déconnexion
router.post('/logout', (req, res) => {
  // Suppression de cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict"
  });
  res.json({ message: "Déconnexion réussie" });
});

// Route d'inscription
router.post("/register", async (req, res) => {
  const { nom, datenaissance, contact, email, motdepasse, image, adresse, specialite, role } = req.body;

  try {
    // Vérifier si l'email est déjà utilisé
    const existingClient = await Client.findOne({ email });
    const existingMecanicien = await Mecanicien.findOne({ email });

    if (existingClient || existingMecanicien) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    let user;

    // Créer un nouvel utilisateur en fonction du rôle
    if (role === "client") {
      user = new Client({ nom, datenaissance, contact, email, motdepasse, image });
    } else if (role === "mecanicien") {
      if (!adresse || !specialite) {
        return res.status(400).json({ message: "L'adresse et la spécialité sont requises pour les mécaniciens." });
      }
      user = new Mecanicien({ nom, datenaissance, adresse, contact, email, motdepasse, specialite, image });
    } else {
      return res.status(400).json({ message: "Rôle invalide." });
    }

    // Sauvegarder l'utilisateur dans la base de données
    await user.save();

    // Réponse réussie
    res.status(201).json({ message: "Utilisateur enregistré avec succès.", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;