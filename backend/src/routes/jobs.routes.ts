// ============================================
// LocalWork — Jobs Routes
// ============================================
import { Router } from 'express';
import { JobsController } from '../controllers/jobs.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validation.middleware';
import { jobsQuerySchema, nearbyQuerySchema } from '../middleware/validation.middleware';

const router = Router();

/**
 * @swagger
 * /api/jobs/categories:
 *   get:
 *     summary: Obtener categorías de empleo
 *     tags: [Jobs]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   name: { type: string }
 *                   slug: { type: string }
 *                   icon: { type: string }
 */
router.get('/categories', JobsController.getCategories);

/**
 * @swagger
 * /api/jobs/barrios:
 *   get:
 *     summary: Obtener barrios de Aguachica disponibles
 *     tags: [Jobs]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de barrios con coordenadas
 */
router.get('/barrios', JobsController.getBarrios);

/**
 * @swagger
 * /api/jobs/nearby:
 *   get:
 *     summary: Empleos cercanos a una coordenada geográfica
 *     tags: [Jobs]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *         example: 8.3077
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *         example: -73.6189
 *       - in: query
 *         name: radius
 *         schema: { type: integer, default: 5000 }
 *         description: Radio de búsqueda en metros
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: modality
 *         schema: { type: string, enum: [Presencial, Remoto, Híbrido] }
 *       - in: query
 *         name: barrio_id
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Empleos dentro del radio solicitado
 */
router.get('/nearby', validateQuery(nearbyQuerySchema), JobsController.getNearby);

/**
 * @swagger
 * /api/jobs/recommended:
 *   get:
 *     summary: Empleos recomendados por IA (Match Semántico con pgvector)
 *     tags: [Jobs]
 *     description: |
 *       Usa la distancia del coseno entre el embedding del perfil del seeker y los embeddings
 *       de los empleos activos para retornar los mejores matches semánticos.
 *       Si el usuario no tiene embedding generado aún, retorna los 5 empleos más recientes como fallback.
 *     responses:
 *       200:
 *         description: Lista de empleos recomendados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *       403:
 *         description: Solo disponible para seekers
 */
router.get('/recommended', authenticate, requireRole('seeker'), JobsController.getRecommended);

/**
 * @swagger
 * /api/jobs/employer-analytics:
 *   get:
 *     summary: Analíticas detalladas del empleador (para Dashboard)
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Métricas del empleador
 */
router.get('/employer-analytics', authenticate, requireRole('employer'), JobsController.getEmployerAnalytics);

/**
 * @swagger
 * /api/jobs/employer-stats:
 *   get:
 *     summary: Estadísticas resumidas del empleador
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Estadísticas (total empleos, postulaciones, vistas)
 */
router.get('/employer-stats', authenticate, requireRole('employer'), JobsController.getEmployerStats);

/**
 * @swagger
 * /api/jobs/stats:
 *   get:
 *     summary: Estadísticas públicas de la plataforma
 *     tags: [Jobs]
 *     security: []
 *     responses:
 *       200:
 *         description: Total de empleos, usuarios, postulaciones
 */
router.get('/stats', JobsController.getStats);

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Listar empleos activos con filtros
 *     tags: [Jobs]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: per_page
 *         schema: { type: integer, default: 9, maximum: 50 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: modality
 *         schema: { type: string, enum: [Presencial, Remoto, Híbrido] }
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Búsqueda de texto (sin acentos, multi-palabra)
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, salary-desc, salary-asc] }
 *     responses:
 *       200:
 *         description: Lista paginada de empleos
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
 *                         $ref: '#/components/schemas/Job'
 *   post:
 *     summary: Crear oferta de empleo (solo employer)
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category_id, modality, location]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               requirements: { type: string }
 *               category_id: { type: string, format: uuid }
 *               modality: { type: string, enum: [Presencial, Remoto, Híbrido] }
 *               location: { type: string }
 *               barrio_id: { type: string, format: uuid }
 *               salary_min: { type: number }
 *               salary_max: { type: number }
 *               salary_text: { type: string }
 *               vacancies: { type: integer, default: 1 }
 *               expires_at: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Oferta creada. El embedding de IA se genera en background.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 */
router.get('/', validateQuery(jobsQuerySchema), JobsController.list);
router.post('/', authenticate, requireRole('employer'), JobsController.create);

/**
 * @swagger
 * /api/jobs/saved:
 *   get:
 *     summary: Empleos guardados por el usuario
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Lista de empleos guardados
 */
router.get('/saved', authenticate, JobsController.getSavedJobs);

/**
 * @swagger
 * /api/jobs/mine:
 *   get:
 *     summary: Mis ofertas publicadas (solo employer)
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, paused, closed, draft] }
 *     responses:
 *       200:
 *         description: Ofertas del empleador paginadas
 */
router.get('/mine', authenticate, requireRole('employer'), JobsController.getMyJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Detalle de un empleo
 *     tags: [Jobs]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Detalle completo del empleo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Empleo no encontrado
 *   put:
 *     summary: Editar oferta (solo empleador dueño)
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       200:
 *         description: Oferta actualizada
 *   delete:
 *     summary: Eliminar oferta (solo empleador dueño)
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Eliminada exitosamente
 */
router.get('/:id', JobsController.getById);
router.put('/:id', authenticate, requireRole('employer'), JobsController.update);
router.delete('/:id', authenticate, requireRole('employer'), JobsController.delete);

/**
 * @swagger
 * /api/jobs/{id}/save:
 *   post:
 *     summary: Guardar empleo en favoritos
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Guardado exitosamente
 *       409:
 *         description: Ya guardado anteriormente
 *   delete:
 *     summary: Quitar empleo de favoritos
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Quitado exitosamente
 */
router.post('/:id/save', authenticate, JobsController.saveJob);
router.delete('/:id/save', authenticate, JobsController.unsaveJob);

export default router;
