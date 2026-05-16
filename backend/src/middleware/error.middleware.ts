// ============================================
// LocalWork — Error Handling Middleware
// ============================================
import { logger } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public status: number;
  public details?: unknown;

  constructor(message: string, status: number = 500, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err instanceof AppError ? err.status : 500;
  const message = err.message || 'Error interno del servidor';

  // Siempre loguear errores en el servidor (nunca exponerlos al cliente)
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    ...(err instanceof AppError ? { details: err.details } : {}),
  });

  res.status(status).json({
    message,
    ...(err instanceof AppError && err.details ? { details: err.details } : {}),
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Ruta no encontrada' });
}
