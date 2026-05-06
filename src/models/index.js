const sequelize = require('../config/database');
const SupportType = require('./SupportType');
const ProductionStatus = require('./ProductionStatus');
const Project = require('./Project');

// ──────────────────────────────────────────────
//  Associations
// ──────────────────────────────────────────────

// Un projet appartient à un type de support
Project.belongsTo(SupportType, {
  foreignKey: 'support_type_id',
  as: 'support',
  onDelete: 'RESTRICT',   // empêche la suppression d'un support utilisé
  onUpdate: 'CASCADE',
});
SupportType.hasMany(Project, {
  foreignKey: 'support_type_id',
  as: 'projects',
});

// Un projet appartient à un état de production
Project.belongsTo(ProductionStatus, {
  foreignKey: 'production_status_id',
  as: 'status',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
ProductionStatus.hasMany(Project, {
  foreignKey: 'production_status_id',
  as: 'projects',
});

module.exports = {
  sequelize,
  SupportType,
  ProductionStatus,
  Project,
};