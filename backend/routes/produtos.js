const express = require('express');
const router = express.Router();
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

const {
  getEcommerceProdutos,
  getEcommerceProdutoByCodigo
} = require('../controllers/ecommerceController');

const {
  getLojaFisicaProdutos,
  getLojaFisicaProdutoByCodigo,
  getLojaFisicaProdutosPicosQueda,
  getLojaFisicaProdutosAbaixoEstoqueIdeal
} = require('../controllers/lojaFisicaController');

// Rotas E-commerce com cache (5 minutos)
router.get('/ecommerce', cacheMiddleware(300), getEcommerceProdutos);
router.get('/ecommerce/:codigo', cacheMiddleware(600), getEcommerceProdutoByCodigo);

// Rotas Loja Física com cache (5 minutos para lista, 10 minutos para detalhes)
router.get('/loja-fisica', cacheMiddleware(300), getLojaFisicaProdutos);
router.get('/loja-fisica/picos-queda', cacheMiddleware(300), getLojaFisicaProdutosPicosQueda);
router.get('/loja-fisica/abaixo-estoque-ideal', cacheMiddleware(300), getLojaFisicaProdutosAbaixoEstoqueIdeal);
router.get('/loja-fisica/:codigo', cacheMiddleware(600), getLojaFisicaProdutoByCodigo); // 10 min cache para detalhes

module.exports = router;
