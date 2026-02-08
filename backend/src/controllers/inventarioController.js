// Controllers para Inventario
const pool = require('../config/database');

const obtenerTodos = async (req, res) => {
  try {
    console.log('📋 [INVENTARIO] Obteniendo todos los items...');
    const result = await pool.query('SELECT * FROM inventario WHERE activo = TRUE ORDER BY nombre');
    console.log(`✅ [INVENTARIO] ${result.rows.length} items encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.log('❌ [INVENTARIO] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    console.log('🔍 [INVENTARIO] Buscando item ID:', req.params.id);
    const result = await pool.query('SELECT * FROM inventario WHERE id_item = $1', [req.params.id]);
    if (result.rows.length === 0) {
      console.log('❌ [INVENTARIO] Item no encontrado');
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    console.log('✅ [INVENTARIO] Item encontrado:', result.rows[0].nombre);
    res.json(result.rows[0]);
  } catch (error) {
    console.log('❌ [INVENTARIO] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const obtenerBajo = async (req, res) => {
  try {
    console.log('⚠️ [INVENTARIO] Obteniendo items con bajo stock...');
    const result = await pool.query('SELECT * FROM inventario_bajo');
    console.log(`✅ [INVENTARIO] ${result.rows.length} items con bajo stock`);
    res.json(result.rows);
  } catch (error) {
    console.log('❌ [INVENTARIO] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    console.log('🆕 [INVENTARIO CREATE] Datos recibidos:', { nombre: req.body.nombre, codigo_interno: req.body.codigo_interno, categoria: req.body.categoria });
    const { nombre, descripcion, cantidad_disponible, cantidad, cantidad_minima, categoria, codigo_interno, precio_unitario, unidad_medida, proveedor, ubicacion } = req.body;
    
    // Validar datos requeridos
    if (!nombre || !codigo_interno || !categoria) {
      console.log('❌ [INVENTARIO CREATE] Faltan campos requeridos');
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Aceptar cantidad_disponible o cantidad (frontend envía cantidad_disponible)
    // Manejar correctamente valores numéricos
    let cantidadFinal = 0;
    if (cantidad_disponible !== undefined && cantidad_disponible !== null && cantidad_disponible !== '') {
      cantidadFinal = parseInt(cantidad_disponible, 10);
    } else if (cantidad !== undefined && cantidad !== null && cantidad !== '') {
      cantidadFinal = parseInt(cantidad, 10);
    }
    
    let cantidadMiniFinal = 5;
    if (cantidad_minima !== undefined && cantidad_minima !== null && cantidad_minima !== '') {
      cantidadMiniFinal = parseInt(cantidad_minima, 10);
    }
    
    let precioUnitarioFinal = 0;
    if (precio_unitario !== undefined && precio_unitario !== null && precio_unitario !== '') {
      precioUnitarioFinal = parseFloat(precio_unitario);
    }

    const result = await pool.query(
      `INSERT INTO inventario 
       (nombre, descripcion, cantidad_disponible, cantidad_minima, categoria, codigo_interno, precio_unitario, proveedor) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nombre, descripcion || null, cantidadFinal, cantidadMiniFinal, categoria, codigo_interno, precioUnitarioFinal, proveedor || null]
    );
    console.log('✅ [INVENTARIO CREATE] Item creado ID:', result.rows[0].id_item);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ [INVENTARIO CREATE ERROR]', error.message);
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    console.log('✏️ [INVENTARIO UPDATE] Actualizando ID:', req.params.id);
    const { nombre, descripcion, cantidad_disponible, cantidad, cantidad_minima, categoria, precio_unitario, proveedor } = req.body;
    
    // Aceptar cantidad_disponible o cantidad (frontend envía cantidad_disponible)
    // Manejar correctamente valores numéricos
    let cantidadFinal = 0;
    if (cantidad_disponible !== undefined && cantidad_disponible !== null && cantidad_disponible !== '') {
      cantidadFinal = parseInt(cantidad_disponible, 10);
    } else if (cantidad !== undefined && cantidad !== null && cantidad !== '') {
      cantidadFinal = parseInt(cantidad, 10);
    }
    
    let cantidadMiniFinal = 5;
    if (cantidad_minima !== undefined && cantidad_minima !== null && cantidad_minima !== '') {
      cantidadMiniFinal = parseInt(cantidad_minima, 10);
    }
    
    let precioUnitarioFinal = 0;
    if (precio_unitario !== undefined && precio_unitario !== null && precio_unitario !== '') {
      precioUnitarioFinal = parseFloat(precio_unitario);
    }

    const result = await pool.query(
      'UPDATE inventario SET nombre = $1, descripcion = $2, cantidad_disponible = $3, cantidad_minima = $4, categoria = $5, precio_unitario = $6, proveedor = $7 WHERE id_item = $8 RETURNING *',
      [nombre, descripcion || null, cantidadFinal, cantidadMiniFinal, categoria, precioUnitarioFinal, proveedor || null, req.params.id]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ [INVENTARIO UPDATE] Item no encontrado');
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    
    console.log('✅ [INVENTARIO UPDATE] Item actualizado correctamente -', result.rows[0].nombre);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ [INVENTARIO UPDATE ERROR]', error.message);
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    console.log('🗑️ [INVENTARIO DELETE] Eliminando item ID:', req.params.id);
    await pool.query('DELETE FROM inventario WHERE id_item = $1', [req.params.id]);
    console.log('✅ [INVENTARIO DELETE] Item eliminado correctamente');
    res.json({ success: true });
  } catch (error) {
    console.log('❌ [INVENTARIO DELETE] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  obtenerBajo,
  crear,
  actualizar,
  eliminar
};
