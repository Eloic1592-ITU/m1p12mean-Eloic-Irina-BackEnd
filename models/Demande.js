const mongoose = require('mongoose');

const DemandeSchema = new mongoose.Schema(
  {
    mecanicienId: { type: mongoose.Schema.Types.ObjectId, ref: "Mecanicien", required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    datedebut: { type: Date, required: true },
    datefin: { type: Date, required: true },
    statut: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Demande', DemandeSchema);