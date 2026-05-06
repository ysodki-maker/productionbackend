const { validationResult } = require('express-validator');
const { ProductionStatus } = require('../models');
const r = require('../utils/response');

// ── GET /statuses ──────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.active !== 'false') where.is_active = true; // Actifs par défaut

    const statuses = await ProductionStatus.findAll({
      where,
      order: [['order', 'ASC'], ['name', 'ASC']],
    });
    return r.success(res, statuses);
  } catch (err) {
    console.error('[Status.getAll]', err);
    return r.error(res);
  }
};

// ── GET /statuses/:id ──────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const status = await ProductionStatus.findByPk(req.params.id);
    if (!status) return r.notFound(res, 'État de production introuvable.');
    return r.success(res, status);
  } catch (err) {
    console.error('[Status.getOne]', err);
    return r.error(res);
  }
};

// ── POST /statuses ─────────────────────────────────────────────
exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return r.badRequest(res, 'Données invalides.', errors.array());

  try {
    const { name, color, order } = req.body;

    // Si order non fourni, mettre en dernier
    let finalOrder = order;
    if (finalOrder === undefined) {
      const max = await ProductionStatus.max('order') || 0;
      finalOrder = max + 1;
    }

    const status = await ProductionStatus.create({ name, color, order: finalOrder });
    return r.created(res, status, 'État de production créé avec succès.');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return r.conflict(res, 'Un état avec ce nom existe déjà.');
    }
    console.error('[Status.create]', err);
    return r.error(res, "Erreur lors de la création de l'état.");
  }
};

// ── PUT /statuses/:id ──────────────────────────────────────────
exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return r.badRequest(res, 'Données invalides.', errors.array());

  try {
    const status = await ProductionStatus.findByPk(req.params.id);
    if (!status) return r.notFound(res, 'État de production introuvable.');

    const { name, color, order, is_active } = req.body;

    await status.update({
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
      ...(order !== undefined && { order }),
      ...(is_active !== undefined && { is_active }),
    });

    return r.success(res, status, 'État mis à jour avec succès.');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return r.conflict(res, 'Ce nom d\'état est déjà utilisé.');
    }
    console.error('[Status.update]', err);
    return r.error(res);
  }
};

// ── DELETE /statuses/:id ───────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const status = await ProductionStatus.findByPk(req.params.id);
    if (!status) return r.notFound(res, 'État de production introuvable.');

    await status.update({ is_active: false });
    return r.success(res, null, 'État désactivé avec succès.');
  } catch (err) {
    console.error('[Status.remove]', err);
    return r.error(res);
  }
};

// ── PUT /statuses/reorder ──────────────────────────────────────
// Réordonnancement en masse : [{ id: 1, order: 0 }, { id: 2, order: 1 }, ...]
exports.reorder = async (req, res) => {
  try {
    const { items } = req.body; // [{ id, order }]
    if (!Array.isArray(items)) return r.badRequest(res, 'items doit être un tableau.');

    await Promise.all(
      items.map(({ id, order }) =>
        ProductionStatus.update({ order }, { where: { id } })
      )
    );

    const updated = await ProductionStatus.findAll({ order: [['order', 'ASC']] });
    return r.success(res, updated, 'Ordre mis à jour.');
  } catch (err) {
    console.error('[Status.reorder]', err);
    return r.error(res);
  }
};