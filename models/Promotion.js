const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    description: { type: String, required: true },
    datedebut: { type: Date, required: true },
    datefin: { type: Date, required: true },
    evenementId: { type: String, required: true },
    serviceId: { type: String, required: true },
    reduction: { type: Number, required: true },
    codepromo: { type: String, required: true },
    conditions: { type: String, required: true },
    image: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Promotion', PromotionSchema);