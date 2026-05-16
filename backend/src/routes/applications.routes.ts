// ============================================
// LocalWork — Applications Routes
// ============================================
import { Router } from 'express';
import multer from 'multer';
import { ApplicationsController } from '../controllers/applications.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF o Word (.pdf, .doc, .docx)'));
    }
  },
});

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Postularse a una oferta (solo seeker)
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [job_id]
 *             properties:
 *               job_id:
 *                 type: string
 *                 format: uuid
 *               cover_letter:
 *                 type: string
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: PDF o Word, máx 5 MB
 *     responses:
 *       201:
 *         description: Postulación registrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       409:
 *         description: Ya te postulaste a esta oferta
 */
router.post('/', authenticate, requireRole('seeker'), resumeUpload.single('resume'), ApplicationsController.apply);

/**
 * @swagger
 * /api/applications/mine:
 *   get:
 *     summary: Mis postulaciones (solo seeker)
 *     tags: [Applications]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, shortlisted, interview, accepted, rejected, completed]
 *     responses:
 *       200:
 *         description: Lista de postulaciones del seeker
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 */
router.get('/mine', authenticate, requireRole('seeker'), ApplicationsController.getMyApplications);

/**
 * @swagger
 * /api/applications/job/{jobId}/mine:
 *   get:
 *     summary: Verificar si ya me postulé a un empleo
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Postulación existente o null
 */
router.get('/job/:jobId/mine', authenticate, requireRole('seeker'), ApplicationsController.getMineForJob);

/**
 * @swagger
 * /api/applications/job/{jobId}:
 *   get:
 *     summary: Postulantes de una oferta (solo employer dueño)
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lista de postulantes con perfil incluido
 */
router.get('/job/:jobId', authenticate, requireRole('employer'), ApplicationsController.getForJob);

/**
 * @swagger
 * /api/applications/{id}/status:
 *   patch:
 *     summary: Actualizar estado de una postulación (solo employer)
 *     tags: [Applications]
 *     description: |
 *       Mueve al candidato en el pipeline. Transición a `completed` habilita las calificaciones post-servicio.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, shortlisted, interview, accepted, rejected, completed]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/:id/status', authenticate, requireRole('employer'), ApplicationsController.updateStatus);

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     summary: Retirar postulación (solo seeker dueño)
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Postulación retirada
 */
router.delete('/:id', authenticate, requireRole('seeker'), ApplicationsController.withdraw);

export default router;
