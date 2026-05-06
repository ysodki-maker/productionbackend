const r = require('../utils/response');

// ── 404 – Route introuvable ────────────────────────────────────
const notFound = (req, res, _next) => {
  return r.error(res, `Route introuvable : ${req.method} ${req.originalUrl}`, 404);
};

// ── Gestionnaire global d'erreurs ─────────────────────────────
const errorHandler = (err, req, res, _next) => {
  console.error(`[ErrorHandler] ${req.method} ${req.originalUrl}`, err);

  // Erreur Multer (upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return r.badRequest(res, 'Fichier trop volumineux. Limite : 5 Mo.');
  }
  if (err.message && err.message.includes('Extension non autorisée')) {
    return r.badRequest(res, err.message);
  }

  // Erreur Sequelize
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return r.badRequest(res, 'Erreur de validation.', messages);
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return r.badRequest(res, 'Référence invalide : la ressource liée est introuvable.');
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return r.conflict(res, 'Cette valeur existe déjà.');
  }

  // Erreur générique
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Une erreur interne est survenue.'
    : err.message;

  return r.error(res, message, statusCode);
};

module.exports = { notFound, errorHandler };