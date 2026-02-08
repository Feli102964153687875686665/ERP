// Middleware de autenticación con JWT
const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

const autorizarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rol = req.user?.rol;
    
    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    next();
  };
};

module.exports = {
  autenticar,
  autorizarRol
};
