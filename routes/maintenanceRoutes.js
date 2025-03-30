const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Maintenance = require('../models/Maintenance');

// Créer un Maintenance
router.post('/save', async (req, res) => {
  try {
    const maintenance = new Maintenance(req.body);
    await maintenance.save();
    res.status(201).json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les Maintenances
router.get('/all', async (req, res) => {
  try {
    const maintenances = await Maintenance.find();
    res.json(maintenances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Lire toutes les maintenances par service
router.get('/service/maintenance/:idservice', async (req, res) => {
  try {
    const serviceId=req.params.idservice;
    const maintenances = await Maintenance.find({serviceId});
    res.json(maintenances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un Maintenance
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const maintenance = await Maintenance.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Maintenance
router.put('/update/:id', async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un Maintenance
router.delete('/delete/:id', async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ message: "Maintenance supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;