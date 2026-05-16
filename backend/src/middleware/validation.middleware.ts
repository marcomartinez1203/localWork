import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { AppError } from './error.middleware';

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    req.query = parsed.data;
    next();
  };
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    req.body = parsed.data;
    next();
  };
}

// Schemas reutilizables
export const jobsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(50).default(9),
  category: z.string().optional(),
  modality: z.enum(['Presencial', 'Remoto', 'Híbrido']).optional(),
  location: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['newest', 'salary-desc', 'salary-asc']).optional(),
}).strict();

export const workersQuerySchema = z.object({
  search: z.string().optional(),
  skill: z.string().optional(),
  work_type: z.enum(['freelance', 'both']).optional(),
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(50).default(12),
}).strict();

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().min(100).max(50000).default(5000),
  category: z.string().optional(),
  modality: z.string().optional(),
  barrio_id: z.string().uuid().optional(),
}).strict();
