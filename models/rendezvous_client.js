const mongoose = require('mongoose');

const RendezvousclientSchema = new mongoose.Schema(
  {
    dateheure:{ type: Date, required: true },
    description: { type: String, required: true },
    clientnom:{ type: String, required: true },
    clientimage:{ type: String, required: true },
    createdAt:{ type: Date, required: true },
    updatedAt:{ type: Date, required: true }


},
);

module.exports = mongoose.model('Rendezvous_client', RendezvousclientSchema);