const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Avis = require('../models/Avis');
const Avisclient = require('../models/avis_avec_clients');

// Créer un Avis
router.post('/save', async (req, res) => {
  try {
    const avis = new Avis(req.body);
    await avis.save();
    res.status(201).json(avis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les Avis
router.get('/all', async (req, res) => {
  try {
    const avis = await Avis.find()
      .populate("clientId", "nom") 
      .select("note clientId description"); 

    res.json(avis);
  }  catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Trouver un Avis
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const avis = await Avis.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!avis) {
      return res.status(404).json({ message: 'Avis not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(avis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Avis
router.put('/update/:id', async (req, res) => {
  try {
    const avis = await Avis.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(avis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un Avis
router.delete('/delete/:id', async (req, res) => {
  try {
    await Avis.findByIdAndDelete(req.params.id);
    res.json({ message: "Avis supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { clientNom, date } = req.query; 
    const filter = {};

    if (clientNom) {
      filter.clientNom = { 
        $regex: clientNom, 
        $options: 'i' 
      };
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      filter.createdAt = { 
        $gte: startDate, 
        $lte: endDate 
      };
    }

    // Recherche avec pagination optionnelle
    const results = await Avisclient.find(filter)
      .sort({ createdAt: -1 }) 
      .limit(100);

    res.json(results);

  } catch (error) {
    console.error("Erreur recherche:", error);
    res.status(500).json({ 
      error: "Échec de la recherche",
      details: error.message 
    });
  }
});

router.get('/avis/:servicevehiculeId', async (req, res) => {
    try {
      const servicevehiculeId=req.params.servicevehiculeId;
      const results = await Avisclient.find({servicevehiculeId}).sort({createdAt:-1});
      res.json(results);
  
    } catch (error) {
      console.error("Erreur recherche:", error);
    }
});

module.exports = router;