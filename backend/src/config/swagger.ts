// ============================================
// LocalWork — Swagger Documentation Config
// ============================================
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LocalWork API',
      version: '1.0.0',
      description: `
## API de LocalWork — Plataforma de Empleo Local

Conecta buscadores de empleo, trabajadores independientes y empleadores en **Aguachica, Cesar (Colombia)**.

### Autenticación
Todos los endpoints protegidos requieren un **Bearer Token** JWT obtenido en \`POST /api/auth/login\`.

### Roles
- **seeker** — Buscador de empleo / trabajador independiente
- **employer** — Empleador con empresa registrada
- **admin** — Administrador de plataforma
      `,
      contact: { name: 'LocalWork Team' },
    },
    servers: [
      { url: 'https://local-work-six.vercel.app', description: 'Producción (Vercel)' },
      { url: 'http://localhost:3000', description: 'Desarrollo local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido en POST /api/auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Recurso no encontrado' },
            status: { type: 'integer', example: 404 },
          },
        },
        PaginatedMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            per_page: { type: 'integer' },
            total_pages: { type: 'integer' },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['seeker', 'employer', 'admin'] },
            full_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', nullable: true },
            avatar_url: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            location: { type: 'string', nullable: true },
            skills: { type: 'array', items: { type: 'string' }, nullable: true },
            work_type: { type: 'string', enum: ['employee', 'freelance', 'both'], nullable: true },
            availability: { type: 'string', nullable: true },
            hourly_rate: { type: 'number', nullable: true },
            verification_status: { type: 'string', enum: ['unverified', 'pending', 'verified', 'rejected'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Job: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            company_id: { type: 'string', format: 'uuid' },
            category_id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            requirements: { type: 'string', nullable: true },
            modality: { type: 'string', enum: ['Presencial', 'Remoto', 'Híbrido'] },
            location: { type: 'string' },
            salary_min: { type: 'number', nullable: true },
            salary_max: { type: 'number', nullable: true },
            salary_text: { type: 'string', nullable: true },
            vacancies: { type: 'integer', default: 1 },
            status: { type: 'string', enum: ['active', 'paused', 'closed', 'draft'] },
            expires_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Application: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            job_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            cover_letter: { type: 'string', nullable: true },
            resume_url: { type: 'string', nullable: true },
            status: {
              type: 'string',
              enum: ['pending', 'reviewed', 'shortlisted', 'interview', 'accepted', 'rejected', 'completed'],
            },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Rating: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            rater_id: { type: 'string', format: 'uuid' },
            rated_id: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string', nullable: true },
            punctuality: { type: 'integer', minimum: 1, maximum: 5, nullable: true },
            quality: { type: 'integer', minimum: 1, maximum: 5, nullable: true },
            communication: { type: 'integer', minimum: 1, maximum: 5, nullable: true },
            would_recommend: { type: 'boolean', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            type: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            read: { type: 'boolean' },
            data: { type: 'object', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Registro, login y gestión de perfil' },
      { name: 'Jobs', description: 'Ofertas de empleo y recomendaciones IA (pgvector)' },
      { name: 'Applications', description: 'Postulaciones y pipeline de contratación' },
      { name: 'Workers', description: 'Directorio de trabajadores independientes' },
      { name: 'Ratings', description: 'Calificaciones post-servicio bidireccionales' },
      { name: 'Companies', description: 'Gestión de empresas' },
      { name: 'Notifications', description: 'Notificaciones en tiempo real' },
      { name: 'Upload', description: 'Subida de archivos (avatar, CV, logo, portafolio)' },
      { name: 'Chat', description: 'Mensajería en tiempo real' },
      { name: 'Admin', description: 'Panel de administración (solo admin)' },
      { name: 'System', description: 'Health check y estado del sistema' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
