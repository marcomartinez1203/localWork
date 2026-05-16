// ============================================
// LocalWork — Workers Directory Routes
// ============================================
import { Router } from 'express';
import { WorkersController } from '../controllers/workers.controller';
import { optionalAuth } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validation.middleware';
import { workersQuerySchema } from '../middleware/validation.middleware';

const router = Router();

/**
 * @swagger
 * /api/workers:
 *   get:
 *     summary: Directorio de trabajadores independientes
 *     tags: [Workers]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Búsqueda por nombre
 *       - in: query
 *         name: skill
 *         schema: { type: string }
 *         description: Filtrar por habilidad específica
 *       - in: query
 *         name: work_type
 *         schema: { type: string, enum: [freelance, both] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: per_page
 *         schema: { type: integer, default: 12, maximum: 50 }
 *     responses:
 *       200:
 *         description: Lista paginada de trabajadores con perfil público
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedMeta'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Profile'
 */
router.get('/', validateQuery(workersQuerySchema), WorkersController.list);

/**
 * @swagger
 * /api/workers/{id}:
 *   get:
 *     summary: Perfil público de un trabajador
 *     tags: [Workers]
 *     description: Si el que consulta es un empleador autenticado, genera una notificación `profile_viewed` al trabajador.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Perfil del trabajador (educación, experiencia, portafolio, habilidades)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Trabajador no encontrado
 */
router.get('/:id', optionalAuth, WorkersController.getOne);

export default router;
