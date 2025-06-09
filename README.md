# Sistema de Reclutamiento y Selección de RH

Sistema completo de gestión de recursos humanos desarrollado en Node.js con Express, PostgreSQL y JSReport para generación de reportes.

## Características Principales

### ✅ Gestión de Entidades
- **Gestión de Competencias** - CRUD completo para competencias técnicas, blandas y gerenciales
- **Gestión de Idiomas** - Administración de idiomas requeridos
- **Gestión de Capacitaciones** - Control de cursos, certificaciones y entrenamientos
- **Gestión de Puestos** - Definición de posiciones laborales con requisitos
- **Gestión de Candidatos** - Registro y seguimiento de candidatos
- **Gestión de Experiencia Laboral** - Historial profesional de candidatos

### ✅ Proceso de Selección
- **Máquina de Estados** implementada con XState para el flujo de candidatos:
  - Aplicado → En Revisión → Preseleccionado → Entrevista Inicial → Entrevista Técnica → Entrevista Final → Aprobado → Contratado
  - Estados de rechazo en cualquier etapa del proceso

### ✅ Búsqueda y Filtros
- Búsqueda de candidatos por:
  - Competencias específicas
  - Idiomas requeridos
  - Capacitaciones completadas
  - Experiencia laboral
  - Puestos de interés

### ✅ Sistema de Reportes
- **Reporte de Nuevos Empleados** por rango de fechas (PDF)
- **Resumen de Candidatos** por estado (PDF)
- Generación con JSReport (similar a Crystal Reports)

### ✅ Autenticación y Autorización
- JWT para autenticación
- Control de roles: Admin, HR Manager, Recruiter
- Middleware de autorización por endpoints

## Tecnologías Utilizadas

- **Backend:** Node.js + Express.js
- **Base de Datos:** PostgreSQL + Sequelize ORM
- **Autenticación:** JWT + Passport.js
- **Reportes:** JSReport (Chrome PDF)
- **Validación:** Joi
- **Estado:** XState
- **Testing:** Jest + Supertest

## Instalación

### Prerrequisitos
- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm o yarn

