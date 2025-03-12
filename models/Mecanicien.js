const mongoose = require('mongoose');

const MecanicienSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    datenaissance: { type: Date, required: true },
    adresse: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    motdepasse: { type: String, required: true },
    specialite: { type: String, required: true },
    image: { type: String, required: true }
  },
  { timestamps: true }
);
MecanicienSchema.pre("save", async function (next) {
  if (this.isModified("motdepasse")) {
    this.motdepasse = await bcrypt.hash(this.motdepasse, 10);
  }
  next();
});


module.exports = mongoose.model('Mecanicien', MecanicienSchema);