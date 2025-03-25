const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Facture = require('../models/Facture');
const Service_vehicule = require('../models/Service_vehicule');
const{generateInvoiceData} =require('./facture/service');

// Créer un Facture
router.post('/save', async (req, res) => {
  try {
    const facture = new Facture(req.body);
    await facture.save();
    res.status(201).json(facture);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les Factures
router.get('/all', async (req, res) => {
  try {
    const factures = await Facture.find();
    res.json(factures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un Facture
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const facture = await Facture.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!facture) {
      return res.status(404).json({ message: 'Facture not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(facture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Facture
router.put('/update/:id', async (req, res) => {
  try {
    const facture = await Facture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(facture);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un Facture
router.delete('/delete/:id', async (req, res) => {
  try {
    await Facture.findByIdAndDelete(req.params.id);
    res.json({ message: "Facture supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir le services effectuees sur chaque vehicule
router.get('/rendezvous/services/:rendezvousId', async (req, res) => {
  try {
    const invoiceData = await generateInvoiceData(req.params.rendezvousId);
    res.status(200).json(invoiceData);
  } catch (error) {
    if (error.message === 'Aucun service trouvé pour ce rendez-vous') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Nouvelle route pour le PDF
router.get('/rendezvous/facture-pdf/:rendezvousId', async (req, res) => {
  try {
    const invoiceData = await generateInvoiceData(req.params.rendezvousId);
    const pdfBuffer = await generateInvoicePDF(invoiceData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture_${invoiceData.rendezvousId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    // Gestion des erreurs comme ci-dessus
  }
});


module.exports = router;