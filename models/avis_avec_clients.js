const mongoose = require('mongoose');

const AvisClientSchema = new mongoose.Schema(
  {
    clientId: {  type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    description: { type: String, required: true },
    note: { type: Number, required: true },
    servicevehiculeId: { type: mongoose.Schema.Types.ObjectId, ref: "Service_vehicule", required: true },
    statut: { type: String, required: true },
    clientNom:{ type: String, required: true },
    clientEmail:{ type: String, required: true },
    clientContact:{ type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Avis_avec_client', AvisClientSchema);