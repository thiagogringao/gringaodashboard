const express = require('express');
const router = express.Router();
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

const {
  getEcommerceProdutos,
  getEcommerceProdutoByCodigo,
  getEcommerceMetrics,
  getEcommerceMetricsDetails,
  getEcommerceProdutoImagem
} = require('../controllers/ecommerceController');

const {
  getLojaFisicaProdutos,
  getLojaFisicaProdutoByCodigo,
  getLojaFisicaProdutosPicosQueda,
  getLojaFisicaProdutosAbaixoEstoqueIdeal,
  getLojaFisicaMetrics,
  getLojaFisicaMetricsDetails,
  getLojaFisicaProdutoImagem
} = require('../controllers/lojaFisicaController');

// Rotas E-commerce com cache (5 minutos)
router.get('/ecommerce/metrics/:type', cacheMiddleware(300), getEcommerceMetricsDetails); // Detalhes das métricas
router.get('/ecommerce/metrics', cacheMiddleware(300), getEcommerceMetrics); // Métricas gerais
router.get('/ecommerce/:codigo/imagem', cacheMiddleware(86400), getEcommerceProdutoImagem); // Imagem (cache 1 dia)
router.get('/ecommerce', cacheMiddleware(300), getEcommerceProdutos);
router.get('/ecommerce/:codigo', cacheMiddleware(600), getEcommerceProdutoByCodigo);

// Rotas Loja Física com cache (5 minutos para lista, 10 minutos para detalhes)
router.get('/loja-fisica/metrics/:type', cacheMiddleware(300), getLojaFisicaMetricsDetails); // Detalhes das métricas
router.get('/loja-fisica/metrics', cacheMiddleware(300), getLojaFisicaMetrics); // Métricas gerais
router.get('/loja-fisica/:codigo/imagem', cacheMiddleware(86400), getLojaFisicaProdutoImagem); // Imagem (cache 1 dia)
router.get('/loja-fisica', cacheMiddleware(300), getLojaFisicaProdutos);
router.get('/loja-fisica/picos-queda', cacheMiddleware(300), getLojaFisicaProdutosPicosQueda);
router.get('/loja-fisica/abaixo-estoque-ideal', cacheMiddleware(300), getLojaFisicaProdutosAbaixoEstoqueIdeal);
router.get('/loja-fisica/:codigo', cacheMiddleware(600), getLojaFisicaProdutoByCodigo); // 10 min cache para detalhes

module.exports = router;
