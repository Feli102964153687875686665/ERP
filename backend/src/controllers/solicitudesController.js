// Controllers para Solicitudes
const pool = require('../config/database');
const { validarEstadoSolicitud } = require('../utils/validations');

const obtenerTodos = async (req, res) => {
  try {
    console.log('📋 [SOLICITUDES] Obteniendo todas las solicitudes...');
    const result = await pool.query(`
      SELECT s.*, c.nombre as nombre_cliente, c.email as cliente_email, c.ciudad as cliente_ciudad
      FROM solicitudes s 
      JOIN clientes c ON s.id_cliente = c.id_cliente 
      ORDER BY s.fecha_creacion DESC
    `);
    console.log(`✅ [SOLICITUDES] ${result.rows.length} solicitudes encontradas`);
    res.json(result.rows);
  } catch (error) {
    console.log('❌ [SOLICITUDES] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    console.log('🔍 [SOLICITUDES] Buscando solicitud ID:', req.params.id);
    const id = parseInt(req.params.id);
    const result = await pool.query(`
      SELECT s.*, c.nombre as nombre_cliente 
      FROM solicitudes s 
      JOIN clientes c ON s.id_cliente = c.id_cliente 
      WHERE s.id_solicitud = $1
    `, [id]);
    if (result.rows.length === 0) {
      console.log('❌ [SOLICITUDES] Solicitud no encontrada');
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    console.log('✅ [SOLICITUDES] Solicitud encontrada:', result.rows[0].nombre_solicitud);
    res.json(result.rows[0]);
  } catch (error) {
    console.log('❌ [SOLICITUDES] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    console.log('🆕 [SOLICITUDES CREATE] Datos recibidos:', { id_cliente: req.body.id_cliente, nombre_solicitud: req.body.nombre_solicitud });
    const { id_cliente, nombre_solicitud, descripcion, prioridad, estado } = req.body;
    
    if (!id_cliente || !nombre_solicitud) {
      console.log('❌ [SOLICITUDES CREATE] Faltan campos requeridos');
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await pool.query(
      'INSERT INTO solicitudes (id_cliente, nombre_solicitud, descripcion, prioridad, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id_cliente, nombre_solicitud, descripcion, prioridad || 'normal', estado || 'en_curso']
    );
    
    // Obtener la solicitud con el JOIN para traer nombre_cliente
    const fullResult = await pool.query(`
      SELECT s.*, c.nombre as nombre_cliente, c.email as cliente_email, c.ciudad as cliente_ciudad
      FROM solicitudes s 
      JOIN clientes c ON s.id_cliente = c.id_cliente 
      WHERE s.id_solicitud = $1
    `, [result.rows[0].id_solicitud]);
    
    console.log('✅ [SOLICITUDES CREATE] Solicitud creada ID:', fullResult.rows[0].id_solicitud);
    res.status(201).json(fullResult.rows[0]);
  } catch (error) {
    console.error('❌ [SOLICITUDES CREATE ERROR]', error.message);
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    console.log('✏️ [SOLICITUDES UPDATE] Actualizando ID:', req.params.id);
    const { nombre_solicitud, descripcion, estado, prioridad } = req.body;
    const id = parseInt(req.params.id);
    
    // Validar que id es válido
    if (!id || isNaN(id)) {
      console.log('❌ [SOLICITUDES UPDATE] ID de solicitud inválido');
      return res.status(400).json({ error: 'ID de solicitud inválido' });
    }

    // Validar estado si se proporciona
    if (estado && !validarEstadoSolicitud(estado)) {
      console.log('❌ [SOLICITUDES UPDATE] Estado inválido:', estado);
      return res.status(400).json({ error: 'Estado de solicitud inválido. Estados válidos: pendiente, en_curso, finalizado, cancelado' });
    }
    
    // Verificar que la solicitud existe primero
    const checkResult = await pool.query(
      'SELECT id_solicitud, id_cliente FROM solicitudes WHERE id_solicitud = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      console.log('❌ [SOLICITUDES UPDATE] Solicitud no existe:', id);
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    const id_cliente = checkResult.rows[0].id_cliente;
    
    // Actualizar solicitud
    const updateResult = await pool.query(
      `UPDATE solicitudes 
       SET nombre_solicitud = $1, descripcion = $2, estado = $3, prioridad = $4
       WHERE id_solicitud = $5 
       RETURNING *`,
      [nombre_solicitud, descripcion, estado, prioridad, id]
    );
    
    if (updateResult.rows.length === 0) {
      console.log('❌ [SOLICITUDES UPDATE] Error actualizando solicitud:', id);
      return res.status(500).json({ error: 'Error al actualizar solicitud' });
    }

    // Si el estado cambió, sincronizar con las órdenes relacionadas
    if (estado) {
      console.log('🔄 [SOLICITUDES UPDATE] Sincronizando órdenes con nuevo estado:', estado);
      await pool.query(
        'UPDATE ordenes SET estado = $1 WHERE id_solicitud = $2',
        [estado, id]
      );
      console.log('✅ [SOLICITUDES UPDATE] Órdenes sincronizadas');
    }
    
    // Obtener datos completos con LEFT JOIN para respuesta (en caso de cliente inactivo)
    const fullResult = await pool.query(`
      SELECT s.*, c.nombre as nombre_cliente, c.email as cliente_email, c.ciudad as cliente_ciudad
      FROM solicitudes s 
      LEFT JOIN clientes c ON s.id_cliente = c.id_cliente 
      WHERE s.id_solicitud = $1
    `, [id]);
    
    if (fullResult.rows.length === 0) {
      console.log('❌ [SOLICITUDES UPDATE] Error en SELECT después de actualizar:', id);
      return res.status(500).json({ error: 'Error al recuperar solicitud después de actualizar' });
    }
    
    console.log('✅ [SOLICITUDES UPDATE] Solicitud actualizada correctamente - Estado:', fullResult.rows[0].estado);
    res.json(fullResult.rows[0]);
  } catch (error) {
    console.error('❌ [SOLICITUDES UPDATE ERROR]', error.message);
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    console.log('🗑️ [SOLICITUDES DELETE] Eliminando solicitud ID:', req.params.id);
    await pool.query('DELETE FROM solicitudes WHERE id_solicitud = $1', [req.params.id]);
    console.log('✅ [SOLICITUDES DELETE] Solicitud eliminada correctamente');
    res.json({ success: true });
  } catch (error) {
    console.log('❌ [SOLICITUDES DELETE] Error:', error.message);
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
