const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
 name: { type: String, required: true },
 age: { type: String, required: true },
 sex: { type: String, required: true },
 city: { type: String, required: true }
}, { timestamps: true });

// Exporte le modele Utilisateur afin qu'il soit appelable
module.exports = mongoose.model('Utilisateur', UserSchema);