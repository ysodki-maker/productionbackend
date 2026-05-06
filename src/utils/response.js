/**
 * Helpers pour des réponses JSON cohérentes dans toute l'API.
 */

const success = (res, data, message = 'Succès', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data, message = 'Ressource créée avec succès') =>
  success(res, data, message, 201);

const noContent = (res) => res.status(204).send();

const error = (res, message = 'Erreur serveur', statusCode = 500, errors = null) =>
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });

const notFound = (res, message = 'Ressource introuvable') =>
  error(res, message, 404);

const badRequest = (res, message = 'Requête invalide', errors = null) =>
  error(res, message, 400, errors);

const conflict = (res, message = 'Conflit de données') =>
  error(res, message, 409);

const paginate = (res, rows, count, page, limit, message = 'Succès') =>
  res.status(200).json({
    success: true,
    message,
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(count / limit),
    },
  });

module.exports = { success, created, noContent, error, notFound, badRequest, conflict, paginate };