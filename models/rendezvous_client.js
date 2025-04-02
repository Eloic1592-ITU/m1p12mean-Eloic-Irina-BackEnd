const mongoose = require('mongoose');

const RendezvousclientSchema = new mongoose.Schema(
  {
    dateheure:{ type: Date, required: true },
    description: { type: String, required: true },
    statut:{ type: String, required: true },
    clientId:{ type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    clientnom:{ type: String, required: true },
    clientimage:{ type: String, default: 'assets/img/defaultavatar.png' },
    createdAt:{ type: Date, required: true },
    updatedAt:{ type: Date, required: true }


},
);

module.exports = mongoose.model('Rendezvous_client', RendezvousclientSchema);