const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Demande = require('../models/Demande');

// Créer un Demande
router.post('/save', async (req, res) => {
  try {
    const demande = new Demande(req.body);
    await demande.save();
    res.status(201).json(demande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les Demandes
router.get('/all', async (req, res) => {
  try {
    const demandes = await Demande.find();
    res.json(demandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un Demande
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const demande = await Demande.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!demande) {
      return res.status(404).json({ message: 'Demande not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(demande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Demande
router.put('/update/:id', async (req, res) => {
  try {
    const demande = await Demande.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(demande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un Demande
router.delete('/delete/:id', async (req, res) => {
  try {
    await Demande.findByIdAndDelete(req.params.id);
    res.json({ message: "Demande supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { mecanicienId,type, datedebut,datefin } = req.query; 
    const filter = {};
    if (mecanicienId) {
      filter.mecanicienId = { $regex: mecanicienId, $options: 'i' }; 
    }
    if (type) {
      filter.type = { $regex: type, $options: 'i' }; 
    }
    if (datedebut) {
      filter.datedebut = { $gte: new Date(datedebut) }; 

    }
    if (datefin) {
      filter.datefin = { $lte: new Date(datefin) }; 
    }
    // Rechercher les demandes correspondants
    const demandes = await Demande.find(filter);

    res.status(200).json(demandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;