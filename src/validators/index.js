const { body, query, param } = require('express-validator');
const { PROJECT_TYPES } = require('../models/Project');
const { ProductionStatus, SupportType } = require('../models');

// ── Validators projet (création) ───────────────────────────────
// width/height/client_deadline sont OPTIONNELS à la création
const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est obligatoire.')
    .isLength({ min: 2, max: 200 }).withMessage('Le nom doit contenir entre 2 et 200 caractères.'),

  body('support_type_id')
    .notEmpty().withMessage('Le type de support est obligatoire.')
    .isInt({ min: 1 }).withMessage('support_type_id doit être un entier positif.')
    .custom(async (id) => {
      const support = await SupportType.findByPk(id);
      if (!support || !support.is_active) throw new Error('Type de support introuvable ou inactif.');
    }),

  body('project_type')
    .notEmpty().withMessage('Le type de projet est obligatoire.')
    .isIn(PROJECT_TYPES).withMessage(`Type de projet invalide. Valeurs : ${PROJECT_TYPES.join(', ')}.`),

  body('production_status_id')
    .notEmpty().withMessage("L'état de production est obligatoire.")
    .isInt({ min: 1 }).withMessage('production_status_id doit être un entier positif.')
    .custom(async (id) => {
      const status = await ProductionStatus.findByPk(id);
      if (!status || !status.is_active) throw new Error('État de production introuvable ou inactif.');
    }),

  body('google_drive_link')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage('Le lien Google Drive doit être une URL valide.'),

  // Dimensions : optionnelles à la création
  body('width')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0.001 }).withMessage('La largeur doit être un nombre positif > 0.'),

  body('height')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0.001 }).withMessage('La hauteur doit être un nombre positif > 0.'),

  body('client_deadline')
    .optional({ nullable: true, checkFalsy: true })
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('La date doit être au format YYYY-MM-DD.'),
];

// ── Validators projet (mise à jour) ────────────────────────────
const updateProjectValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Le nom ne peut pas être vide.')
    .isLength({ min: 2, max: 200 }),

  body('support_type_id')
    .optional()
    .isInt({ min: 1 }).withMessage('support_type_id invalide.')
    .custom(async (id) => {
      const support = await SupportType.findByPk(id);
      if (!support || !support.is_active) throw new Error('Type de support introuvable ou inactif.');
    }),

  body('project_type')
    .optional()
    .isIn(PROJECT_TYPES).withMessage(`Type invalide. Valeurs : ${PROJECT_TYPES.join(', ')}.`),

  body('production_status_id')
    .optional()
    .isInt({ min: 1 })
    .custom(async (id) => {
      const status = await ProductionStatus.findByPk(id);
      if (!status || !status.is_active) throw new Error('État introuvable ou inactif.');
    }),

  body('google_drive_link')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage('Le lien Google Drive doit être une URL valide.'),

  body('width')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0.001 }).withMessage('La largeur doit être un nombre positif > 0.'),

  body('height')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0.001 }).withMessage('La hauteur doit être un nombre positif > 0.'),

  body('client_deadline')
    .optional({ nullable: true, checkFalsy: true })
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('La date doit être au format YYYY-MM-DD.'),
];

// ── Validators support ─────────────────────────────────────────
const createSupportValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom du support est obligatoire.')
    .isLength({ min: 1, max: 100 }),

  body('image_url')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage("L'image doit être une URL valide."),
];

const updateSupportValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Le nom ne peut pas être vide.')
    .isLength({ min: 1, max: 100 }),

  body('image_url')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage("L'image doit être une URL valide."),

  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active doit être un booléen.'),
];

// ── Validators status ──────────────────────────────────────────
const createStatusValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage("Le nom de l'état est obligatoire.")
    .isLength({ min: 1, max: 100 }),

  body('color')
    .optional({ nullable: true })
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('La couleur doit être un code hex valide (ex: #FF5733).'),

  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage("L'ordre doit être un entier >= 0."),
];

const updateStatusValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Le nom ne peut pas être vide.')
    .isLength({ min: 1, max: 100 }),

  body('color')
    .optional({ nullable: true })
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('La couleur doit être un code hex valide.'),

  body('order')
    .optional()
    .isInt({ min: 0 }),

  body('is_active')
    .optional()
    .isBoolean(),
];

// ── Param & query validators ───────────────────────────────────
const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide.'),
];

const projectQueryValidator = [
  query('project_type').optional().isIn(PROJECT_TYPES),
  query('production_status_id').optional().isInt({ min: 1 }),
  query('support_type_id').optional().isInt({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort_by').optional().isIn(['name', 'client_deadline', 'surface', 'created_at']),
  query('order').optional().isIn(['ASC', 'DESC']),
];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
  createSupportValidator,
  updateSupportValidator,
  createStatusValidator,
  updateStatusValidator,
  idParamValidator,
  projectQueryValidator,
};