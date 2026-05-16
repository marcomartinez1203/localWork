// ============================================
// LocalWork — Auth Routes
// ============================================
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, full_name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               full_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [seeker, employer]
 *                 default: seeker
 *               work_type:
 *                 type: string
 *                 enum: [employee, freelance, both]
 *               phone:
 *                 type: string
 *               company_name:
 *                 type: string
 *                 description: Requerido si role=employer
 *               company_nit:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/Profile'
 *                 token:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Correo ya registrado
 */
router.post('/register', AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/Profile'
 *                 token:
 *                   type: string
 *                   description: JWT Bearer Token
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sesión cerrada
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         description: No autenticado
 *   put:
 *     summary: Actualizar perfil
 *     tags: [Auth]
 *     description: Actualiza los campos del perfil. Si se modifican bio, skills o experience, regenera el embedding de IA en background.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *                 nullable: true
 *               bio:
 *                 type: string
 *                 nullable: true
 *               location:
 *                 type: string
 *                 nullable: true
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               work_type:
 *                 type: string
 *                 enum: [employee, freelance, both]
 *                 nullable: true
 *               availability:
 *                 type: string
 *                 nullable: true
 *               hourly_rate:
 *                 type: number
 *                 nullable: true
 *               service_public:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/Profile'
 */
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Correo enviado
 */
router.post('/reset-password', AuthController.resetPassword);

export default router;
