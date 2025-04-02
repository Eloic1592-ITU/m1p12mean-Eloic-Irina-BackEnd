const mongoose = require('mongoose');

const EvenementSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    description: { type: String, required: true },
    datedebut: { type: Date, required: true },
    datefin: { type: Date, required: true },
    image: { type: String, default: 'assets/img/nopicture.png' }
   },
  { timestamps: true }
);

module.exports = mongoose.model('Evenement', EvenementSchema);