const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Client = require('../models/Client');

// Créer un Client
router.post('/save', async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
router.put('/update/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
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

module.exports = router;