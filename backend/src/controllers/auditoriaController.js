// Controllers para Auditoría
const pool = require('../config/database');

const obtenerTodos = async (req, res) => {
  try {
    console.log('📋 [AUDITORIA] Obteniendo registros de auditoría...');
    const limite = req.query.limite || 100;
    const result = await pool.query(
      `SELECT a.*, u.nombre as nombre_usuario 
       FROM auditoria a 
       LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario 
       ORDER BY a.fecha_operacion DESC 
       LIMIT $1`,
      [limite]
    );
    console.log(`✅ [AUDITORIA] ${result.rows.length} registros encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.log('❌ [AUDITORIA] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    console.log('🔍 [AUDITORIA] Buscando registro ID:', req.params.id);
    const result = await pool.query('SELECT * FROM auditoria WHERE id_auditoria = $1', [req.params.id]);
    if (result.rows.length === 0) {
      console.log('❌ [AUDITORIA] Registro no encontrado');
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    console.log('✅ [AUDITORIA] Registro encontrado');
    res.json(result.rows[0]);
  } catch (error) {
    console.log('❌ [AUDITORIA] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const registrar = async (req, res) => {
  try {
    console.log('📝 [AUDITORIA REGISTRO] Nueva entrada -', req.body.tipo_operacion, 'en tabla:', req.body.tabla_afectada);
    const { id_usuario, tabla_afectada, tipo_operacion, descripcion } = req.body;
    const result = await pool.query(
      'INSERT INTO auditoria (id_usuario, tabla_afectada, tipo_operacion, descripcion) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_usuario, tabla_afectada, tipo_operacion, descripcion]
    );
    console.log('✅ [AUDITORIA REGISTRO] Registro insertado correctamente');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log('❌ [AUDITORIA REGISTRO] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  registrar
};
