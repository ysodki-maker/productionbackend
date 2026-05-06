const crypto = require('crypto');
const { Project, SupportType, ProductionStatus } = require('../models');
const r = require('../utils/response');

const PROJECT_INCLUDES = [
  { model: SupportType,      as: 'support', attributes: ['id', 'name', 'image_url'] },
  { model: ProductionStatus, as: 'status',  attributes: ['id', 'name', 'color', 'order'] },
];

/* ── Génère ou renouvelle le lien de révision ── */
exports.generateShareLink = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return r.notFound(res, 'Projet introuvable.');

    const token = crypto.randomBytes(32).toString('hex');
    await project.update({ review_token: token, review_token_expires_at: null });

    const frontendUrl = process.env.FRONTEND_URL || 'https://production.cosinus.ma';
    return r.success(res, {
      share_url: `${frontendUrl}/review/${token}`,
      token,
    }, 'Lien de révision généré.');
  } catch (err) {
    console.error('[Share.generate]', err);
    return r.error(res);
  }
};

/* ── Révoque le lien ── */
exports.revokeShareLink = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return r.notFound(res, 'Projet introuvable.');
    await project.update({ review_token: null, review_token_expires_at: null });
    return r.success(res, null, 'Lien révoqué.');
  } catch (err) {
    console.error('[Share.revoke]', err);
    return r.error(res);
  }
};

/* ── Lit le projet via token (accès public) ── */
exports.getProjectByToken = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { review_token: req.params.token },
      include: PROJECT_INCLUDES,
    });
    if (!project) return r.notFound(res, 'Lien invalide ou inexistant.');
    return r.success(res, project);
  } catch (err) {
    console.error('[Share.getByToken]', err);
    return r.error(res);
  }
};

/* ── Mise à jour complète via token ──
   Accepte TOUS les champs modifiables du projet.
   Permet aussi de revalider un projet déjà validé.
──────────────────────────────────────────────── */
exports.updateByToken = async (req, res) => {
  try {
    const project = await Project.findOne({ where: { review_token: req.params.token } });
    if (!project) return r.notFound(res, 'Lien invalide.');

    const {
      name,
      support_type_id,
      project_type,
      production_status_id,
      google_drive_link,
      width,
      height,
      client_deadline,
    } = req.body;

    const update = {};

    // Informations générales
    if (name !== undefined && name.trim())
      update.name = name.trim();

    if (support_type_id !== undefined) {
      const support = await SupportType.findByPk(support_type_id);
      if (!support) return r.badRequest(res, 'Type de support introuvable.');
      update.support_type_id = parseInt(support_type_id);
    }

    if (project_type !== undefined) {
      const { PROJECT_TYPES } = require('../models/Project');
      if (!PROJECT_TYPES.includes(project_type))
        return r.badRequest(res, `Type de projet invalide. Valeurs : ${PROJECT_TYPES.join(', ')}`);
      update.project_type = project_type;
    }

    if (production_status_id !== undefined) {
      const status = await ProductionStatus.findByPk(production_status_id);
      if (!status) return r.badRequest(res, 'État de production introuvable.');
      update.production_status_id = parseInt(production_status_id);
    }

    if (google_drive_link !== undefined)
      update.google_drive_link = google_drive_link || null;

    // Dimensions
    if (width !== undefined)
      update.width = width ? (parseFloat(width) || null) : null;

    if (height !== undefined)
      update.height = height ? (parseFloat(height) || null) : null;

    // Délai
    if (client_deadline !== undefined)
      update.client_deadline = client_deadline || null;

    if (!Object.keys(update).length)
      return r.badRequest(res, 'Aucune donnée à mettre à jour.');

    await project.update(update);
    const updated = await Project.findByPk(project.id, { include: PROJECT_INCLUDES });
    return r.success(res, updated, 'Projet mis à jour.');
  } catch (err) {
    console.error('[Share.updateByToken]', err);
    return r.error(res);
  }
};

/* ── Validation / revalidation via token ──
   Permet de valider ET de revalider un projet
   déjà validé (modification des dimensions).
──────────────────────────────────────────── */
exports.validateByToken = async (req, res) => {
  try {
    const project = await Project.findOne({ where: { review_token: req.params.token } });
    if (!project) return r.notFound(res, 'Lien invalide.');

    const { width, height, client_deadline } = req.body;

    if (!width  || parseFloat(width)  <= 0) return r.badRequest(res, 'Largeur obligatoire pour valider.');
    if (!height || parseFloat(height) <= 0) return r.badRequest(res, 'Hauteur obligatoire pour valider.');

    // Revalidation acceptée même si déjà validé
    await project.update({
      width:           parseFloat(width),
      height:          parseFloat(height),
      client_deadline: client_deadline || null,
    });

    const updated = await Project.findByPk(project.id, { include: PROJECT_INCLUDES });
    return r.success(res, updated, 'Projet validé avec succès !');
  } catch (err) {
    console.error('[Share.validateByToken]', err);
    return r.error(res);
  }
};
