const mongoose = require('mongoose');

const AdministrateurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    email: { type: String, required: true },
    motdepasse: { type: String, required: true },
    image: { type: String, required: true }
  },
  { timestamps: true }
);

// Hash du mot de passe avant de sauvegarder
AdministrateurSchema.pre("save", async function (next) {
  if (this.isModified("motdepasse")) {
    this.motdepasse = await bcrypt.hash(this.motdepasse, 10);
  }
  next();
});

module.exports = mongoose.model('Administrateur', AdministrateurSchema);