const router = require('express').Router();
const ctrl   = require('../controllers/shareController');
const { idParamValidator } = require('../validators');

// ── Routes admin (nécessitent l'ID du projet) ──────────────
// Génère un lien de révision
router.post('/projects/:id/share-link', idParamValidator, ctrl.generateShareLink);

// Révoque le lien
router.delete('/projects/:id/share-link', idParamValidator, ctrl.revokeShareLink);

// ── Routes publiques (accès via token) ─────────────────────
// Lit le projet (lecture seule)
router.get('/review/:token', ctrl.getProjectByToken);

// Modifie le projet (équipe via lien)
router.put('/review/:token', ctrl.updateByToken);

// Valide le projet (dimensions requises)
router.post('/review/:token/validate', ctrl.validateByToken);

module.exports = router;
