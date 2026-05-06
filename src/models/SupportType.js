const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupportType = sequelize.define('SupportType', {
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
      notEmpty: { msg: 'Le nom du support ne peut pas être vide.' },
      len: { args: [1, 100], msg: 'Le nom doit contenir entre 1 et 100 caractères.' },
    },
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrlOrNull(value) {
        if (value !== null && value !== '') {
          // Accepte URL absolue ou chemin relatif upload
          if (!/^(https?:\/\/|\/uploads\/)/.test(value)) {
            throw new Error("L'image doit être une URL valide ou un chemin d'upload.");
          }
        }
      },
    },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'support_types',
  indexes: [{ fields: ['name'] }],
});

module.exports = SupportType;