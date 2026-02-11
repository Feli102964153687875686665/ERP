// Controllers para Usuarios
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  try {
    console.log('\n🔐 ========== INICIO DE LOGIN ==========');
    const { email, password } = req.body;
    console.log('📧 Email recibido:', email);
    
    // Validar que todos los campos estén presentes
    if (!email || !password) {
      console.log('❌ Campos faltantes');
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    
    console.log('🔍 Buscando usuario en base de datos...');
    
    // Buscar usuario por email (permitir login independientemente de `activo`)
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    
    console.log(`✓ Búsqueda completada: ${result.rows.length} usuario(s) encontrado(s)`);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];
    console.log('👤 Usuario encontrado:', { id: usuario.id_usuario, email: usuario.email, rol: usuario.rol });
    
    // Comparar contraseña (texto plano por ahora)
    if (usuario.password !== password) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log('✓ Contraseña válida');
    console.log('🔐 Generando JWT...');
    
    // Generar JWT
    const payload = { 
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // No devolver la contraseña
    delete usuario.password;

    console.log('✅ JWT Generado correctamente');
    console.log('📦 Payload del JWT:', payload);
    console.log('🎫 Token:', token.substring(0, 30) + '...');
    console.log('👥 Usuario autenticado:', usuario.email, '| Rol:', usuario.rol);
    console.log('========== FIN DE LOGIN ✓ ==========\n');
    
    res.json({ 
      success: true, 
      token,
      usuario
    });
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  res.json({ success: true });
};

const obtenerTodos = async (req, res) => {
  try {
    // Sin filtrar, mostrar todos incluso inactivos para admin
    const result = await pool.query('SELECT id_usuario, nombre, email, telefono, rol, departamento, activo, fecha_creacion FROM usuarios ORDER BY id_usuario');
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Obtener sólo técnicos activos (útil para listas de asignación)
const obtenerTecnicosActivos = async (req, res) => {
  try {
    const result = await pool.query("SELECT id_usuario, nombre, email, telefono FROM usuarios WHERE rol = 'tecnico' AND activo = TRUE ORDER BY nombre");
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo técnicos activos:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [req.params.id]);
    if (result.rows[0]) {
      delete result.rows[0].password;
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const { nombre, email, password, telefono, rol, departamento, activo } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !email || !password || !telefono || !rol) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Validar rol
    const rolesValidos = ['administrador', 'tecnico', 'coordinador'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, telefono, rol, departamento, activo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_usuario, nombre, email, telefono, rol, departamento, activo',
      [nombre, email, password, telefono, rol, departamento || null, activo !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando usuario:', error.message);
    // Manejar error de email duplicado
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El email ya existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const { nombre, email, password, telefono, rol, departamento, activo } = req.body;
    
    // Construir query dinámicamente según qué campos se envíen
    let query = 'UPDATE usuarios SET ';
    let params = [];
    let paramIndex = 1;

    if (nombre) {
      query += `nombre = $${paramIndex++}, `;
      params.push(nombre);
    }
    if (email) {
      query += `email = $${paramIndex++}, `;
      params.push(email);
    }
    if (password) {
      query += `password = $${paramIndex++}, `;
      params.push(password);
    }
    if (telefono) {
      query += `telefono = $${paramIndex++}, `;
      params.push(telefono);
    }
    if (rol) {
      query += `rol = $${paramIndex++}, `;
      params.push(rol);
    }
    if (departamento !== undefined) {
      query += `departamento = $${paramIndex++}, `;
      params.push(departamento || null);
    }
    if (activo !== undefined) {
      query += `activo = $${paramIndex++}, `;
      params.push(activo);
    }

    // Remover la última coma y agregar la condición WHERE
    query = query.slice(0, -2) + ` WHERE id_usuario = $${paramIndex} RETURNING id_usuario, nombre, email, telefono, rol, departamento, activo`;
    params.push(req.params.id);

    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando usuario:', error.message);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El email ya existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id_usuario = $1', [req.params.id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando usuario:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  login,
  logout,
  obtenerTodos,
  obtenerTecnicosActivos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
