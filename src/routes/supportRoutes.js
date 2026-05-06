const router = require('express').Router();
const ctrl = require('../controllers/supportController');
const upload = require('../middlewares/upload');
const {
  createSupportValidator,
  updateSupportValidator,
  idParamValidator,
} = require('../validators');

// GET    /api/supports         → liste des supports
router.get('/', ctrl.getAll);

// GET    /api/supports/:id     → détail
router.get('/:id', idParamValidator, ctrl.getOne);

// POST   /api/supports         → création (optionnel : upload image)
// multipart/form-data avec champ "image" pour le fichier
router.post(
  '/',
  upload.single('image'),
  createSupportValidator,
  ctrl.create
);

// PUT    /api/supports/:id     → mise à jour
router.put(
  '/:id',
  idParamValidator,
  upload.single('image'),
  updateSupportValidator,
  ctrl.update
);

// DELETE /api/supports/:id     → désactivation (soft delete)
router.delete('/:id', idParamValidator, ctrl.remove);

module.exports = router;