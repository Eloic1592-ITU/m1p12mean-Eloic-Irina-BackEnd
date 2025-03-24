const mongoose = require('mongoose');

const Service_vehiculeSchema = new mongoose.Schema(
  {
    vehiculeId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicule", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Services", required: true },
    rendezvousId: { type: mongoose.Schema.Types.ObjectId, ref: "Rendezvous", required: true },
    datedebut: { type: Date, required: true },
    datefin: { type: Date, required: true },
    statut: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service_vehicule', Service_vehiculeSchema);