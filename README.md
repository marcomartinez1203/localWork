# LocalWork

Plataforma de empleo local para **Aguachica, Cesar** — conecta buscadores de empleo, trabajadores independientes y empleadores del municipio.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Node.js · Express · TypeScript |
| **Base de datos** | PostgreSQL vía Supabase |
| **Autenticación** | Supabase Auth |
| **Tiempo real** | Supabase Realtime (WebSockets) |
| **Frontend** | HTML5 · CSS3 · JavaScript vanilla |
| **Seguridad** | Helmet · CORS · express-rate-limit |
| **Validación** | Zod |
| **Subida de archivos** | Multer + Supabase Storage |

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
│   ├── index.html                  # Landing page
│   ├── pages/                      # Vistas de la app
│   │   ├── home.html               # Feed de empleos con búsqueda y filtros
│   │   ├── workers.html            # Directorio de trabajadores + modal detalle
│   │   ├── job-detail.html         # Detalle de oferta + postularse + compartir
│   │   ├── dashboard.html          # Panel del empleador (CRUD ofertas, empresa)
│   │   ├── my-applications.html    # Postulaciones con filtro por estado
│   │   ├── profile.html            # Perfil + educación + experiencia + guardados
│   │   ├── notifications.html      # Centro de notificaciones
│   │   ├── login.html
│   │   ├── register.html
│   │   └── reset-password.html
│   └── assets/
│       ├── css/
│       │   ├── main.css            # Variables, reset, tipografía, layout
│       │   ├── components.css      # Navbar, botones, tarjetas, formularios
│       │   └── pages/              # Estilos específicos por página
│       ├── js/
│       │   ├── app.js              # App principal, navegación, notificaciones UI
│       │   ├── theme-init.js       # Inicialización de tema (dark/light)
│       │   ├── config/
│       │   │   └── api.js          # Configuración centralizada (URL, keys, fetch)
│       │   ├── services/           # Capa de integración con la API
│       │   │   ├── auth.service.js
│       │   │   ├── jobs.service.js
│       │   │   ├── applications.service.js
│       │   │   ├── companies.service.js
│       │   │   ├── workers.service.js
│       │   │   ├── ratings.service.js
│       │   │   ├── notifications.service.js
│       │   │   └── realtime.service.js
│       │   └── utils/
│       │       └── helpers.js      # escapeHtml, timeAgo, formatCurrency, debounce
│       └── img/
│           ├── favicon.png
│           └── logo.png
│
└── database/
    ├── schema.sql                  # Esquema completo de PostgreSQL
    ├── seed.sql                    # Datos de prueba (categorías, empresas, empleos)
    └── migrations/                 # Migraciones incrementales
        ├── add_education_experience.sql
        ├── add_unaccent_search.sql
        ├── add_ratings_function.sql
        ├── db_integrity_fixes.sql
        └── performance_fixes.sql
```

---

## Funcionalidades

### Para buscadores de empleo
- Registro y login con rol de buscador
- Explorar y filtrar ofertas (modalidad, zona, categoría, búsqueda de texto)
- Búsqueda sin acentos (PostgreSQL `unaccent`)
- Ver detalle completo de cada oferta
- Postularse con carta de presentación y **subida de CV** (PDF/Word, máx 5 MB)
- Guardar ofertas y verlas desde el perfil (**♥ Empleos guardados**)
- Seguimiento del estado de postulaciones con **filtro por estado** (`pendiente → revisado → entrevista → aceptado`)
- Perfil con educación, experiencia laboral y habilidades
- **Compartir ofertas** vía Web Share API o portapapeles
- Directorio de trabajadores con modal de detalle

### Para empleadores
- Registro con empresa verificada
- **Panel de control** con estadísticas en tiempo real (ofertas activas, total, postulaciones)
- Publicar, **editar** y cerrar/pausar ofertas de empleo
- **Fecha de vencimiento** para auto-expiración de ofertas
- Revisar postulantes, ver CV adjunto y mover candidatos en el pipeline
- **Editar datos de empresa** (nombre, NIT, teléfono, dirección, web)
- **Subir logo de empresa** (JPG/PNG/WebP)
- **Calificar trabajadores** con estrellas (1-5) y comentario

### Sistema de calificaciones
- Los empleadores pueden calificar trabajadores desde el directorio
- Calificación con puntaje (1-5 estrellas) y comentario opcional
- Promedio visible en el perfil público del trabajador
- Protección contra auto-calificación y duplicados

### General
- Modo oscuro / modo claro con persistencia
- **Notificaciones en tiempo real** vía Supabase Realtime
  - `application_received` — empleador recibe aviso de nueva postulación
  - `application_status_changed` — buscador ve cambio de estado
  - `profile_viewed` — trabajador sabe cuando ven su perfil
  - `new_job_match` — notificación de nuevas ofertas relevantes
- Subida de avatar y CV
- Diseño responsive (móvil, tablet y escritorio)
- SEO con meta tags y Open Graph
- Favicon + PWA manifest

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
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
FRONTEND_URL=http://localhost:5500
```

### 3. Base de datos

Ejecuta en el **SQL Editor de Supabase**, en este orden:

```
1. database/schema.sql                              # Esquema principal
2. database/migrations/add_education_experience.sql  # Tablas educación/experiencia
3. database/migrations/add_unaccent_search.sql       # Búsqueda sin acentos
4. database/migrations/db_integrity_fixes.sql        # Restricciones de integridad
5. database/migrations/performance_fixes.sql         # Índices y funciones RPC
6. database/migrations/add_ratings_function.sql      # Función avg_rating()
7. database/seed.sql                                 # Datos de prueba (opcional)
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

### 6. Levantar el frontend

El frontend es HTML/JS estático. Puedes usar cualquier servidor local:

```bash
# VS Code Live Server (puerto 5500 por defecto)
# O con Python:
cd frontend
python -m http.server 5500
```

Abre `http://localhost:5500` en el navegador.

---

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
POST   /api/ratings                Calificar a un usuario (score 1-5, comentario)
GET    /api/ratings/user/:id       Calificaciones de un usuario (promedio + lista)
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
| `application_status` | `pending`, `reviewed`, `shortlisted`, `interview`, `accepted`, `rejected` |
| `notification_type` | `application_received`, `application_status_changed`, `profile_viewed`, `new_job_match`, `system` |

---

## Licencia

Proyecto desarrollado para el municipio de Aguachica, Cesar. Uso local y educativo.
