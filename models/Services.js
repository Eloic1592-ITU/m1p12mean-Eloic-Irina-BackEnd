const mongoose = require('mongoose');

const ServicesSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    descriptioncourte: { type: String, required: true },
    descriptioncomplete: { type: String, required: true },
    prix: { type: Number, required: true },
    duree: { type: String, required: true },
    categorie: { type: String, required: true },
    image: { type: String, default: 'assets/img/nopicture.png' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Services', ServicesSchema);