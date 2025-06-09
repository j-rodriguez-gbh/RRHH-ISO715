const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const { sequelize } = require('./models');
const ReportService = require('./services/ReportService');

// Import routes
const authRoutes = require('./routes/auth');
const candidatoRoutes = require('./routes/candidatos');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidatos', candidatoRoutes);
app.use('/api/reports', reportRoutes);

// Basic CRUD routes for other entities (simplified)
app.use('/api/competencias', require('./routes/competencias'));
app.use('/api/idiomas', require('./routes/idiomas'));
app.use('/api/capacitaciones', require('./routes/capacitaciones'));
app.use('/api/puestos', require('./routes/puestos'));
app.use('/api/empleados', require('./routes/empleados'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Sistema de Reclutamiento y Selección de RH'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Database initialization and server startup
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Sync database models
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos de base de datos sincronizados.');
    }

    // Initialize JSReport
    await ReportService.initialize();
    console.log('✅ Servicio de reportes inicializado.');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📝 Documentación de API disponible en: http://localhost:${PORT}/api/health`);
      console.log(`🔗 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('⏹️  Cerrando servidor...');
      await ReportService.close();
      await sequelize.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; 