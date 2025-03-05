const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User=require('../models/Utilisateur');

// Créer un utilisateur
    router.post('/', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    });

// Lire tous les users
    router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

// Trouver 1 user par son ID
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Vérifier si l'ID est valide
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        // Convertir l'ID en ObjectId et rechercher l'utilisateur
        const user = await User.findById(id);

        // Si l'utilisateur n'est pas trouvé, renvoyer une erreur 404
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Renvoyer l'utilisateur trouvé
        res.json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

// Mettre à jour un user
    router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id,
        req.body, { new: true });
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
   });

// Supprimer un user
    router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Utilisateur supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
   });
   
module.exports = router;