// Configuración de conexión a PostgreSQL
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

let pool;
if (connectionString) {
  // Cuando se usa Supabase u otro proveedor en la nube, pasar connectionString
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // Usar variables individuales (sin credenciales hardcodeadas)
  pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    database: process.env.DB_NAME
  });
}

pool.on('connect', () => {
  console.log('✅ Conexión a PostgreSQL: pool conectado');
});

pool.on('error', (err) => {
  console.error('❌ Error en pool de conexión:', err.message || err);
});

// Función para testear conexión (no ejecutamos querys al importar el módulo)
pool.testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL accesible. Hora del servidor:', res.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ No se pudo conectar a PostgreSQL:', err.message || err);
    return false;
  }
};

module.exports = pool;
