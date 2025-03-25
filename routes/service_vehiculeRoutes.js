const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Service_vehicule = require('../models/Service_vehicule');

// Créer un Service_vehicule
router.post('/save', async (req, res) => {
  try {
    const service_vehicule = new Service_vehicule(req.body);
    await service_vehicule.save();
    res.status(201).json(service_vehicule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les Service_vehicules
router.get('/all', async (req, res) => {
  try {
    const service_vehicules = await Service_vehicule.find();
    res.json(service_vehicules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un Service_vehicule
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const service_vehicule = await Service_vehicule.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!service_vehicule) {
      return res.status(404).json({ message: 'Service_vehicule not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(service_vehicule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Service_vehicule
router.put('/update/:id', async (req, res) => {
  try {
    const service_vehicule = await Service_vehicule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(service_vehicule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un Service_vehicule
router.delete('/delete/:id', async (req, res) => {
  try {
    await Service_vehicule.findByIdAndDelete(req.params.id);
    res.json({ message: "Service_vehicule supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir le services effectuees sur chaque vehicule
router.get('/vehicule/services/:vehiculeId', async (req, res) => {
  try {
    const vehiculeId = req.params.vehiculeId;
    const serviceVehicules = await Service_vehicule.find({vehiculeId})
      .populate({
        path: 'vehiculeId',
        select: 'Immatriculation marque modele'
      })
      .populate({
        path: 'serviceId',
        select: 'nom descriptioncourte prix duree' 
      });

    res.status(200).json(serviceVehicules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Obtenir le services effectuees sur chaque vehicule
router.get('/rendezvous/services/:rendezvousId', async (req, res) => {
  try {
    const rendezvousId = req.params.rendezvousId;
    const serviceVehicules = await Service_vehicule.find({rendezvousId})
      .populate({
        path: 'vehiculeId',
        select: 'Immatriculation marque modele'
      })
      .populate({
        path: 'serviceId',
        select: 'nom descriptioncourte' 
      });
   
    if (!serviceVehicules.length) {
      return res.status(404).json({ message: 'Aucun service trouvé pour ce rendez-vous' });
    }
    const response = {
      services: serviceVehicules,
      count: serviceVehicules.length,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;