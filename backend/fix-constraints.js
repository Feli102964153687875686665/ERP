const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function fixConstraints() {
  try {
    console.log('🔧 Iniciando corrección de restricciones...');
    
    // Eliminar y recrear restricción en ordenes
    console.log('📦 Actualizando tabla ordenes...');
    await pool.query('ALTER TABLE ordenes DROP CONSTRAINT IF EXISTS ordenes_estado_check');
    await pool.query("ALTER TABLE ordenes ADD CONSTRAINT ordenes_estado_check CHECK (estado IN ('pendiente', 'en_curso', 'finalizado', 'cancelado'))");
    console.log('✅ Tabla ordenes actualizada correctamente');
    
    // Eliminar y recrear restricción en solicitudes
    console.log('📝 Actualizando tabla solicitudes...');
    await pool.query('ALTER TABLE solicitudes DROP CONSTRAINT IF EXISTS solicitudes_estado_check');
    await pool.query("ALTER TABLE solicitudes ADD CONSTRAINT solicitudes_estado_check CHECK (estado IN ('pendiente', 'en_curso', 'finalizado', 'cancelado'))");
    console.log('✅ Tabla solicitudes actualizada correctamente');
    
    console.log('🎉 ¡Restricciones actualizadas exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixConstraints();
