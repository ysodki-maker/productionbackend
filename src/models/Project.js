const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PROJECT_TYPES = ['BAT', 'Production'];

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom du projet est obligatoire.' },
      len: { args: [2, 200], msg: 'Le nom doit contenir entre 2 et 200 caractères.' },
    },
  },
  support_type_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'support_types', key: 'id' },
  },
  project_type: {
    type: DataTypes.ENUM(...PROJECT_TYPES),
    allowNull: false,
    validate: {
      isIn: { args: [PROJECT_TYPES], msg: `Type de projet invalide. Valeurs : ${PROJECT_TYPES.join(', ')}` },
    },
  },
  production_status_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'production_statuses', key: 'id' },
  },
  google_drive_link: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: { msg: 'Le lien Google Drive doit être une URL valide.' },
    },
  },

  // ── Dimensions : optionnelles à la création, renseignées lors de la validation ──
  width: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
    defaultValue: null,
    validate: {
      isValidWidth(value) {
        if (value !== null && value !== undefined && value !== '') {
          if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
            throw new Error('La largeur doit être un nombre positif > 0.');
          }
        }
      },
    },
  },
  height: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
    defaultValue: null,
    validate: {
      isValidHeight(value) {
        if (value !== null && value !== undefined && value !== '') {
          if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
            throw new Error('La hauteur doit être un nombre positif > 0.');
          }
        }
      },
    },
  },
  // Calculé automatiquement — null tant que les dimensions ne sont pas renseignées
  surface: {
    type: DataTypes.DECIMAL(14, 6),
    allowNull: true,
    defaultValue: null,
    comment: 'Surface en m² = width x height, calculé automatiquement',
  },

  client_deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: { msg: 'La date de délai doit être valide (YYYY-MM-DD).' },
    },
  },

  // Token unique pour le lien de révision partageable (sans auth)
  review_token: {
    type: DataTypes.STRING(64),
    allowNull: true,
    unique: true,
    defaultValue: null,
  },

  // Expiration du lien de révision
  review_token_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'projects',
  indexes: [
    { fields: ['name'] },
    { fields: ['project_type'] },
    { fields: ['production_status_id'] },
    { fields: ['client_deadline'] },
  ],
  hooks: {
    beforeCreate(project) {
      project.surface = calculateSurface(project.width, project.height);
    },
    beforeUpdate(project) {
      if (project.changed('width') || project.changed('height')) {
        project.surface = calculateSurface(project.width, project.height);
      }
    },
  },
});

function calculateSurface(width, height) {
  const w = parseFloat(width);
  const h = parseFloat(height);
  if (!w || !h || isNaN(w) || isNaN(h)) return null;
  return parseFloat((w * h).toFixed(6));
}

module.exports = Project;
module.exports.PROJECT_TYPES = PROJECT_TYPES;