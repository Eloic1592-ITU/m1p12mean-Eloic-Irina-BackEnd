const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Mecanicien = require('../models/Mecanicien');

// Créer un Mecanicien
router.post('/save', async (req, res) => {
  try {
    const mecanicien = new Mecanicien(req.body);
    await mecanicien.save();
    res.status(201).json(mecanicien);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les Mecaniciens
router.get('/all', async (req, res) => {
  try {
    const mecaniciens = await Mecanicien.find();
    res.json(mecaniciens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un Mecanicien
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const mecanicien = await Mecanicien.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!mecanicien) {
      return res.status(404).json({ message: 'Mecanicien not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(mecanicien);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Mecanicien
router.put('/update/:id', async (req, res) => {
  try {
    const mecanicien = await Mecanicien.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(mecanicien);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un Mecanicien
router.delete('/delete/:id', async (req, res) => {
  try {
    await Mecanicien.findByIdAndDelete(req.params.id);
    res.json({ message: "Mecanicien supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;