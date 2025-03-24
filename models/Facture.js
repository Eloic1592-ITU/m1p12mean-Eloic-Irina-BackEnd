const mongoose = require('mongoose');

const FactureSchema = new mongoose.Schema(
  {
    rendezvousId: { type: mongoose.Schema.Types.ObjectId, ref: "Rendezvous", required: true },
    statut: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Facture', FactureSchema);