const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Promotion = require('../models/Promotion');
const upload= require('../middleware/upload');

// Créer un Promotion
router.post('/save',upload.single('image'), async (req, res) => {
    try {
    const { nom, description, datedebut, datefin,evenementId,serviceId,reduction,codepromo,conditions, image } = req.body;
    // Sauvegarde en base de données
    const promotion = new Promotion({
      nom,
      description,
      datedebut,
      datefin,
      evenementId,
      serviceId,
      reduction,
      codepromo,
      conditions,
      image: image || undefined 
    });

    await promotion.save();
    res.status(201).json(promotion);

  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ 
      message: error.message || 'Erreur lors de la création du promotion' 
    });
  }
});

// Lire tous les Promotions
router.get('/all', async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lire toutes les promotions par evenement
router.get('/evenement/promotions/:idevenement', async (req, res) => {
  try {
    const evenementId=req.params.idevenement;
    const promotions = await Promotion.find({evenementId}).sort({ createdAt: -1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Trouver un Promotion
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const promotion = await Promotion.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Promotion
router.put('/update/:id',upload.single('image'), async (req, res) => {
try {
    const { imageBase64, ...updateData } = req.body;
    // Si nouvelle image est fournie
    if (imageBase64) {
      updateData.imageBase64 = imageBase64 ;
    }
    
    const updatePromotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } 
    );

    if (!updatePromotion) {
      return res.status(404).json({ message: 'Promotion non trouvé' });
    }

    res.json(updatePromotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer un Promotion
router.delete('/delete/:id', async (req, res) => {
  try {
    await Promotion.findByIdAndDelete(req.params.id);
    res.json({ message: "Promotion supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/search', async (req, res) => {
  try {
    const { nom,datedebut,datefin,promotionId } = req.query; 
    const filter = {};
    if (nom) {
      filter.nom = { $regex: nom, $options: 'i' }; 
    }
    if (datedebut) {
      const startOfDayDatedebut = new Date(datedebut);
      startOfDayDatedebut.setHours(0, 0, 0, 0);

      const endOfDayDatedebut = new Date(datedebut);
      endOfDayDatedebut.setHours(23, 59, 59, 999); 

      filter.datedebut = { $gte: startOfDayDatedebut, $lte: endOfDayDatedebut };
    }
    if (datefin) {
      const startOfDayDatefin = new Date(datefin);
      startOfDayDatefin.setHours(0, 0, 0, 0);

      const endOfDayDatefin = new Date(datefin);
      endOfDayDatefin.setHours(23, 59, 59, 999); 

      filter.datefin = { $gte: startOfDayDatefin, $lte: endOfDayDatefin };
    }
    if (promotionId) {
      filter.promotionId = { $lte: new Date(promotionId) }; 
    }
    // Rechercher les promotions correspondants
    const promotions = await Promotion.find(filter);

    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;