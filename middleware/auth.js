const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Token inválido o usuario inactivo' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    next();
  };
};

// Specific role middleware functions
const adminOnly = roleMiddleware(['admin']);
const hrManagerOrAdmin = roleMiddleware(['admin', 'hr_manager']);
const authenticated = authMiddleware;

module.exports = {
  authMiddleware,
  roleMiddleware,
  adminOnly,
  hrManagerOrAdmin,
  authenticated
}; 