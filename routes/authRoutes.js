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
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Active secure en prod
      sameSite: "Strict", // Protège contre CSRF
      maxAge: 3600000 // 1h en millisecondes
    });

    res.json({ message: "Connexion réussie", role, userId: user._id });
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


module.exports = router;