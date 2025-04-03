const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Evenement = require('../models/Evenement');
const upload= require('../middleware/upload');

// Créer un Evenement
router.post('/save',upload.single('image'), async (req, res) => {
    try {
    const { nom, description, datedebut, datefin, image } = req.body;
    // Sauvegarde en base de données
    const evenement = new Evenement({
      nom,
      description,
      datedebut,
      datefin,
      image: image || undefined 
    });

    await evenement.save();
    res.status(201).json(evenement);

  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ 
      message: error.message || 'Erreur lors de la création du evenement' 
    });
  }
});

// Lire tous les Evenements
router.get('/all', async (req, res) => {
  try {
    const evenements = await Evenement.find().sort({ createdAt: -1 });
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
router.put('/update/:id',upload.single('image'), async (req, res) => {
try {
    const { imageBase64, ...updateData } = req.body;
    // Si nouvelle image est fournie
    if (imageBase64) {
      updateData.imageBase64 = imageBase64 ;
    }
    
    const updateEvenement = await Evenement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } 
    );

    if (!updateEvenement) {
      return res.status(404).json({ message: 'Evenement non trouvé' });
    }

    res.json(updateEvenement);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

router.get('/search', async (req, res) => {
  try {
    const { nom,datedebut,datefin } = req.query; 
    const filter = {};
    if (nom) {
      filter.nom = { $regex: nom, $options: 'i' }; 
    }
    if (datedebut) {
      filter.datedebut = { $gte: new Date(datedebut) }; 

    }
    if (datefin) {
      filter.datefin = { $lte: new Date(datefin) }; 
    }
    // Rechercher les evenements correspondants
    const evenements = await Evenement.find(filter);

    res.status(200).json(evenements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;