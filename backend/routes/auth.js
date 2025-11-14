const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rotas protegidas (requer autenticação)
router.get('/me', authenticate, authController.me);

// Rotas admin (requer autenticação + role admin)
router.get('/usuarios', authenticate, isAdmin, authController.listarUsuarios);
router.put('/usuarios/:id', authenticate, authController.atualizarUsuario);
router.delete('/usuarios/:id', authenticate, isAdmin, authController.deletarUsuario);

module.exports = router;

