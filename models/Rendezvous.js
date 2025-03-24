const mongoose = require('mongoose');

const RendezvousSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    dateheure: { type: Date, required: true },
    description: { type: String, required: true },
    statut: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rendezvous', RendezvousSchema);