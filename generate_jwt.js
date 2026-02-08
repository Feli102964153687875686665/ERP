const db = require('./backend/src/config/database');
const jwt = require('jsonwebtoken');

function makeSecret() {
  return require('crypto').randomBytes(48).toString('base64');
}

(async () => {
  try {
    const res = await db.query('SELECT id_usuario, email, rol, nombre FROM usuarios LIMIT 1');
    if (!res.rows || res.rows.length === 0) {
      console.error('No se encontró ningún usuario en la tabla usuarios.');
      process.exit(1);
    }
    const user = res.rows[0];
    const secret = process.env.JWT_SECRET || makeSecret();
    const payload = {
      id_usuario: user.id_usuario,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre
    };
    const token = jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    console.log('--- JWT GENERATED ---');
    console.log('JWT_SECRET:', secret);
    console.log('TOKEN:', token);
    console.log('Payload:', payload);
    process.exit(0);
  } catch (err) {
    console.error('Error consultando usuarios:', err.message || err);
    process.exit(2);
  }
})();
