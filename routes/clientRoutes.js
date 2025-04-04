const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Client = require('../models/Client');
const {calculateClientRetention} =require('./client/service');
const upload= require('../middleware/upload');

// Créer un Client
router.post('/save',upload.single('image'), async (req, res) => {
 try {
    const { nom, datenaissance, contact, email, motdepasse, image } = req.body;
    // Sauvegarde en base de données
    const client = new Client({
      nom, 
      datenaissance, 
      contact, 
      email,
      motdepasse,
      image: image || undefined 
    });

    await client.save();
    res.status(201).json(client);

  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ 
      message: error.message || 'Erreur lors de la création du véhicule' 
    });
  }
});

// Lire tous les Clients
router.get('/all', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un Client
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const client = await Client.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Client
router.put('/update/:id',upload.single('image'), async (req, res) => {
    const { imageBase64, ...updateData } = req.body;
    try {
    // Si nouvelle image est fournie
    if (imageBase64) {
      updateData.imageBase64 = imageBase64;
    }

    const updateClient = await Client.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } 
    );

    if (!updateClient) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    res.json(updateClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer un Client
router.delete('/delete/:id', async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: "Client supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour rechercher des clients par nom
router.get('/search', async (req, res) => {
  try {
    const { nom, contact,email } = req.query; 
    const filter = {};
    if (nom) {
      filter.nom = { $regex: nom, $options: 'i' }; 
    }
    if (contact) {
      filter.contact = { $regex: contact, $options: 'i' }; 
    }
    if (email) {
      filter.email = { $regex: email, $options: 'i' }; 
    }

    // Rechercher les clients correspondants
    const clients = await Client.find(filter);

    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/client-retention', async (req, res) => {
  try {
    const rentention = await calculateClientRetention();
    res.json({
      success: true,
      data: rentention,
      message: "Chiffre d'affaires hebdomadaire récupéré avec succès"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;