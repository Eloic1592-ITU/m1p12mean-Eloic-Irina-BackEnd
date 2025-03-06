const fs = require('fs');
const path = require('path');

// Demande les informations à l'utilisateur
const modelName = process.argv[2];
const fields = process.argv[3];

if (!modelName || !fields) {
  console.error('Usage: node generate-model.js <modelName> <fields>');
  console.error('Example: node generate-model.js Product "name:String, price:Number, description:String, inStock:Boolean"');
  process.exit(1);
}

// Parse les champs
const fieldsArray = fields.split(',').map((field) => {
  const [name, type] = field.trim().split(':');
  return { name, type };
});

// Génère le contenu du modèle
const modelContent = `
const mongoose = require('mongoose');

const ${modelName}Schema = new mongoose.Schema(
  {
    ${fieldsArray.map((field) => `${field.name}: { type: ${field.type}, required: true }`).join(',\n    ')}
  },
  { timestamps: true }
);

module.exports = mongoose.model('${modelName}', ${modelName}Schema);
`;

// Génère le contenu des routes
const routesContent = `
const express = require('express');
const router = express.Router();
const ${modelName} = require('../models/${modelName}');

// Créer un ${modelName}
router.post('/', async (req, res) => {
  try {
    const ${modelName.toLowerCase()} = new ${modelName}(req.body);
    await ${modelName.toLowerCase()}.save();
    res.status(201).json(${modelName.toLowerCase()});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lire tous les ${modelName}s
router.get('/', async (req, res) => {
  try {
    const ${modelName.toLowerCase()}s = await ${modelName}.find();
    res.json(${modelName.toLowerCase()}s);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Trouver un ${modelName}
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    // Convertir l'ID en ObjectId et rechercher l'élément
    const ${modelName.toLowerCase()} = await ${modelName}.findById(id);

    // Si l'élément n'est pas trouvé, renvoyer une erreur 404
    if (!${modelName.toLowerCase()}) {
      return res.status(404).json({ message: '${modelName} not found' });
    }
    // Renvoyer l'élément trouvé
    res.json(${modelName.toLowerCase()});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rechercher un ou plusieurs ${modelName}(s)
router.get('/search', async (req, res) => {
  try {
    const query = {};
    // Ajouter des critères de recherche dynamiques
    for (const [key, value] of Object.entries(req.query)) {
      query[key] = value;
    }

    const ${modelName.toLowerCase()}s = await ${modelName}.find(query);
    res.json(${modelName.toLowerCase()}s);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un ${modelName}
router.put('/:id', async (req, res) => {
  try {
    const ${modelName.toLowerCase()} = await ${modelName}.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(${modelName.toLowerCase()});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un ${modelName}
router.delete('/:id', async (req, res) => {
  try {
    await ${modelName}.findByIdAndDelete(req.params.id);
    res.json({ message: "${modelName} supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
`;

// Crée le dossier `models` s'il n'existe pas
if (!fs.existsSync(path.join(__dirname, 'models'))) {
  fs.mkdirSync(path.join(__dirname, 'models'));
}

// Crée le dossier `routes` s'il n'existe pas
if (!fs.existsSync(path.join(__dirname, 'routes'))) {
  fs.mkdirSync(path.join(__dirname, 'routes'));
}

// Écrit le fichier du modèle
const modelPath = path.join(__dirname, 'models', `${modelName}.js`);
fs.writeFileSync(modelPath, modelContent.trim());

// Écrit le fichier des routes
const routesPath = path.join(__dirname, 'routes', `${modelName.toLowerCase()}Routes.js`);
fs.writeFileSync(routesPath, routesContent.trim());

// Met à jour le fichier server.js pour ajouter la nouvelle route
const serverPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverPath)) {
  let serverContent = fs.readFileSync(serverPath, 'utf8');

  // Vérifie si la route existe déjà
  const routePattern = new RegExp(`app\\.use\\('/${modelName.toLowerCase()}', require\\(\\.\\/routes\\/${modelName.toLowerCase()}Routes\\)\\)`);
  if (!routePattern.test(serverContent)) {
    // Trouve la ligne `app.listen` et ajoute la nouvelle route avant
    const updatedServerContent = serverContent.replace(
      /app\.listen\(.*\);/, // Trouve la ligne `app.listen`
      `app.use('/${modelName.toLowerCase()}s', require('./routes/${modelName.toLowerCase()}Routes'));\napp.listen(PORT, () => console.log(\`Serveur démarré sur le port \${PORT}\`));`
    );

    // Écrit le fichier server.js mis à jour
    fs.writeFileSync(serverPath, updatedServerContent);
    console.log(`Route pour "${modelName}" ajoutée dans server.js`);
  } else {
    console.log(`La route pour "${modelName}" existe déjà dans server.js`);
  }
} else {
  console.error('Le fichier server.js n\'existe pas dans la racine du projet.');
}

console.log(`Modèle "${modelName}" généré avec succès dans ${modelPath}`);
console.log(`Routes pour "${modelName}" générées avec succès dans ${routesPath}`);