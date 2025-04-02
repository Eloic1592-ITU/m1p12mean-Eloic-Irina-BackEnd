const mongoose = require('mongoose');

const DemandeMecaniciensSchema = new mongoose.Schema(
  {
    type:{ type: String, required: true },
    description:{ type: String, required: true },
    datedebut:{ type: Date, required: true },
    datefin:{ type: Date, required: true },
    description: { type: String, required: true },
    mecanicienId: { type: mongoose.Schema.Types.ObjectId, ref: "Mecanicien", required: true },
    mecaniciennom:{ type: String, required: true },
    mecanicienimage:{ type: String, default: 'assets/img/defaultavatar.png' },
    statut:{ type: String, required: true },
    createdAt:{ type: Date, required: true },
    updatedAt:{ type: Date, required: true }
},
);

module.exports = mongoose.model('Demande_mecaniciens', DemandeMecaniciensSchema);