### 1. Clonar el repositorio
\`\`\`bash
git clone <repository-url>
cd rrhh-iso715
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno
Crear archivo \`.env\` en la raíz del proyecto:
\`\`\`env
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rrhh_system
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Session Configuration
SESSION_SECRET=your_session_secret_here

# JSReport Configuration
JSREPORT_CHROME_LAUNCHARGS=--no-sandbox
\`\`\`

### 4. Configurar base de datos
\`\`\`bash
# Crear base de datos en PostgreSQL
createdb rrhh_system

# El servidor sincronizará automáticamente las tablas en desarrollo
\`\`\`

### 5. Ejecutar el servidor
\`\`\`bash
# Desarrollo
npm run dev

# Producción
npm start
\`\`\`

## Estructura del Proyecto

\`\`\`
rrhh-iso715/
├── config/
│   └── database.js          # Configuración de Sequelize
├── controllers/             # Controladores de API
│   ├── AuthController.js
│   ├── CandidatoController.js
│   ├── CompetenciaController.js
│   └── ReportController.js
├── middleware/
│   └── auth.js              # Middleware de autenticación
├── models/                  # Modelos de Sequelize
│   ├── index.js
│   ├── User.js
│   ├── Candidato.js
│   ├── Competencia.js
│   ├── Idioma.js
│   ├── Capacitacion.js
│   ├── Puesto.js
│   ├── ExperienciaLaboral.js
│   └── Empleado.js
├── routes/                  # Rutas de Express
│   ├── auth.js
│   ├── candidatos.js
│   └── reports.js
├── services/                # Servicios de negocio
│   ├── CandidateStateMachine.js
│   └── ReportService.js
├── server.js               # Servidor principal
├── package.json
└── README.md
\`\`\`

## API Endpoints

### Autenticación
\`\`\`
POST /api/auth/login          # Iniciar sesión
POST /api/auth/register       # Registrar usuario
GET  /api/auth/profile        # Obtener perfil (requiere auth)
\`\`\`

### Candidatos
\`\`\`
GET    /api/candidatos             # Listar candidatos (paginado)
GET    /api/candidatos/search      # Buscar por criterios
GET    /api/candidatos/:id         # Obtener candidato específico
POST   /api/candidatos             # Crear candidato
PUT    /api/candidatos/:id         # Actualizar candidato
DELETE /api/candidatos/:id         # Eliminar candidato (HR+)
POST   /api/candidatos/:id/change-state  # Cambiar estado
\`\`\`

### Reportes
\`\`\`
GET /api/reports/new-employees      # Reporte nuevos empleados (PDF)
GET /api/reports/candidates-summary # Resumen candidatos (PDF)
\`\`\`

### Otras Entidades
Todas siguen el patrón CRUD estándar:
\`\`\`
GET    /api/{entity}          # Listar
GET    /api/{entity}/:id      # Obtener por ID
POST   /api/{entity}          # Crear
PUT    /api/{entity}/:id      # Actualizar
DELETE /api/{entity}/:id      # Eliminar
\`\`\`

Entidades: \`competencias\`, \`idiomas\`, \`capacitaciones\`, \`puestos\`, \`empleados\`

## Ejemplos de Uso

### 1. Autenticación
\`\`\`bash
# Registrar usuario
curl -X POST http://localhost:3001/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "admin",
    "email": "admin@empresa.com",
    "password": "123456",
    "role": "admin"
  }'

# Iniciar sesión
curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@empresa.com",
    "password": "123456"
  }'
\`\`\`

### 2. Crear Candidato
\`\`\`bash
curl -X POST http://localhost:3001/api/candidatos \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nombres": "Juan Carlos",
    "apellidos": "Pérez González",
    "email": "juan.perez@email.com",
    "telefono": "+57 300 123 4567",
    "documento_identidad": "12345678",
    "salario_aspirado": 3500000,
    "disponibilidad": "15_dias"
  }'
\`\`\`

### 3. Cambiar Estado de Candidato
\`\`\`bash
curl -X POST http://localhost:3001/api/candidatos/1/change-state \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "REVIEW",
    "observaciones": "Candidato con buen perfil técnico"
  }'
\`\`\`

### 4. Generar Reporte
\`\`\`bash
# Reporte de nuevos empleados del último mes
curl -X GET "http://localhost:3001/api/reports/new-employees?fechaInicio=2024-01-01&fechaFin=2024-01-31" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  --output reporte_empleados.pdf
\`\`\`

## Estados del Candidato

El sistema implementa una máquina de estados para el proceso de selección:

1. **Aplicado** → Estado inicial cuando se registra el candidato
2. **En Revisión** → CV y perfil bajo evaluación
3. **Preseleccionado** → Candidato pasa filtros iniciales
4. **Entrevista Inicial** → Primera entrevista programada
5. **Entrevista Técnica** → Evaluación técnica específica
6. **Entrevista Final** → Entrevista con gerencia/director
7. **Aprobado** → Candidato aprobado para contratación
8. **Contratado** → Candidato oficialmente contratado
9. **Rechazado** → Estado final de rechazo (en cualquier etapa)

## Roles y Permisos

- **Recruiter:** CRUD candidatos, cambiar estados, consultas
- **HR Manager:** Todo lo anterior + eliminar candidatos, generar reportes
- **Admin:** Acceso completo al sistema

## Testing

\`\`\`bash
npm test
\`\`\`

## Contribución

1. Fork el proyecto
2. Crear rama feature (\`git checkout -b feature/nueva-funcionalidad\`)
3. Commit cambios (\`git commit -am 'Agregar nueva funcionalidad'\`)
4. Push a la rama (\`git push origin feature/nueva-funcionalidad\`)
5. Crear Pull Request

## Licencia

ISC License

## Soporte

Para reportar bugs o solicitar nuevas funcionalidades, crear un issue en el repositorio.