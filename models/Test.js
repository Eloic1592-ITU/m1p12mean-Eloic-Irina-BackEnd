const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    hobby: { type: Array, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', TestSchema);