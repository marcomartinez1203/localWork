# LocalWork 🚀
[![CI](https://github.com/marcomartinez1203/localWork/actions/workflows/ci.yml/badge.svg)](https://github.com/marcomartinez1203/localWork/actions/workflows/ci.yml)
[![Coverage (Backend)](https://img.shields.io/badge/Coverage%20(Backend)-73%25-brightgreen)](https://github.com/marcomartinez1203/localWork)
[![Coverage (Frontend)](https://img.shields.io/badge/Coverage%20(Frontend)-69%25-brightgreen)](https://github.com/marcomartinez1203/localWork)

Plataforma de empleo local para **Aguachica, Cesar** — conecta buscadores de empleo, trabajadores independientes y empleadores del municipio.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Node.js · Express · TypeScript |
| **Base de datos** | PostgreSQL vía Supabase |
| **Autenticación** | Supabase Auth |
| **Tiempo real** | Supabase Realtime (WebSockets) para Chat y Notificaciones |
| **Frontend SPA**| Vue 3 · TypeScript · Vite · Vue Router · Chart.js |
| **Inteligencia Artificial**| HuggingFace Inference API (`all-MiniLM-L6-v2`) + Supabase `pgvector` |
| **Landing Page**| Astro · Tailwind CSS |
| **Seguridad** | Helmet · CORS estricto · express-rate-limit · Zod (Anti-Mass Assignment) |
| **Subida de archivos** | Multer (MIME-Type filters estrictos) + Supabase Storage |
| **Despliegue**| Vercel (`vercel.json` con Security Headers CSP/HSTS) |

---

## Estructura del proyecto

```
localWork/
├── backend/
│   └── src/
│       ├── app.ts                  # Express + middlewares (CORS, Helmet, rate limit)
│       ├── server.ts               # Punto de entrada
│       ├── controllers/            # Lógica de cada endpoint
│       │   ├── auth.controller.ts
│       │   ├── jobs.controller.ts
│       │   ├── applications.controller.ts
│       │   ├── workers.controller.ts
│       │   └── notifications.controller.ts
│       ├── routes/                 # Definición de rutas REST
│       │   ├── index.ts            # Router principal
│       │   ├── auth.routes.ts
│       │   ├── jobs.routes.ts
│       │   ├── applications.routes.ts
│       │   ├── workers.routes.ts
│       │   ├── notifications.routes.ts
│       │   ├── companies.routes.ts
│       │   ├── ratings.routes.ts
│       │   └── upload.routes.ts
│       ├── services/               # Lógica de negocio
│       │   ├── ai.service.ts         # Embeddings HuggingFace (all-MiniLM-L6-v2)
│       │   ├── auth.service.ts
│       │   ├── jobs.service.ts
│       │   ├── applications.service.ts
│       │   ├── notifications.service.ts
│       │   └── ratings.service.ts
│       ├── middleware/             # Auth, errores, rate-limit
│       ├── types/                  # Tipos TypeScript
│       └── config/                 # Variables de entorno y Supabase
│
├── frontend/
│   ├── index.html                  # Punto de entrada de Vite
│   ├── package.json                # Dependencias (Vue 3, Vite, Vue Router)
│   ├── vite.config.js              # Configuración de Vite
│   ├── vercel.json                 # Configuración de Vercel (rewrites SPA y backend)
│   ├── public/                     # Archivos estáticos
│   └── src/
│       ├── main.ts                 # Inicialización de Vue y Router
│       ├── App.vue                 # Componente raíz (layout dinámico + anti-flash)
│       ├── views/                  # Vistas del SPA (páginas)
│       │   ├── HomeView.vue        # Feed de empleos
│       │   ├── JobDetailView.vue   # Detalle de oferta
│       │   ├── DashboardView.vue   # Panel del empleador + finalización de contratos
│       │   ├── ProfileView.vue     # Perfil del usuario
│       │   ├── ChatView.vue        # Mensajería en tiempo real
│       │   ├── MapView.vue         # Empleos en mapa
│       │   ├── MyApplicationsView  # Postulaciones del seeker + calificaciones
│       │   ├── WorkersView.vue     # Directorio de trabajadores + reputación
│       │   └── ...                 # Otras vistas (Auth, Notificaciones)
│       ├── components/             # Componentes reutilizables
│       │   ├── layout/             # Navbar, Footer
│       │   └── RatingModal.vue     # Modal de calificación post-servicio
│       ├── config/
│       │   └── api.ts              # Cliente HTTP centralizado
│       ├── services/               # Servicios TypeScript (Jobs, Auth, Chat, Ratings...)
│       ├── types/                  # Interfaces TypeScript
│       ├── utils/                  # Helpers (showToast, formatters)
│       ├── layouts/                # MainLayout, AuthLayout
│       ├── assets/
│       │   ├── css/                # Sistema de diseño, variables, CSS global
│       │   └── img/                # Favicons y logotipos
│
├── landingPage/                    # Landing Page (Astro + Tailwind)
└── database/
    ├── schema.sql                  # Esquema completo de PostgreSQL
    ├── seed.sql                    # Datos de prueba (categorías, empresas, empleos)
    └── migrations/                 # Migraciones incrementales
        ├── add_education_experience.sql
        ├── add_unaccent_search.sql
        ├── add_ratings_function.sql
        ├── add_post_service_ratings.sql  # Sistema de calificaciones post-servicio
        ├── add_chat_system.sql
        ├── add_chat_requests_direct.sql
        ├── add_map_barrios.sql
        ├── db_integrity_fixes.sql
        ├── performance_fixes.sql
        └── add_pgvector_ai.sql          # pgvector, columnas embedding, índices HNSW, RPC match_jobs
```

---

## Funcionalidades

### Para buscadores de empleo
- Registro y login con rol de buscador
- Explorar y filtrar ofertas (modalidad, zona, categoría, búsqueda de texto)
- **Motor de Recomendación con IA**: Sugerencias de empleo basadas en *Matchmaking Semántico* (distancia del coseno) de tu perfil con la descripción de los trabajos, sin depender de palabras clave exactas.
- Búsqueda sin acentos (PostgreSQL `unaccent`)
- Ver detalle completo de cada oferta
- Postularse con carta de presentación y **subida de CV** (PDF/Word, máx 5 MB)
- Guardar ofertas y verlas desde el perfil (**♥ Empleos guardados**)
- Seguimiento del estado de postulaciones con **filtro por estado** (`pendiente → revisado → entrevista → contratado → finalizado`)
- **Calificar al empleador** cuando el contrato finaliza
- Perfil con educación, experiencia laboral y habilidades
- **Sistema de Verificación de Identidad**: subida de documento para obtener **Insignia de Confianza (Check Azul)** y mejorar reputación
- **Portafolio Visual**: galería de hasta 5 imágenes de trabajos previos (ideal para oficios independientes: carpinteros, electricistas, pintores)
- **Compartir ofertas** vía Web Share API o portapapeles
- Directorio de trabajadores con modal de detalle, reputación, insignia de verificación y galería de portafolio con lightbox

### Para empleadores
- Registro con empresa verificada
- **Panel de analíticas interactivo (Dashboard)** con gráficas de rendimiento (Chart.js)
- Métricas en tiempo real: Vistas de ofertas (`views_count`), total de postulaciones y % de conversión
- Publicar, **editar** y cerrar/pausar ofertas de empleo
- **Fecha de vencimiento** para auto-expiración de ofertas
- Revisar postulantes, ver CV adjunto y mover candidatos en el pipeline
- **Finalizar contratos** cuando el servicio termina
- **Calificar trabajadores** post-servicio con desglose detallado
- **Editar datos de empresa** (nombre, NIT, teléfono, dirección, web)
- **Subir logo de empresa** (JPG/PNG/WebP)

### Sistema de calificaciones post-servicio
- **Bidireccional**: empleador califica trabajador y trabajador califica empleador
- Solo disponible tras **finalizar el contrato** (estado `completed`)
- Calificación general (1-5 estrellas) + subcategorías:
  - Puntualidad · Calidad de trabajo · Comunicación
- Toggle **"¿Lo recomendarías?"** (sí/no)
- Comentario opcional
- **Visualización de reputación** en el directorio de trabajadores:
  - Promedio general, barras de progreso por categoría, % de recomendación
  - Reviews individuales con avatar y tags
- Calificación general desde el directorio (sin necesidad de contrato)
- Protección contra auto-calificación y duplicados

### General
- Modo oscuro / modo claro con persistencia (anti-flash CSS)
- **Notificaciones en tiempo real** vía Supabase Realtime
  - `application_received` — empleador recibe aviso de nueva postulación
  - `application_status_changed` — buscador ve cambio de estado
  - `rating_request` — ambas partes reciben invitación a calificar tras finalizar contrato
  - `new_rating` — notificación cuando recibes una calificación
  - `profile_viewed` — trabajador sabe cuando ven su perfil
  - `new_job_match` — notificación de nuevas ofertas relevantes
- **Chat en tiempo real**: mensajería entre buscadores y empleadores + solicitudes de chat directo
- Subida de avatar y CV
- SPA con Vue 3 + TypeScript, empaquetada con Vite
- Diseño responsive (móvil, tablet y escritorio)

---

## Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/marcomartinez1203/localWork.git
cd localWork
```

### 2. Variables de entorno del backend

Crea `backend/.env` con:

```env
PORT=3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
FRONTEND_URL=http://localhost:5500
# Opcional: lista de orígenes CORS adicionales (separados por coma)
# CORS_ORIGINS=https://app1.com,https://app2.com
```

### 3. Base de datos

Ejecuta en el **SQL Editor de Supabase**, en este orden:

```
1. database/schema.sql                              # Esquema principal
2. database/migrations/add_education_experience.sql  # Tablas educación/experiencia
3. database/migrations/add_unaccent_search.sql       # Búsqueda sin acentos
4. database/migrations/db_integrity_fixes.sql        # Restricciones de integridad
5. database/migrations/performance_fixes.sql             # Índices y funciones RPC
6. database/migrations/add_ratings_function.sql          # Función avg_rating()
7. database/migrations/add_chat_system.sql               # Sistema de chat
8. database/migrations/add_chat_requests_direct.sql      # Solicitudes de chat directo
9. database/migrations/add_map_barrios.sql               # Barrios para mapa
10. database/migrations/add_post_service_ratings.sql     # Calificaciones post-servicio + completed status
11. database/migrations/add_pgvector_ai.sql              # Extensión vector, columnas embedding e índices HNSW
12. database/seed.sql                                    # Datos de prueba (opcional)
```

### 4. Supabase Storage

Crea un bucket público llamado `uploads` en Supabase Storage. Se usa para:
- Avatares de usuario (`avatars/`)
- Hojas de vida (`resumes/`)
- Logos de empresa (`logos/`)

### 5. Instalar dependencias y levantar el backend

```bash
cd backend
npm install
npm run dev        # desarrollo con hot-reload
# npm run build && npm start   # producción
```

### 6. Levantar el frontend (Vue 3 SPA)

El frontend está construido con Vue 3 y empaquetado con Vite.

```bash
cd frontend
npm install
npm run dev
```

La aplicación se levantará normalmente en `http://localhost:5173`.

### 7. Despliegue en Vercel

El proyecto está preparado para desplegarse como monorepo en Vercel. 
- Vercel detectará el archivo `vercel.json` en la raíz.
- Este archivo enruta la carpeta `frontend/` mediante `@vercel/static-build` para construir la SPA de Vue y redirigir correctamente las rutas de `vue-router`.
- Para evitar conflictos de dependencias en Vercel con Vite, se incluyó el archivo `frontend/.npmrc` con `legacy-peer-deps=true`.

## API — Referencia completa

### Autenticación

```
POST   /api/auth/register          Registro de usuario (seeker o employer)
POST   /api/auth/login             Inicio de sesión
POST   /api/auth/logout            Cierre de sesión
GET    /api/auth/profile           Obtener perfil del usuario autenticado
PUT    /api/auth/profile           Actualizar perfil
POST   /api/auth/reset-password    Solicitar restablecimiento de contraseña
```

### Empleos

```
GET    /api/jobs                   Listar empleos (filtros: category, modality, location, search, sort)
GET    /api/jobs/recommended       Recomendaciones basadas en IA (Match Semántico)
GET    /api/jobs/:id               Detalle de un empleo
GET    /api/jobs/mine              Mis ofertas publicadas (empleador)
GET    /api/jobs/categories        Categorías disponibles
GET    /api/jobs/stats             Estadísticas públicas
GET    /api/jobs/employer-stats    Estadísticas del empleador autenticado
POST   /api/jobs                   Crear oferta (empleador)
PUT    /api/jobs/:id               Editar oferta
DELETE /api/jobs/:id               Eliminar oferta
POST   /api/jobs/:id/save          Guardar empleo en favoritos
DELETE /api/jobs/:id/save          Quitar de favoritos
GET    /api/jobs/saved             Listar empleos guardados
```

### Postulaciones

```
POST   /api/applications           Postularse (con FormData para CV)
GET    /api/applications/mine      Mis postulaciones (filtro: ?status=)
GET    /api/applications/job/:id   Postulantes de una oferta (empleador)
PATCH  /api/applications/:id/status Actualizar estado de postulante
DELETE /api/applications/:id       Retirar postulación
```

### Trabajadores

```
GET    /api/workers                Directorio (filtros: search, skill, work_type)
GET    /api/workers/:id            Perfil público (genera notificación profile_viewed)
```

### Calificaciones

```
POST   /api/ratings                Calificación general (desde directorio)
POST   /api/ratings/post-service   Calificación post-servicio (vinculada a postulación)
GET    /api/ratings/check/:appId   Verificar si ya califiqué esta postulación
GET    /api/ratings/user/:id       Calificaciones + desglose (promedio, barras, % recomendación)
DELETE /api/ratings/:id            Eliminar calificación propia
```

### Empresas

```
GET    /api/companies/mine         Datos de mi empresa
GET    /api/companies/:id          Datos públicos de una empresa
PUT    /api/companies/:id          Actualizar datos de empresa
```

### Notificaciones

```
GET    /api/notifications          Listar notificaciones
PATCH  /api/notifications/:id      Marcar como leída
PATCH  /api/notifications/read-all Marcar todas como leídas
GET    /api/notifications/unread   Contador de no leídas
```

### Subida de archivos

```
POST   /api/upload/avatar          Subir foto de perfil (JPG, PNG, WebP)
POST   /api/upload/resume          Subir hoja de vida (PDF, DOC, DOCX)
POST   /api/upload/company-logo    Subir logo de empresa (JPG, PNG, WebP)
```

---

## Sistema de diseño

El diseño sigue una estética de **Minimalismo Refinado** con las siguientes convenciones:

- **Tipografía**: `Sora` (headings, `--font-heading`) + `Inter` (cuerpo, `--font-body`)
- **Color primario**: verde municipal `#007200` con tinte Lima como acento `#70E000`
- **Temas**: todas las variables en `main.css` se sobreescriben en `[data-theme="dark"]`; **nunca usar HEX directamente en componentes**, solo variables CSS
- **Sombras**: usar `--shadow-glow` en hovers de tarjetas para el resplandor verde
- **Breakpoints**: `480px` (móvil pequeño) · `768px` (móvil/tablet) · `1024px` (tablet) · `1280px` (escritorio)

---

## Esquema de base de datos

```
profiles         Perfiles de usuario (1:1 con auth.users)
companies        Empresas registradas por empleadores
categories       Categorías de empleo
jobs             Ofertas de empleo
applications     Postulaciones de buscadores
ratings          Calificaciones mutuas entre usuarios
notifications    Notificaciones del sistema
saved_jobs       Empleos guardados por buscadores
education        Historial educativo del perfil
experience       Experiencia laboral del perfil
```

### Tipos enumerados

| Tipo | Valores |
|------|---------|
| `user_role` | `seeker`, `employer`, `admin` |
| `job_status` | `active`, `paused`, `closed`, `draft` |
| `job_modality` | `Presencial`, `Remoto`, `Híbrido` |
| `application_status` | `pending`, `reviewed`, `shortlisted`, `interview`, `accepted`, `rejected`, `completed` |
| `notification_type` | `application_received`, `application_status_changed`, `profile_viewed`, `new_job_match`, `rating_request`, `new_rating`, `system` |

---

## Licencia

Proyecto desarrollado para el municipio de Aguachica, Cesar. Uso local y educativo.
