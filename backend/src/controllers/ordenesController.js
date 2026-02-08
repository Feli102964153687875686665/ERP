// Controllers para Órdenes
const pool = require('../config/database');
const { validarEstadoOrden } = require('../utils/validations');

const obtenerTodos = async (req, res) => {
  try {
    console.log('📋 [ORDENES] Obteniendo todas las órdenes...');
    const result = await pool.query(`
      SELECT o.*, 
             s.nombre_solicitud,
             c.nombre as nombre_cliente,
             u.nombre as nombre_tecnico 
      FROM ordenes o 
      JOIN solicitudes s ON o.id_solicitud = s.id_solicitud
      JOIN clientes c ON o.id_cliente = c.id_cliente
      LEFT JOIN usuarios u ON o.id_tecnico = u.id_usuario 
      ORDER BY o.fecha_inicio DESC
    `);
    console.log(`✅ [ORDENES] ${result.rows.length} órdenes encontradas`);
    res.json(result.rows);
  } catch (error) {
    console.log('❌ [ORDENES] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    console.log('🔍 [ORDENES] Buscando orden ID:', req.params.id);
    const id = parseInt(req.params.id);
    const result = await pool.query(`
      SELECT o.*, 
             s.nombre_solicitud,
             c.nombre as nombre_cliente,
             u.nombre as nombre_tecnico 
      FROM ordenes o 
      JOIN solicitudes s ON o.id_solicitud = s.id_solicitud
      JOIN clientes c ON o.id_cliente = c.id_cliente
      LEFT JOIN usuarios u ON o.id_tecnico = u.id_usuario 
      WHERE o.id_orden = $1
    `, [id]);
    if (result.rows.length === 0) {
      console.log('❌ [ORDENES] Orden no encontrada');
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    console.log('✅ [ORDENES] Orden encontrada - Solicitud:', result.rows[0].nombre_solicitud);
    res.json(result.rows[0]);
  } catch (error) {
    console.log('❌ [ORDENES] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const { id_solicitud, id_cliente, id_tecnico, fecha_inicio, fecha_cierre, estado, observaciones } = req.body;
    
    console.log('🆕 [ORDENES CREATE] Datos recibidos:', { id_solicitud, id_cliente, id_tecnico, fecha_inicio });
    
    // Validar datos requeridos
    if (!id_solicitud || !id_cliente || !fecha_inicio) {
      console.log('❌ [ORDENES CREATE] Faltan campos requeridos');
      return res.status(400).json({ error: 'Faltan campos requeridos: id_solicitud, id_cliente, fecha_inicio' });
    }

    // Obtener nombre_solicitud desde la tabla solicitudes
    console.log('🔍 [ORDENES CREATE] Buscando solicitud:', id_solicitud);
    const solicitudRes = await pool.query(
      'SELECT nombre_solicitud FROM solicitudes WHERE id_solicitud = $1',
      [id_solicitud]
    );
    
    if (solicitudRes.rows.length === 0) {
      console.log('❌ [ORDENES CREATE] Solicitud no encontrada');
      return res.status(400).json({ error: 'Solicitud no encontrada' });
    }

    const nombre_solicitud = solicitudRes.rows[0].nombre_solicitud;

    // Obtener nombre_cliente desde la tabla clientes
    console.log('🔍 [ORDENES CREATE] Buscando cliente:', id_cliente);
    const clienteRes = await pool.query(
      'SELECT nombre FROM clientes WHERE id_cliente = $1',
      [id_cliente]
    );
    
    if (clienteRes.rows.length === 0) {
      console.log('❌ [ORDENES CREATE] Cliente no encontrado');
      return res.status(400).json({ error: 'Cliente no encontrado' });
    }

    const nombre_cliente = clienteRes.rows[0].nombre;

    // Obtener nombre_tecnico si existe id_tecnico
    let nombre_tecnico = null;
    if (id_tecnico) {
      console.log('🔍 [ORDENES CREATE] Buscando técnico:', id_tecnico);
      const tecnicoRes = await pool.query(
        'SELECT nombre, activo FROM usuarios WHERE id_usuario = $1',
        [id_tecnico]
      );

      if (tecnicoRes.rows.length === 0) {
        console.log('❌ [ORDENES CREATE] Técnico no encontrado');
        return res.status(400).json({ error: 'Técnico no encontrado' });
      }

      if (!tecnicoRes.rows[0].activo) {
        console.log('❌ [ORDENES CREATE] Técnico inactivo');
        return res.status(400).json({ error: 'No se puede asignar una orden a un técnico inactivo' });
      }

      nombre_tecnico = tecnicoRes.rows[0].nombre;
    }

    const result = await pool.query(
      `INSERT INTO ordenes 
       (id_solicitud, id_cliente, id_tecnico, fecha_inicio, fecha_cierre, estado, observaciones, nombre_solicitud, nombre_cliente, nombre_tecnico) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [id_solicitud, id_cliente, id_tecnico || null, fecha_inicio, fecha_cierre || null, estado || 'pendiente', observaciones || null, nombre_solicitud, nombre_cliente, nombre_tecnico || null]
    );
    console.log('✅ [ORDENES CREATE] Orden creada ID:', result.rows[0].id_orden);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ [ORDENES CREATE ERROR]', error.message);
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const { estado, fecha_cierre, observaciones } = req.body;
    const id = parseInt(req.params.id);
    console.log('✏️ [ORDENES UPDATE] Actualizando ID:', id, '- Nuevo estado:', estado);

    // Validar ID
    if (!id || isNaN(id)) {
      console.log('❌ [ORDENES UPDATE] ID de orden inválido');
      return res.status(400).json({ error: 'ID de orden inválido' });
    }

    // Validar estado si se proporciona
    if (estado && !validarEstadoOrden(estado)) {
      console.log('❌ [ORDENES UPDATE] Estado inválido:', estado);
      return res.status(400).json({ error: 'Estado de orden inválido. Estados válidos: pendiente, en_curso, finalizado, cancelado' });
    }

    // Verificar que la orden existe primero
    const checkResult = await pool.query(
      'SELECT id_orden, id_solicitud FROM ordenes WHERE id_orden = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      console.log('❌ [ORDENES UPDATE] Orden no existe:', id);
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const id_solicitud = checkResult.rows[0].id_solicitud;

    // Si el usuario es técnico, sólo permitir actualizar 'estado' y 'observaciones'
    if (req.user && req.user.rol === 'tecnico') {
      console.log('👨‍💼 [ORDENES UPDATE] Actualizando como TECNICO');
      const updateResult = await pool.query(
        'UPDATE ordenes SET estado = $1, observaciones = $2, fecha_actualizacion = NOW() WHERE id_orden = $3 RETURNING *',
        [estado, observaciones || null, id]
      );
      
      if (updateResult.rows.length === 0) {
        console.log('❌ [ORDENES UPDATE] Error actualizando orden');
        return res.status(500).json({ error: 'Error al actualizar orden' });
      }

      // Si la orden se marca como finalizado, también marcar la solicitud como finalizado
      if (estado && estado.toLowerCase() === 'finalizado') {
        await pool.query(
          'UPDATE solicitudes SET estado = $1 WHERE id_solicitud = $2',
          ['finalizado', id_solicitud]
        );
        console.log('🔄 [ORDENES UPDATE] Solicitud sincronizada a finalizado');
      }
      
      // Retornar registro completo con LEFT JOINs para evitar fallos
      const result = await pool.query(`
        SELECT o.*, 
               s.nombre_solicitud,
               c.nombre as nombre_cliente,
               u.nombre as nombre_tecnico 
        FROM ordenes o 
        LEFT JOIN solicitudes s ON o.id_solicitud = s.id_solicitud
        LEFT JOIN clientes c ON o.id_cliente = c.id_cliente
        LEFT JOIN usuarios u ON o.id_tecnico = u.id_usuario 
        WHERE o.id_orden = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        console.log('❌ [ORDENES UPDATE] Error en SELECT después de actualizar');
        return res.status(500).json({ error: 'Error al recuperar orden después de actualizar' });
      }
      
      console.log('✅ [ORDENES UPDATE] Orden actualizada correctamente');
      return res.json(result.rows[0]);
    }

    // Administrador/coordinador: permiten actualizar estado, fecha_cierre y observaciones
    console.log('🔐 [ORDENES UPDATE] Actualizando como ADMIN/COORDINADOR');
    const updateResult = await pool.query(
      'UPDATE ordenes SET estado = $1, fecha_cierre = $2, observaciones = $3, fecha_actualizacion = NOW() WHERE id_orden = $4 RETURNING *',
      [estado, fecha_cierre || null, observaciones || null, id]
    );
    
    if (updateResult.rows.length === 0) {
      console.log('❌ [ORDENES UPDATE] Error actualizando orden');
      return res.status(500).json({ error: 'Error al actualizar orden' });
    }

    // Si la orden se marca como finalizado, también marcar la solicitud como finalizado
    if (estado && estado.toLowerCase() === 'finalizado') {
      await pool.query(
        'UPDATE solicitudes SET estado = $1 WHERE id_solicitud = $2',
        ['finalizado', id_solicitud]
      );
      console.log('🔄 [ORDENES UPDATE] Solicitud sincronizada a finalizado');
    }
    
    // Retornar registro completo con LEFT JOINs para evitar fallos
    const result = await pool.query(`
      SELECT o.*, 
             s.nombre_solicitud,
             c.nombre as nombre_cliente,
             u.nombre as nombre_tecnico 
      FROM ordenes o 
      LEFT JOIN solicitudes s ON o.id_solicitud = s.id_solicitud
      LEFT JOIN clientes c ON o.id_cliente = c.id_cliente
      LEFT JOIN usuarios u ON o.id_tecnico = u.id_usuario 
      WHERE o.id_orden = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      console.log('❌ [ORDENES UPDATE] Error en SELECT después de actualizar');
      return res.status(500).json({ error: 'Error al recuperar orden después de actualizar' });
    }
    
    console.log('✅ [ORDENES UPDATE] Orden actualizada correctamente - Estado:', estado);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ [ORDENES UPDATE ERROR]', error.message);
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    console.log('🗑️ [ORDENES DELETE] Eliminando orden ID:', req.params.id);
    await pool.query('DELETE FROM ordenes WHERE id_orden = $1', [req.params.id]);
    console.log('✅ [ORDENES DELETE] Orden eliminada correctamente');
    res.json({ success: true });
  } catch (error) {
    console.log('❌ [ORDENES DELETE] Error:', error.message);
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
