const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true },
    description: { type: String, required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Services", required: true },
    categorie: { type: String, required: true },
    difficulte: { type: String, required: true },
    outilrequis: { type: Array, required: true },
    etapes: { type: Array, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Maintenance', MaintenanceSchema);