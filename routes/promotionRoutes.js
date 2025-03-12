const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Promotion = require('../models/Promotion');

// Créer un Promotion
router.post('/save', async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les Promotions
router.get('/all', async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un Promotion
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const promotion = await Promotion.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Promotion
router.put('/update/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(promotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un Promotion
router.delete('/delete/:id', async (req, res) => {
  try {
    await Promotion.findByIdAndDelete(req.params.id);
    res.json({ message: "Promotion supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;