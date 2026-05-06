const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductionStatus = sequelize.define('ProductionStatus', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: "Le nom de l'état ne peut pas être vide." },
    },
  },
  // Couleur associée à l'état (hex), utile pour le frontend
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#6B7280',
    validate: {
      is: { args: /^#[0-9A-Fa-f]{6}$/, msg: 'La couleur doit être un code hexadécimal valide.' },
    },
  },
  // Ordre d'affichage dans les listes
  order: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'production_statuses',
  indexes: [{ fields: ['order'] }],
});

module.exports = ProductionStatus;