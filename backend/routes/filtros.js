/**
 * Rotas para filtros (fornecedores e categorias)
 */

const express = require('express');
const router = express.Router();
const { getFornecedores, getCategorias } = require('../controllers/filtrosController');
const { cacheMiddleware } = require('../middleware/cache');

// GET /api/filtros/fornecedores - Listar fornecedores
router.get('/fornecedores', cacheMiddleware(3600), getFornecedores); // Cache de 1 hora

// GET /api/filtros/categorias - Listar categorias
router.get('/categorias', cacheMiddleware(3600), getCategorias); // Cache de 1 hora

module.exports = router;
