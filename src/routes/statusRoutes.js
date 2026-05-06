const router = require('express').Router();
const ctrl = require('../controllers/statusController');
const {
  createStatusValidator,
  updateStatusValidator,
  idParamValidator,
} = require('../validators');

// GET    /api/statuses           → liste des états
router.get('/', ctrl.getAll);

// GET    /api/statuses/:id       → détail
router.get('/:id', idParamValidator, ctrl.getOne);

// POST   /api/statuses           → création
router.post('/', createStatusValidator, ctrl.create);

// PUT    /api/statuses/reorder   → réordonner les états
router.put('/reorder', ctrl.reorder);

// PUT    /api/statuses/:id       → mise à jour
router.put('/:id', idParamValidator, updateStatusValidator, ctrl.update);

// DELETE /api/statuses/:id       → désactivation
router.delete('/:id', idParamValidator, ctrl.remove);

module.exports = router;