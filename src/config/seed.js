require('dotenv').config();
const sequelize = require('./database');
const { SupportType, ProductionStatus } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('🌱 Début du seeding...');

    // Supports par défaut
    const supports = [
      { name: 'Tissu', image_url: null },
      { name: 'Zénith', image_url: null },
      { name: 'Bâche', image_url: null },
      { name: 'Vinyle', image_url: null },
      { name: 'Papier', image_url: null },
    ];

    for (const s of supports) {
      await SupportType.findOrCreate({ where: { name: s.name }, defaults: s });
    }
    console.log('✅ Supports créés.');

    // États de production par défaut (ordonnés)
    const statuses = [
      { name: 'BAT', order: 1, color: '#FFA500' },
      { name: 'Prêt à produire', order: 2, color: '#3B82F6' },
      { name: 'En production', order: 3, color: '#8B5CF6' },
      { name: 'Terminé', order: 4, color: '#10B981' },
    ];

    for (const st of statuses) {
      await ProductionStatus.findOrCreate({ where: { name: st.name }, defaults: st });
    }
    console.log('✅ États de production créés.');

    console.log('🎉 Seeding terminé !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur seeding :', error);
    process.exit(1);
  }
}

seed();