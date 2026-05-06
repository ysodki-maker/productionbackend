const { validationResult } = require('express-validator');
const { SupportType } = require('../models');
const r = require('../utils/response');

// Construit l'URL complète d'une image uploadée
function buildImageUrl(req, filename) {
  const protocol = req.protocol;
  const host = req.get('host'); // ex: localhost:3000
  return `${protocol}://${host}/uploads/${filename}`;
}

// ── GET /supports ──────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.active === 'true')  where.is_active = true;
    if (req.query.active === 'false') where.is_active = false;

    const supports = await SupportType.findAll({
      where,
      order: [['name', 'ASC']],
    });
    return r.success(res, supports);
  } catch (err) {
    console.error('[Support.getAll]', err);
    return r.error(res);
  }
};

// ── GET /supports/:id ──────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const support = await SupportType.findByPk(req.params.id);
    if (!support) return r.notFound(res, 'Support introuvable.');
    return r.success(res, support);
  } catch (err) {
    console.error('[Support.getOne]', err);
    return r.error(res);
  }
};

// ── POST /supports ─────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const name = req.body?.name?.trim();

    if (!name) {
      return r.badRequest(res, 'Le nom du support est obligatoire.');
    }

    // Priorité : fichier uploadé > url fournie dans le body
    let finalImageUrl = null;
    if (req.file) {
      // Stocke l'URL complète pour un accès direct depuis n'importe quel client
      finalImageUrl = buildImageUrl(req, req.file.filename);
    } else if (req.body?.image_url) {
      finalImageUrl = req.body.image_url;
    }

    const support = await SupportType.create({ name, image_url: finalImageUrl });
    return r.created(res, support, 'Support créé avec succès.');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return r.conflict(res, 'Un support avec ce nom existe déjà.');
    }
    console.error('[Support.create]', err);
    return r.error(res, 'Erreur lors de la création du support.');
  }
};

// ── PUT /supports/:id ──────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const support = await SupportType.findByPk(req.params.id);
    if (!support) return r.notFound(res, 'Support introuvable.');

    const name      = req.body?.name?.trim();
    const image_url = req.body?.image_url;
    const is_active = req.body?.is_active;

    // Calcule la nouvelle image
    let finalImageUrl = support.image_url; // garde l'ancienne par défaut
    if (req.file) {
      finalImageUrl = buildImageUrl(req, req.file.filename);
    } else if (image_url !== undefined) {
      finalImageUrl = image_url || null; // chaîne vide → null
    }

    const updateData = { image_url: finalImageUrl };
    if (name)               updateData.name      = name;
    if (is_active !== undefined) updateData.is_active = is_active === 'true' || is_active === true;

    await support.update(updateData);

    // Recharge depuis la BDD pour retourner les données à jour
    await support.reload();
    return r.success(res, support, 'Support mis à jour avec succès.');
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return r.conflict(res, 'Ce nom de support est déjà utilisé.');
    }
    console.error('[Support.update]', err);
    return r.error(res, 'Erreur lors de la mise à jour du support.');
  }
};

// ── DELETE /supports/:id ───────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const support = await SupportType.findByPk(req.params.id);
    if (!support) return r.notFound(res, 'Support introuvable.');
    await support.update({ is_active: false });
    return r.success(res, null, 'Support désactivé avec succès.');
  } catch (err) {
    console.error('[Support.remove]', err);
    return r.error(res, 'Erreur lors de la suppression du support.');
  }
};