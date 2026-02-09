const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Importar rutas
const usuariosRouter = require('./src/routes/usuarios');
const clientesRouter = require('./src/routes/clientes');
const solicitudesRouter = require('./src/routes/solicitudes');
const ordenesRouter = require('./src/routes/ordenes');
const inventarioRouter = require('./src/routes/inventario');
const auditoriaRouter = require('./src/routes/auditoria');

const app = express();

// Configurar Express para aceptar headers más grandes
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// CORS con credenciales - permitir configurar uno o varios orígenes en producción
// FRONTEND_URLS puede ser una lista separada por comas: https://app1,https://app2
const rawFrontend = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000';
const ALLOWED_ORIGINS = rawFrontend.split(',').map(s => s.trim()).filter(Boolean);
console.log('Allowed CORS origins:', ALLOWED_ORIGINS);

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests like curl/postman (no origin)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed - ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rutas API (antes de servir archivos estáticos)
app.use('/api/usuarios', usuariosRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/solicitudes', solicitudesRouter);
app.use('/api/ordenes', ordenesRouter);
app.use('/api/inventario', inventarioRouter);
app.use('/api/auditoria', auditoriaRouter);

// Health check
// Health check que incluye estado de conexión a BD
const db = require('./src/config/database');

app.get('/health', async (req, res) => {
  const dbOk = await db.testConnection().catch(() => false);
  const status = dbOk ? 'OK' : 'DEGRADED';
  res.json({ status, database: dbOk ? 'connected' : 'unavailable' });
});

// Servir archivos estáticos del frontend React (build)
// En desarrollo, React dev server se ejecuta en puerto 3000
// En producción, descomenta estas líneas:
// app.use(express.static(path.join(__dirname, '../frontend/build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
// });

// Manejo de errores global
// Capturar errores de parseo JSON (body-parser) y devolver 400 en lugar de 500
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    console.error('Bad JSON received:', err.message);
    return res.status(400).json({ error: 'Bad JSON in request body' });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('SyntaxError parsing JSON:', err.message);
    return res.status(400).json({ error: 'Malformed JSON' });
  }
  // Fallback: error genérico
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? (err && err.message) : undefined
  });
});

// Puerto
const PORT = process.env.PORT || 3001;

(async () => {
  const dbOk = await db.testConnection().catch(() => false);
  if (!dbOk) {
    console.warn('⚠️  Atención: la conexión a la base de datos falló. El servidor se iniciará igualmente.');
  }
  app.listen(PORT, () => {
    console.log(`Servidor ERP corriendo en puerto ${PORT}`);
    console.log(`Frontend esperado en: ${FRONTEND_URL}`);
  });
})();
