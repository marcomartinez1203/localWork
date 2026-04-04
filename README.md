# LocalWork

Plataforma de empleo local para Aguachica, Cesar — conecta buscadores de empleo, trabajadores independientes y empleadores del municipio.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Node.js · Express · TypeScript |
| **Base de datos** | PostgreSQL vía Supabase |
| **Autenticación** | Supabase Auth |
| **Frontend** | HTML5 · CSS3 · JavaScript vanilla |
| **Seguridad** | Helmet · CORS · express-rate-limit |
| **Validación** | Zod |
| **Subida de archivos** | Multer |

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
│       │   ├── index.ts
│       │   ├── auth.routes.ts
│       │   ├── jobs.routes.ts
│       │   ├── applications.routes.ts
│       │   ├── workers.routes.ts
│       │   ├── notifications.routes.ts
│       │   └── upload.routes.ts
│       ├── services/               # Lógica de negocio
│       ├── middleware/             # Manejo de errores y otros
│       ├── types/                  # Tipos TypeScript
│       └── config/                 # Variables de entorno y Supabase
│
├── frontend/
│   ├── index.html                  # Landing page
│   ├── pages/                      # Vistas de la app
│   │   ├── home.html               # Feed de empleos
│   │   ├── workers.html            # Directorio de trabajadores
│   │   ├── job-detail.html         # Detalle de oferta
│   │   ├── dashboard.html          # Panel del empleador
│   │   ├── my-applications.html    # Postulaciones del buscador
│   │   ├── profile.html            # Perfil de usuario
│   │   ├── notifications.html      # Centro de notificaciones
│   │   ├── login.html
│   │   ├── register.html
│   │   └── reset-password.html
│   └── assets/
│       ├── css/
│       │   ├── main.css            # Variables, reset, tipografía, layout
│       │   ├── components.css      # Navbar, botones, tarjetas, formularios
│       │   └── pages/              # Estilos específicos por página
│       └── js/
│           ├── app.js              # App principal, autenticación UI
│           ├── services/           # Capa de integración con la API
│           └── config/             # Configuración de la API
│
└── database/
    ├── schema.sql                  # Esquema completo de PostgreSQL
    ├── seed.sql                    # Datos de prueba
    └── migrations/                 # Migraciones incrementales
```

---

## Funcionalidades

### Para buscadores de empleo
- Registro y login con rol de buscador
- Explorar y filtrar ofertas de empleo (modalidad, zona, categoría)
- Ver detalle completo de cada oferta
- Postularse con carta de presentación
- Seguimiento del estado de postulaciones (`pendiente → revisado → entrevista → aceptado`)
- Perfil con educación, experiencia y habilidades
- Directorio de trabajadores

### Para empleadores
- Registro con empresa verificada
- Publicar, editar y cerrar ofertas de empleo
- Panel de control con estadísticas
- Revisar postulantes y mover candidatos en el pipeline
- Gestión de notificaciones

### General
- Modo oscuro / modo claro con persistencia
- Notificaciones en tiempo real
- Subida de avatar y CV
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
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
FRONTEND_URL=http://localhost:5500
```

### 3. Base de datos

Ejecuta en el SQL Editor de Supabase:

```bash
# 1. Esquema principal
database/schema.sql

# 2. Datos de prueba (opcional)
database/seed.sql
```

### 4. Instalar dependencias y levantar el backend

```bash
cd backend
npm install
npm run dev        # desarrollo con hot-reload
# npm run build && npm start   # producción
```

### 5. Levantar el frontend

El frontend es HTML/JS estático. Puedes usar cualquier servidor local:

```bash
# VS Code Live Server (puerto 5500 por defecto)
# O con Python:
cd frontend
python -m http.server 5500
```

Abre `http://localhost:5500` en el navegador.

---

## API — Endpoints principales

```
POST   /api/auth/register         Registro de usuario
POST   /api/auth/login            Inicio de sesión
POST   /api/auth/logout           Cierre de sesión

GET    /api/jobs                  Listar empleos (con filtros)
GET    /api/jobs/:id              Detalle de un empleo
POST   /api/jobs                  Crear empleo (empleador)
PUT    /api/jobs/:id              Editar empleo
DELETE /api/jobs/:id              Eliminar empleo

POST   /api/applications          Postularse a un empleo
GET    /api/applications/mine     Mis postulaciones
PATCH  /api/applications/:id      Actualizar estado (empleador)

GET    /api/workers               Directorio de trabajadores
GET    /api/workers/:id           Perfil público de un trabajador

GET    /api/notifications         Notificaciones del usuario
PATCH  /api/notifications/:id     Marcar como leída

POST   /api/upload/avatar         Subir foto de perfil
POST   /api/upload/cv             Subir CV (PDF)
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

## Licencia

Proyecto desarrollado para el municipio de Aguachica, Cesar. Uso local y educativo.
