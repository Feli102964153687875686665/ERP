// Controllers para Clientes
const pool = require('../config/database');

const obtenerTodos = async (req, res) => {
  try {
    console.log('📋 [CLIENTES] Obteniendo todos los clientes...');
    const result = await pool.query('SELECT * FROM clientes WHERE activo = TRUE ORDER BY nombre');
    console.log(`✓ [CLIENTES] ${result.rows.length} clientes encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ [CLIENTES] Error al obtener:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    console.log('🔍 [CLIENTES] Buscando cliente ID:', req.params.id);
    const result = await pool.query('SELECT * FROM clientes WHERE id_cliente = $1', [req.params.id]);
    if (result.rows.length === 0) {
      console.log('❌ [CLIENTES] Cliente no encontrado');
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    console.log('✅ [CLIENTES] Cliente encontrado:', result.rows[0].nombre);
    res.json(result.rows[0]);
  } catch (error) {
    console.log('❌ [CLIENTES] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    console.log('🆕 [CLIENTES CREATE] Creando nuevo cliente:', req.body.nombre);
    const { nombre, tipo_documento, numero_documento, ciudad, direccion, telefono, email, contacto_principal } = req.body;
    const result = await pool.query(
      'INSERT INTO clientes (nombre, tipo_documento, numero_documento, ciudad, direccion, telefono, email, contacto_principal) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [nombre, tipo_documento, numero_documento, ciudad, direccion, telefono, email, contacto_principal]
    );
    console.log('✅ [CLIENTES CREATE] Cliente creado correctamente - ID:', result.rows[0].id_cliente);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ [CLIENTES CREATE ERROR]:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    console.log('✏️ [CLIENTES UPDATE] Actualizando cliente ID:', req.params.id);
    const { nombre, ciudad, telefono, email, direccion, contacto_principal } = req.body;
    
    const result = await pool.query(
      'UPDATE clientes SET nombre = $1, ciudad = $2, telefono = $3, email = $4, direccion = $5, contacto_principal = $6 WHERE id_cliente = $7 RETURNING *',
      [nombre, ciudad, telefono, email, direccion, contacto_principal || null, req.params.id]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ [CLIENTES UPDATE] Cliente no encontrado');
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    console.log('✅ [CLIENTES UPDATE] Cliente actualizado:', nombre);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ [CLIENTES UPDATE ERROR]:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    console.log('🗑️ [CLIENTES DELETE] Eliminando cliente ID:', req.params.id);
    await pool.query('DELETE FROM clientes WHERE id_cliente = $1', [req.params.id]);
    console.log('✅ [CLIENTES DELETE] Cliente eliminado correctamente');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
