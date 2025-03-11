const mongoose = require('mongoose');

const FactureSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true },
    rendezvousId: { type: String, required: true },
    servicesId: { type: Array, required: true },
    promotions: { type: Array, required: true },
    totalprix: { type: Number, required: true },
    statut: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Facture', FactureSchema);