const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../controllers/authController');

// Middleware para verificar autenticação
const authenticate = (req, res, next) => {
  try {
    // Pegar token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    const token = parts[1];

    // Verificar token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido ou expirado'
        });
      }

      // Adicionar dados do usuário na requisição
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar autenticação',
      error: error.message
    });
  }
};

// Middleware para verificar se é admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores.'
    });
  }
  next();
};

// Middleware opcional de autenticação (não bloqueia se não tiver token)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
      }
      next();
    });
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  isAdmin,
  optionalAuth
};

