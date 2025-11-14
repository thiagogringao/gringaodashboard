const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', err.stack);

  // Erro de conexão com banco de dados
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({
      success: false,
      message: 'Conexão com banco de dados perdida'
    });
  }

  if (err.code === 'ER_BAD_DB_ERROR') {
    return res.status(500).json({
      success: false,
      message: 'Banco de dados não encontrado'
    });
  }

  // Erro de autenticação do banco
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(500).json({
      success: false,
      message: 'Erro de autenticação no banco de dados'
    });
  }

  // Erro genérico
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
