const router = require('express').Router();

router.use('/projects', require('./projectRoutes'));
router.use('/supports', require('./supportRoutes'));
router.use('/statuses', require('./statusRoutes'));

// Share routes: /projects/:id/share-link et /review/:token
router.use('/', require('./shareRoutes'));

// Healthcheck
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;