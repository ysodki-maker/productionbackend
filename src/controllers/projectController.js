const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Project, SupportType, ProductionStatus } = require('../models');
const r = require('../utils/response');

// ─── Attributs pour les inclusions ────────────────────────────
const PROJECT_INCLUDES = [
  { model: SupportType, as: 'support', attributes: ['id', 'name', 'image_url'] },
  { model: ProductionStatus, as: 'status', attributes: ['id', 'name', 'color', 'order'] },
];

// ── GET /projects ──────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const {
      project_type,
      production_status_id,
      support_type_id,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      order = 'DESC',
      search,
    } = req.query;

    const where = {};
    if (project_type) where.project_type = project_type;
    if (production_status_id) where.production_status_id = production_status_id;
    if (support_type_id) where.support_type_id = support_type_id;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: PROJECT_INCLUDES,
      order: [[sort_by, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
    });

    return r.paginate(res, rows, count, page, limit);
  } catch (err) {
    console.error('[Project.getAll]', err);
    return r.error(res, 'Erreur lors de la récupération des projets.');
  }
};

// ── GET /projects/:id ──────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, { include: PROJECT_INCLUDES });
    if (!project) return r.notFound(res, 'Projet introuvable.');
    return r.success(res, project);
  } catch (err) {
    console.error('[Project.getOne]', err);
    return r.error(res);
  }
};

// ── POST /projects ─────────────────────────────────────────────
exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return r.badRequest(res, 'Données invalides.', errors.array());

  try {
    const {
      name, support_type_id, project_type,
      production_status_id, google_drive_link,
      width, height, client_deadline,
    } = req.body;

    // La surface est calculée par le hook beforeCreate du modèle
    const project = await Project.create({
      name,
      support_type_id,
      project_type,
      production_status_id,
      google_drive_link,
      width,
      height,
      client_deadline,
    });

    // Recharge avec les associations pour la réponse
    const result = await Project.findByPk(project.id, { include: PROJECT_INCLUDES });
    return r.created(res, result, 'Projet créé avec succès.');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return r.conflict(res, 'Un projet avec ce nom existe déjà.');
    }
    console.error('[Project.create]', err);
    return r.error(res, 'Erreur lors de la création du projet.');
  }
};

// ── PUT /projects/:id ──────────────────────────────────────────
exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return r.badRequest(res, 'Données invalides.', errors.array());

  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return r.notFound(res, 'Projet introuvable.');

    const {
      name, support_type_id, project_type,
      production_status_id, google_drive_link,
      width, height, client_deadline,
    } = req.body;

    // Mise à jour partielle (PATCH-like via PUT)
    await project.update({
      ...(name !== undefined && { name }),
      ...(support_type_id !== undefined && { support_type_id }),
      ...(project_type !== undefined && { project_type }),
      ...(production_status_id !== undefined && { production_status_id }),
      ...(google_drive_link !== undefined && { google_drive_link }),
      ...(width !== undefined && { width }),
      ...(height !== undefined && { height }),
      ...(client_deadline !== undefined && { client_deadline }),
      // surface recalculée par le hook beforeUpdate si width/height changent
    });

    const result = await Project.findByPk(project.id, { include: PROJECT_INCLUDES });
    return r.success(res, result, 'Projet mis à jour avec succès.');
  } catch (err) {
    console.error('[Project.update]', err);
    return r.error(res, 'Erreur lors de la mise à jour du projet.');
  }
};

// ── DELETE /projects/:id ───────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return r.notFound(res, 'Projet introuvable.');

    await project.destroy();
    return r.noContent(res);
  } catch (err) {
    console.error('[Project.remove]', err);
    return r.error(res, 'Erreur lors de la suppression du projet.');
  }
};

// ── GET /projects/types ────────────────────────────────────────
exports.getProjectTypes = async (_req, res) => {
  const { PROJECT_TYPES } = require('../models/Project');
  return r.success(res, PROJECT_TYPES, 'Types de projets disponibles.');
};