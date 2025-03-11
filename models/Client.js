const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    datenaissance: { type: Date, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    motdepasse: { type: String, required: true },
    image: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', ClientSchema);