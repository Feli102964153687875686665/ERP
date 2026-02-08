// Middleware para autorización por rol
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!allowedRoles.includes(user.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }

    next();
  };
};

module.exports = { authorizeRole };
