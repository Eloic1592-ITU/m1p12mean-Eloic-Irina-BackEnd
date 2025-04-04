const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Rendezvous = require('../models/Rendezvous');
const RendezvousClient = require('../models/rendezvous_client');
const { isDateAvailable, suggestAlternativeDates } = require('../utils/dateUtils');
const{getRendezvousStats} =require('./rendezvous/service');

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



// Fonction utilitaire pour obtenir le début et la fin du jour
const getDayRange = () => {
  const aujourdHui = new Date();
  const debutJour = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate()); // Début du jour (00:00:00.000)
  const finJour = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), aujourdHui.getDate(), 23, 59, 59, 999); // Fin du jour (23:59:59.999)
  return { debutJour, finJour };
};


// Trouver tous les rendez-vous d'un client pour la journée en cours
router.get('/client/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId;


    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: 'Format d\'ID client invalide' });
    }

    const { debutJour, finJour } = getDayRange();
    console.log('Aujourd\'hui :', new Date());
    console.log('Début du jour :', debutJour);
    console.log('Fin du jour :', finJour);

    const rendezvous = await Rendezvous.find({
      clientId,
      dateheure: {
        $gte: debutJour, // Rendez-vous après le début du jour
        $lt: finJour    // Rendez-vous avant la fin du jour
      }
    }).populate('clientId');

    if (!rendezvous || rendezvous.length === 0) {
      return res.status(404).json({ message: 'Aucun rendez-vous trouvé pour ce client aujourd\'hui' });
    }

      // Simuler une notification
      const notification = {
        message: `Vous avez ${rendezvous.length} rendez-vous aujourd'hui : ${rendezvous.map(rdv => rdv.service).join(', ')}`,
        rendezvous
      };
      
      res.json(notification);
      } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous :', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Route pour vérifier la disponibilité d'une date et suggérer des alternatives
router.post('/disponibilite', async (req, res) => {
  try {
    const { clientId,dateheure,description,statut } = req.body // La date doit être envoyée dans le corps de la requête
    console.log(dateheure);
    // Convertir la date en objet Date
    const selectedDate = new Date(dateheure);
    console.log(selectedDate);

    // Vérifier si la date est disponible
    const isAvailable = await isDateAvailable(selectedDate);

    if (isAvailable) {
      const rendezvous = new Rendezvous({
        dateheure: selectedDate,
        clientId,
        description,
        statut,
      });
      await rendezvous.save(rendezvous);
      return res.json({ available: true, message: 'La date est disponible.' });
    } else {
      // Suggérer des dates alternatives
      const alternatives = await suggestAlternativeDates(selectedDate);
      return res.json({ available: false, message: 'La date n\'est pas disponible.', alternatives });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { clientnom,dateheure } = req.query; 
    const filter = {};
    if(clientnom){
      filter.clientnom={ $regex: clientnom, $options: 'i' }; 
    }
    if (dateheure) {
      const startOfDaydateheure = new Date(dateheure);
      startOfDaydateheure.setHours(0, 0, 0, 0);

      const endOfDaydateheure = new Date(dateheure);
      endOfDaydateheure.setHours(23, 59, 59, 999); 

      filter.dateheure = { $gte: startOfDaydateheure, $lte: endOfDaydateheure };
    }
    // Rechercher les rendezvous correspondants
    const rendezvousclients = await RendezvousClient.find(filter);

    res.status(200).json(rendezvousclients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lire tous les Rendezvous pour chaque client
router.get('/rendezvous/client/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId; 
    const rendezvouss = await Rendezvous.find({clientId}).sort({ createdAt: -1 });
    res.json(rendezvouss);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lire tous les Rendezvous valide et non valide
router.get('/rendezvous/client', async (req, res) => {
  try {
    const rendezvouss = await RendezvousClient.find().sort({ createdAt: -1 });
    res.json(rendezvouss);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lire tous les Rendezvous valide et non valide
router.get('/rendezvous/valide', async (req, res) => {
  try {
    // Trouver tous les rendez-vous clients avec statut "Validé"
    const rendezvouss = await RendezvousClient.find({ statut: 'Validé' }).sort({ createdAt: -1,updatedAt:-1  });
    res.json(rendezvouss);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Statistique de rendezvous
router.get('/stats', async (req, res) => {
  try {
    const stats = await getRendezvousStats();
    res.json(stats);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;