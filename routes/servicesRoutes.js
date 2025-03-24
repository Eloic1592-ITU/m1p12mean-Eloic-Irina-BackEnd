const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Services = require('../models/Services');

// Créer un Services
router.post('/save', async (req, res) => {
  try {
    const services = new Services(req.body);
    await services.save();
    res.status(201).json(services);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les Servicess
router.get('/all', async (req, res) => {
  try {
    const servicess = await Services.find();
    res.json(servicess);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un Services
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const services = await Services.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!services) {
      return res.status(404).json({ message: 'Services not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Services
router.put('/update/:id', async (req, res) => {
  try {
    const services = await Services.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(services);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un Services
router.delete('/delete/:id', async (req, res) => {
  try {
    await Services.findByIdAndDelete(req.params.id);
    res.json({ message: "Services supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { nom,categorie,duree } = req.query; 
    const filter = {};
    if (nom) {
      filter.nom = { $regex: nom, $options: 'i' }; 
    }
    if (categorie) {
      filter.categorie = { $regex: categorie, $options: 'i' }; 
    }
    if (duree) {
      filter.duree = { $regex: duree, $options: 'i' };
    }
    // Rechercher les Services correspondants
    const services = await Services.find(filter);

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;