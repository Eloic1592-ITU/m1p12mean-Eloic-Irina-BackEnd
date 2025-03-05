const mongoose = require('mongoose');
const ArticleSchema = new mongoose.Schema({
 title: { type: String, required: true },
 content: { type: String, required: true },
 category: { type: String, required: true }
}, { timestamps: true });

// Exporte le modele Article afin qu'il soit appelable
module.exports = mongoose.model('Article', ArticleSchema);