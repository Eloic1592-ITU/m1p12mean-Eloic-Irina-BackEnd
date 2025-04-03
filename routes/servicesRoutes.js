const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Services = require('../models/Services');
const upload= require('../middleware/upload');
const {getPopularServicesStats,getWeeklyRevenue,getInterventionStats}=require('./service/service');

// Créer un Services
router.post('/save', upload.single('image'), async (req, res) => {
    try {
    const { nom, descriptioncourte, descriptioncomplete, prix, duree, categorie, image } = req.body;
    // Sauvegarde en base de données
    const service = new Services({
      nom,
      descriptioncourte,
      descriptioncomplete,
      prix,
      duree,
      categorie,
      image: image || undefined 
    });

    await service.save();
    res.status(201).json(service);

  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ 
      message: error.message || 'Erreur lors de la création du service' 
    });
  }
});

// Lire tous les Servicess
router.get('/all', async (req, res) => {
  try {
    const servicess = await Services.find().sort({ createdAt: -1 });
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
router.put('/update/:id',upload.single('image'), async (req, res) => {
try {
    const { imageBase64, ...updateData } = req.body;
    // Si nouvelle image est fournie
    if (imageBase64) {
      updateData.imageBase64 = imageBase64 ;
    }
    
    const updateService = await Services.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } 
    );

    if (!updateService) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    res.json(updateService);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

router.get('/services/popular', async (req, res) => {
  try {
    const stats = await getPopularServicesStats();
    res.json({
      success: true,
      data: stats,
      message: "Statistiques des services populaires récupérées avec succès"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Erreur lors de la récupération des statistiques"
    });
  }
});

router.get('/revenue/weekly', async (req, res) => {
  try {
    const revenueData = await getWeeklyRevenue();
    res.json({
      success: true,
      data: revenueData,
      message: "Chiffre d'affaires hebdomadaire récupéré avec succès"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


router.get('/intervention-stats', async (req, res) => {
  try {
    const result = await getInterventionStats();
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      total: result.data.totalInterventions,
      completed: result.data.finishedInterventions,
      inProgress: result.data.inProgressInterventions,
      completionRate: `${result.data.completionPercentage}%`,
      averageDuration: result.data.durationStats 
        ? `${result.data.durationStats.avgDuration.toFixed(2)} heures` 
        : "N/A",
      statusBreakdown: result.data.statusDistribution,
      message: "Statistiques des interventions récupérées avec succès"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
});


module.exports = router;