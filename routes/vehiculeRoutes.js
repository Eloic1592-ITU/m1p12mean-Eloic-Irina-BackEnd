const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Vehicule = require('../models/Vehicule');
const upload= require('../middleware/upload');

// Créer un Vehicule
// 2. Route unique gérant les 2 méthodes (FormData ET Base64)
router.post('/save', upload.single('image'), async (req, res) => {
  try {
    const { marque, modele, annee, Immatriculation, kilometrage, clientId, image } = req.body;
    // Sauvegarde en base de données
    const vehicule = new Vehicule({
      marque,
      modele,
      annee,
      Immatriculation,
      kilometrage,
      clientId,
      image: image || undefined 
    });

    await vehicule.save();
    res.status(201).json(vehicule);

  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ 
      message: error.message || 'Erreur lors de la création du véhicule' 
    });
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
router.put('/update/:id',upload.single('image'), async (req, res) => {
  try {
    const { imageBase64, ...updateData } = req.body;

    // Si nouvelle image est fournie
    if (imageBase64) {
      updateData.imageBase64 = imageBase64;
    }

    const updatedVehicule = await Vehicule.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } 
    );

    if (!updatedVehicule) {
      return res.status(404).json({ message: 'Véhicule non trouvé' });
    }

    res.json(updatedVehicule);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const vehicules = await Vehicule.find({clientId}).sort({createdAt: -1});
    res.json(vehicules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;