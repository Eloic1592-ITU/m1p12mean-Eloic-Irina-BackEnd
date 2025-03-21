const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Rendezvous = require('../models/Rendezvous');

// Créer un Rendezvous
router.post('/save', async (req, res) => {
  try {
    const rendezvous = new Rendezvous(req.body);
    await rendezvous.save();
    res.status(201).json(rendezvous);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les Rendezvous
router.get('/all', async (req, res) => {
  try {
    const rendezvouss = await Rendezvous.find();
    res.json(rendezvouss);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un Rendezvous
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const rendezvous = await Rendezvous.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!rendezvous) {
      return res.status(404).json({ message: 'Rendezvous not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(rendezvous);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Rendezvous
router.put('/update/:id', async (req, res) => {
  try {
    const rendezvous = await Rendezvous.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(rendezvous);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un Rendezvous
router.delete('/delete/:id', async (req, res) => {
  try {
    await Rendezvous.findByIdAndDelete(req.params.id);
    res.json({ message: "Rendezvous supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouvez tous les rendez-vous d'un client
router.get('/client/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const aujourdHui = new Date(); // Date actuelle
    console.log(aujourdHui);
    const debutJour = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate()); // Début du jour (00:00:00.000)
    const finJour = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate(), 23, 59, 59, 999); // Fin du jour (23:59:59.999)

    console.log(debutJour);
    console.log(finJour);

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID format' });
    }

    const rendezvous = await Rendezvous.find({ 
      clientId,
      dateheure: {
      $gte: debutJour, // Rendez-vous après le début du jour
      $lt: finJour    // Rendez-vous avant la fin du jour
  } }).populate('clientId');

    if (!rendezvous || rendezvous.length === 0) {
      return res.status(404).json({ message: 'Aucun  rendez vous trouve pour ce client' });
    }

    res.json(rendezvous);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;