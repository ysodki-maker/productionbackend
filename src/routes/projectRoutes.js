const router = require('express').Router();
const ctrl = require('../controllers/projectController');
const {
  createProjectValidator,
  updateProjectValidator,
  idParamValidator,
  projectQueryValidator,
} = require('../validators');

// GET  /api/projects/types  → liste des types (enum)
router.get('/types', ctrl.getProjectTypes);

// GET  /api/projects        → liste paginée + filtres
router.get('/', projectQueryValidator, ctrl.getAll);

// GET  /api/projects/:id    → détail
router.get('/:id', idParamValidator, ctrl.getOne);

// POST /api/projects        → création
router.post('/', createProjectValidator, ctrl.create);

// PUT  /api/projects/:id    → mise à jour
router.put('/:id', idParamValidator, updateProjectValidator, ctrl.update);

// DELETE /api/projects/:id  → suppression
router.delete('/:id', idParamValidator, ctrl.remove);

module.exports = router;