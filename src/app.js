const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');
const path    = require('path');
require('dotenv').config();

const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ── CORS — doit être avant helmet ─────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'https://production.magicwalls.ma').split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Autorise les requêtes sans origin (Postman, mobile, etc.)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS bloqué pour : ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Helmet — configuré pour autoriser les images cross-origin ─
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // ← permet au frontend de charger les images
  contentSecurityPolicy: false, // désactivé en dev pour éviter les blocages d'images
}));

// ── Rate limiting ─────────────────────────────────────────────
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX)        || 200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Trop de requêtes, réessayez plus tard.' },
}));

// ── Parsing ───────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logs ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Fichiers statiques (images uploadées) ─────────────────────
// Headers CORS explicites pour que le navigateur accepte les images
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(process.cwd(), 'uploads')));

// ── Routes API ────────────────────────────────────────────────
app.use('/api', routes);

// ── Gestion des erreurs ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
