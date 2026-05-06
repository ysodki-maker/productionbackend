require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');

// Import des modèles pour les associations
require('./models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Vérifie la connexion DB
    await sequelize.authenticate();
    console.log('✅ Connexion MySQL établie.');

    // Synchronise les modèles (en dev seulement ; en prod, utiliser migrate.js)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modèles synchronisés.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📋 Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur :', error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await sequelize.close();
  process.exit(0);
});

startServer();