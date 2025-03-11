const mongoose = require('mongoose');

const VehiculeSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true },
    marque: { type: String, required: true },
    modele: { type: String, required: true },
    annee: { type: Number, required: true },
    Immatriculation: { type: String, required: true },
    kilometrage: { type: String, required: true },
    image: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicule', VehiculeSchema);