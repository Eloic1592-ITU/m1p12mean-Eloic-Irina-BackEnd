const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Vehicule = require('../models/Vehicule');

// Créer un Vehicule
router.post('/save', async (req, res) => {
  try {
    const vehicule = new Vehicule(req.body);
    await vehicule.save();
    res.status(201).json(vehicule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les Vehicules
router.get('/all', async (req, res) => {
  try {
    const vehicules = await Vehicule.find();
    res.json(vehicules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un Vehicule
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const vehicule = await Vehicule.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!vehicule) {
      return res.status(404).json({ message: 'Vehicule not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(vehicule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Vehicule
router.put('/update/:id', async (req, res) => {
  try {
    const vehicule = await Vehicule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(vehicule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un Vehicule
router.delete('/delete/:id', async (req, res) => {
  try {
    await Vehicule.findByIdAndDelete(req.params.id);
    res.json({ message: "Vehicule supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { Immatriculation,marque,modele } = req.query; 
    const filter = {};
    if(Immatriculation){
      filter.Immatriculation={ $regex: Immatriculation, $options: 'i' }; 
    }
    if(marque){
      filter.marque={ $regex: marque, $options: 'i' }; 
    }
    if(modele){
      filter.modele={ $regex: modele, $options: 'i' }; 
    }
    // Rechercher les vehicules correspondants
    const vehicule = await Vehicule.find(filter);

    res.status(200).json(vehicule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un Vehicule
router.get('/client/:clientId', async (req, res) => {
  try {
    const clientId=req.params.clientId;
    const vehicules = await Vehicule.find({clientId});
    res.json(vehicules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;