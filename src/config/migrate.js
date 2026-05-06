require('dotenv').config();
const sequelize = require('./database');

// Import all models to register them
require('../models');

async function migrate() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion établie.');

    console.log('🔄 Synchronisation des modèles...');
    // force: false → ne supprime pas les tables existantes
    // alter: true  → met à jour les colonnes si nécessaire
    await sequelize.sync({ alter: true });
    console.log('✅ Migrations terminées avec succès.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur de migration :', error);
    process.exit(1);
  }
}

migrate();