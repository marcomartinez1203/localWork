// ============================================
// LocalWork — Express App Configuration
// ============================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

const app = express();

// ── Seguridad ──
app.use(helmet());
app.use(cors({
  origin: [env.frontendUrl, ...env.corsOrigins],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutos
  max: 100,                     // máximo 100 requests por IP
  message: { message: 'Demasiadas solicitudes, intenta más tarde' },
});
app.use('/api/', limiter);

// Rate limit más estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Demasiados intentos, espera 15 minutos' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// Rate limit para endpoints públicos de datos (anti-scraping)
const publicDataLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { message: 'Demasiadas consultas, intenta más tarde' },
});
app.use('/api/jobs', publicDataLimiter);
app.use('/api/workers', publicDataLimiter);

// ── Parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ──
if (env.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── Rutas ──
app.get('/', (_req, res) => {
  res.json({
    name: 'LocalWork API',
    status: 'online',
    version: '1.0.0'
  });
});
app.use('/api', routes);

// ── Manejo de errores ──
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
