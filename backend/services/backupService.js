const { poolEcommerce, poolLojaFisica } = require('../config/database');
const redisClient = require('../config/redis');
const fs = require('fs').promises;
const path = require('path');

/**
 * Serviço de backup incremental do banco de dados
 */
class BackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.lastSyncFile = path.join(this.backupDir, 'last_sync.json');
  }

  /**
   * Inicializar diretório de backups
   */
  async initialize() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log('Diretório de backups inicializado');
    } catch (error) {
      console.error('Erro ao criar diretório de backups:', error);
    }
  }

  /**
   * Obter última data de sincronização
   */
  async getLastSync() {
    try {
      const data = await fs.readFile(this.lastSyncFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Se não existe, retornar data padrão (últimas 24 horas)
      return {
        ecommerce: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lojaFisica: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      };
    }
  }

  /**
   * Salvar última data de sincronização
   */
  async saveLastSync(schema, timestamp) {
    try {
      const lastSync = await this.getLastSync();
      lastSync[schema] = timestamp;
      await fs.writeFile(this.lastSyncFile, JSON.stringify(lastSync, null, 2));
    } catch (error) {
      console.error('Erro ao salvar última sincronização:', error);
    }
  }

  /**
   * Fazer backup incremental de produtos do e-commerce
   */
  async backupEcommerceProducts() {
    try {
      const lastSync = await this.getLastSync();
      const lastSyncDate = new Date(lastSync.ecommerce);

      console.log(`Backup incremental e-commerce desde: ${lastSyncDate.toISOString()}`);

      // Buscar produtos (backup completo - todos os produtos, SEM LIMIT)
      // Nota: Se a tabela tiver colunas updated_at/created_at, pode ser otimizado
      const query = `
        SELECT
          id,
          codigo,
          nome,
          preco,
          precoCusto,
          estoque,
          imagemURL,
          situacao
        FROM bling2_produtos
        ORDER BY id DESC
      `;

      const [rows] = await poolEcommerce.query(query);
      
      if (rows.length === 0) {
        console.log('Nenhum produto novo/atualizado no e-commerce');
        return { updated: 0, new: 0 };
      }

      // Salvar no Redis como cache (se disponível)
      if (redisClient.isReady || redisClient.isOpen) {
        try {
          const cacheKey = 'backup:ecommerce:products';
          await redisClient.setEx(cacheKey, 3600, JSON.stringify(rows)); // Cache de 1 hora
        } catch (redisError) {
          console.warn('Redis não disponível para cache de backup:', redisError.message);
        }
      }

      // Salvar em arquivo JSON incremental
      const backupFile = path.join(
        this.backupDir,
        `ecommerce_${new Date().toISOString().split('T')[0]}.json`
      );
      
      const existingData = await this.loadBackupFile(backupFile);
      const mergedData = this.mergeProducts(existingData, rows);
      
      await fs.writeFile(backupFile, JSON.stringify(mergedData, null, 2));

      // Atualizar última sincronização
      const now = new Date().toISOString();
      await this.saveLastSync('ecommerce', now);

      console.log(`Backup e-commerce: ${rows.length} produtos processados`);
      return { updated: rows.length, new: 0 };
    } catch (error) {
      console.error('Erro no backup de produtos e-commerce:', error);
      throw error;
    }
  }

  /**
   * Calcular análise de vendas para um produto
   */
  calcularAnaliseVendas(vendasMensais) {
    if (!vendasMensais || vendasMensais.length === 0) {
      return {
        estoqueMinimo: 0,
        mesPico: null,
        mediaMensal: 0,
        totalVendas: 0
      };
    }

    const totalVendas = vendasMensais.reduce((acc, venda) => acc + parseFloat(venda.quantidade || 0), 0);
    const mediaMensal = totalVendas / vendasMensais.length;

    const vendaMaxima = vendasMensais.reduce((max, venda) =>
      parseFloat(venda.quantidade) > parseFloat(max.quantidade) ? venda : max
    , vendasMensais[0]);

    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mesPico = vendaMaxima ? meses[vendaMaxima.mes - 1] : null;

    const estoqueMinimo = Math.ceil(mediaMensal * 1.5);

    return {
      estoqueMinimo,
      mesPico,
      mediaMensal: parseFloat(mediaMensal.toFixed(2)),
      totalVendas: parseInt(totalVendas)
    };
  }

  /**
   * Fazer backup incremental de produtos da loja física com análise de vendas
   */
  async backupLojaFisicaProducts() {
    try {
      const lastSync = await this.getLastSync();
      const lastSyncDate = new Date(lastSync.lojaFisica);

      console.log(`Backup incremental loja física desde: ${lastSyncDate.toISOString()}`);

      // Buscar produtos com estoque, fornecedor e imagem (SEM LIMIT - todos os produtos)
      const query = `
        SELECT
          p.CODIGO_INTERNO as codigoInterno,
          p.CODIGO_BARRAS as codigoBarras,
          p.DESCRICAO as descricao,
          p.DESCRICAO_RESUMIDA as descricaoResumida,
          p.CODIGO_FORNECEDOR as codigoFornecedor,
          COALESCE(e.SALDO_ATUAL, 0) as estoque,
          f.NOME as fornecedor,
          v.img as imagemBase64
        FROM produtos p
        LEFT JOIN estoque e ON p.CODIGO_INTERNO = e.CODIGO_INTERNO AND e.COD_LOCAL = '001'
        LEFT JOIN fornecedores f ON p.CODIGO_FORNECEDOR = f.CODIGO_FORNECEDOR
        LEFT JOIN vw_dprodutos v ON LPAD(p.CODIGO_INTERNO, 13, '0') = v.CODIGO_INTERNO
        ORDER BY p.CODIGO_INTERNO DESC
      `;

      const [rows] = await poolLojaFisica.query(query);
      
      if (rows.length === 0) {
        console.log('Nenhum produto encontrado na loja física');
        return { updated: 0, new: 0 };
      }

      // Buscar análise de vendas para todos os produtos de uma vez (OTIMIZADO)
      console.log(`Buscando análise de vendas para ${rows.length} produtos...`);
      
      // Buscar todas as vendas dos últimos 12 meses de uma vez
      const [todasVendas] = await poolLojaFisica.query(`
        SELECT
          CODIGO_PRODUTO as codigoProduto,
          MONTH(DATA) as mes,
          YEAR(DATA) as ano,
          SUM(QUANTIDADE) as quantidade
        FROM caixas_venda
        WHERE DATA >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY CODIGO_PRODUTO, YEAR(DATA), MONTH(DATA)
        ORDER BY CODIGO_PRODUTO, ano DESC, mes DESC
      `);
      
      // Organizar vendas por produto
      const vendasPorProduto = {};
      todasVendas.forEach(venda => {
        if (!vendasPorProduto[venda.codigoProduto]) {
          vendasPorProduto[venda.codigoProduto] = [];
        }
        vendasPorProduto[venda.codigoProduto].push(venda);
      });
      
      console.log(`Análise de vendas encontrada para ${Object.keys(vendasPorProduto).length} produtos`);
      
      // Processar produtos com análise
      const produtosComAnalise = rows.map(produto => {
        // Calcular análise de vendas
        const vendasMensais = vendasPorProduto[produto.codigoInterno] || [];
        const analise = this.calcularAnaliseVendas(vendasMensais);

        // Processar imagem
        let imagemBase64 = null;
        if (produto.imagemBase64) {
          if (produto.imagemBase64.startsWith('data:')) {
            imagemBase64 = produto.imagemBase64;
          } else if (produto.imagemBase64.startsWith('http://') || produto.imagemBase64.startsWith('https://')) {
            imagemBase64 = produto.imagemBase64;
          } else {
            imagemBase64 = `data:image/jpeg;base64,${produto.imagemBase64}`;
          }
        }

        return {
          ...produto,
          estoqueMinimo: analise.estoqueMinimo,
          mesPico: analise.mesPico,
          mediaMensal: analise.mediaMensal,
          totalVendas: analise.totalVendas,
          imagemBase64: imagemBase64
        };
      });
      
      console.log(`Total de produtos processados: ${produtosComAnalise.length}`);

      // Salvar no Redis como cache (se disponível)
      if (redisClient.isReady || redisClient.isOpen) {
        try {
          // Salvar todos os produtos
          const cacheKey = 'backup:loja-fisica:products';
          await redisClient.setEx(cacheKey, 3600, JSON.stringify(produtosComAnalise)); // Cache de 1 hora
          
          // Salvar índice por código para busca rápida (incluindo imagens)
          const indexKey = 'backup:loja-fisica:index';
          const index = {};
          produtosComAnalise.forEach(produto => {
            index[produto.codigoInterno] = {
              estoqueMinimo: produto.estoqueMinimo,
              mesPico: produto.mesPico,
              mediaMensal: produto.mediaMensal,
              totalVendas: produto.totalVendas,
              imagemBase64: produto.imagemBase64
            };
          });
          await redisClient.setEx(indexKey, 3600, JSON.stringify(index));
        } catch (redisError) {
          console.warn('Redis não disponível para cache de backup:', redisError.message);
        }
      }

      // Salvar em arquivo JSON incremental
      const backupFile = path.join(
        this.backupDir,
        `loja_fisica_${new Date().toISOString().split('T')[0]}.json`
      );
      
      const existingData = await this.loadBackupFile(backupFile);
      const mergedData = this.mergeProducts(existingData, produtosComAnalise);
      
      await fs.writeFile(backupFile, JSON.stringify(mergedData, null, 2));

      // Atualizar última sincronização
      const now = new Date().toISOString();
      await this.saveLastSync('lojaFisica', now);

      console.log(`Backup loja física: ${produtosComAnalise.length} produtos processados com análise de vendas`);
      return { updated: produtosComAnalise.length, new: 0 };
    } catch (error) {
      console.error('Erro no backup de produtos loja física:', error);
      throw error;
    }
  }

  /**
   * Carregar arquivo de backup existente
   */
  async loadBackupFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  /**
   * Mesclar produtos existentes com novos/atualizados
   */
  mergeProducts(existing, newProducts) {
    const merged = [...existing];
    const existingIds = new Set(existing.map(p => p.id || p.codigoInterno));

    newProducts.forEach(product => {
      const id = product.id || product.codigoInterno;
      if (existingIds.has(id)) {
        // Atualizar produto existente
        const index = merged.findIndex(p => (p.id || p.codigoInterno) === id);
        if (index !== -1) {
          merged[index] = product;
        }
      } else {
        // Adicionar novo produto
        merged.push(product);
        existingIds.add(id);
      }
    });

    return merged;
  }

  /**
   * Buscar análise de vendas e imagens do backup/Redis
   */
  async getAnaliseVendasFromBackup(codigosProdutos) {
    const analiseMap = {};
    
    // Tentar buscar do Redis primeiro (mais rápido)
    if (redisClient.isReady || redisClient.isOpen) {
      try {
        const indexKey = 'backup:loja-fisica:index';
        const indexData = await redisClient.get(indexKey);
        
        if (indexData) {
          const index = JSON.parse(indexData);
          codigosProdutos.forEach(codigo => {
            if (index[codigo]) {
              analiseMap[codigo] = index[codigo];
            }
          });
          
          if (Object.keys(analiseMap).length > 0) {
            console.log(`Análise de vendas: ${Object.keys(analiseMap).length} produtos encontrados no Redis`);
            return analiseMap;
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar do Redis, tentando arquivo:', error.message);
      }
    }
    
    // Se não encontrou no Redis, buscar do arquivo de backup
    try {
      const backupFile = path.join(
        this.backupDir,
        `loja_fisica_${new Date().toISOString().split('T')[0]}.json`
      );
      
      const backupData = await this.loadBackupFile(backupFile);
      
      if (Array.isArray(backupData)) {
        backupData.forEach(produto => {
          if (codigosProdutos.includes(produto.codigoInterno)) {
            analiseMap[produto.codigoInterno] = {
              estoqueMinimo: produto.estoqueMinimo || 0,
              mesPico: produto.mesPico || null,
              mediaMensal: produto.mediaMensal || 0,
              totalVendas: produto.totalVendas || 0,
              imagemBase64: produto.imagemBase64 || null
            };
          }
        });
        
        if (Object.keys(analiseMap).length > 0) {
          console.log(`Análise de vendas: ${Object.keys(analiseMap).length} produtos encontrados no backup`);
          return analiseMap;
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar do arquivo de backup:', error.message);
    }
    
    // Se não encontrou nada, retornar objeto vazio
    console.warn('Nenhuma análise de vendas encontrada no backup. Execute o backup inicial.');
    return analiseMap;
  }

  /**
   * Executar backup completo (ambos os schemas)
   */
  async runFullBackup() {
    console.log('Iniciando backup completo...');
    await this.initialize();

    try {
      const [ecommerceResult, lojaFisicaResult] = await Promise.all([
        this.backupEcommerceProducts(),
        this.backupLojaFisicaProducts()
      ]);

      console.log('Backup completo finalizado:', {
        ecommerce: ecommerceResult,
        lojaFisica: lojaFisicaResult
      });

      return {
        success: true,
        ecommerce: ecommerceResult,
        lojaFisica: lojaFisicaResult
      };
    } catch (error) {
      console.error('Erro no backup completo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new BackupService();

