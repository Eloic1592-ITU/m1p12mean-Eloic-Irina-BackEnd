const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Evenement = require('../models/Evenement');

// Créer un Evenement
router.post('/', async (req, res) => {
  try {
    const evenement = new Evenement(req.body);
    await evenement.save();
    res.status(201).json(evenement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les Evenements
router.get('/all', async (req, res) => {
  try {
    const evenements = await Evenement.find();
    res.json(evenements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un Evenement
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const evenement = await Evenement.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!evenement) {
      return res.status(404).json({ message: 'Evenement not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(evenement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Evenement
router.put('/update/:id', async (req, res) => {
  try {
    const evenement = await Evenement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(evenement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un Evenement
router.delete('/delete/:id', async (req, res) => {
  try {
    await Evenement.findByIdAndDelete(req.params.id);
    res.json({ message: "Evenement supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;