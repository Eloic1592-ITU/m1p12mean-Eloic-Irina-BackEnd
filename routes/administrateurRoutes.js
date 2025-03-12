const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Administrateur = require('../models/Administrateur');
const { json } = require('body-parser');

// Créer un Administrateur
router.post('/save', async (req, res) => {
  try {
    const administrateur = new Administrateur(req.body);
    await administrateur.save();
    res.status(201).json(administrateur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les Administrateurs
router.get('/all', async (req, res) => {
  try {
    const administrateurs = await Administrateur.find();
    res.json(administrateurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un Administrateur
router.get('/find/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const administrateur = await Administrateur.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!administrateur) {
      return res.status(404).json({ message: 'Administrateur not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(administrateur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Mettre à jour un Administrateur
router.put('/update/:id', async (req, res) => {
  try {
    const administrateur = await Administrateur.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(administrateur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un Administrateur
router.delete('/delete/:id', async (req, res) => {
  try {
    await Administrateur.findByIdAndDelete(req.params.id);
    res.json({ message: "Administrateur supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Connexion administrateur
// router.post('/login', async (req, res) => {
//   try {
//     const { email, motdepasse } = req.body;
//     // Trouver l'administrateur par email
//     const administrateur = await Administrateur.findOne({ email,motdepasse });

//     // Vérifier si l'administrateur existe
//     if (!administrateur) {
//       return res.status(404).json({ message: 'Administrateur non trouvé' });
//     }

//     // Si tout est valide, renvoyer une réponse réussie
//     res.json({ message: 'Connexion réussie', administrateur });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

module.exports = router;