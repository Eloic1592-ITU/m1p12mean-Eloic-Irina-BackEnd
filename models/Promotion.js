const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    description: { type: String, required: true },
    datedebut: { type: Date, required: true },
    datefin: { type: Date, required: true },
    evenementId: { type: mongoose.Schema.Types.ObjectId, ref: "Evenement", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Services", required: true },
    reduction: { type: Number, required: true },
    codepromo: { type: String, required: false },
    conditions: { type: String, required: false },
    image: { type: String, default: 'assets/img/nopicture.png' }

  },
  { timestamps: true }
);

module.exports = mongoose.model('Promotion', PromotionSchema);