// ============================================
// LocalWork — Server Entry Point
// ============================================
import { logger } from './utils/logger';
import app from './app';
import { env } from './config/env';

const server = app.listen(env.port, () => {
  logger.info('LocalWork API Server started', { port: env.port, env: env.nodeEnv });
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  logger.info('Closing server...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});
