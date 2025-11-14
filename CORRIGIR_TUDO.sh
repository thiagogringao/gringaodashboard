#!/bin/bash
# Script completo para corrigir login - Dashboard Produtos
# Execute no servidor: bash CORRIGIR_TUDO.sh

echo "═══════════════════════════════════════════════════════════════"
echo "🔧 CORREÇÃO COMPLETA - DASHBOARD PRODUTOS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretórios
BACKEND_DIR="/var/www/dashboard/backend"
FRONTEND_DIR="/var/www/dashboard/frontend"

echo "📍 Verificando diretórios..."
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Diretório backend não encontrado!${NC}"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Diretório frontend não encontrado!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Diretórios encontrados${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# PARTE 1: CORRIGIR BANCO DE DADOS
# ═══════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo "📦 PARTE 1: VERIFICANDO BANCO DE DADOS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

cd "$BACKEND_DIR"

echo "🔍 Verificando banco de dados SQLite..."

# Criar/verificar banco de dados
node -e "
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'auth.db');
console.log('📂 Caminho do banco:', dbPath);

let db;
try {
    db = new Database(dbPath);
    console.log('✅ Banco de dados aberto com sucesso');
    
    // Criar tabela se não existir
    db.exec(\`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        ativo INTEGER DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        ultimo_acesso DATETIME
      )
    \`);
    console.log('✅ Tabela usuarios verificada/criada');
    
    // Verificar se admin existe
    const admin = db.prepare('SELECT * FROM usuarios WHERE email = ?').get('admin@dashboard.com');
    
    if (!admin) {
        console.log('📝 Criando usuário admin...');
        const senhaHash = bcrypt.hashSync('admin123', 10);
        db.prepare(\`
            INSERT INTO usuarios (nome, email, senha, role, ativo)
            VALUES (?, ?, ?, ?, ?)
        \`).run('Administrador', 'admin@dashboard.com', senhaHash, 'admin', 1);
        console.log('✅ Usuário admin criado!');
    } else {
        console.log('ℹ️  Admin já existe - Atualizando senha...');
        const senhaHash = bcrypt.hashSync('admin123', 10);
        db.prepare('UPDATE usuarios SET senha = ?, ativo = 1 WHERE email = ?')
            .run(senhaHash, 'admin@dashboard.com');
        console.log('✅ Senha do admin atualizada!');
    }
    
    // Listar todos os usuários
    const usuarios = db.prepare('SELECT id, nome, email, role, ativo FROM usuarios').all();
    console.log('');
    console.log('👥 Usuários cadastrados:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    usuarios.forEach(u => {
        const status = u.ativo ? '🟢' : '🔴';
        console.log(\`  \${status} \${u.nome} (\${u.email}) - Role: \${u.role}\`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    db.close();
    console.log('✅ Banco de dados fechado');
    
} catch (error) {
    console.error('❌ Erro:', error.message);
    if (db) db.close();
    process.exit(1);
}
"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao configurar banco de dados${NC}"
    exit 1
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# PARTE 2: TESTAR ENDPOINT DE LOGIN
# ═══════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo "🧪 PARTE 2: TESTANDO ENDPOINT DE LOGIN"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "🔍 Testando POST /api/auth/login..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dashboard.com","senha":"admin123"}')

echo "Resposta do servidor:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Verificar se o login foi bem-sucedido
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Login funcionando corretamente!${NC}"
else
    echo -e "${RED}❌ Login falhou! Verifique os logs do backend${NC}"
    echo ""
    echo "📋 Últimas linhas do log do backend:"
    pm2 logs dashboard-backend --lines 20 --nostream
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# PARTE 3: REINICIAR APLICAÇÃO
# ═══════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo "🔄 PARTE 3: REINICIANDO APLICAÇÃO"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "🔄 Reiniciando backend..."
pm2 restart dashboard-backend

sleep 2

echo "🔄 Recarregando Nginx..."
systemctl reload nginx

echo ""

# ═══════════════════════════════════════════════════════════════
# PARTE 4: VERIFICAR STATUS
# ═══════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo "📊 PARTE 4: STATUS DOS SERVIÇOS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "📦 Status PM2:"
pm2 list

echo ""
echo "🌐 Status Nginx:"
systemctl status nginx --no-pager | head -n 10

echo ""

# ═══════════════════════════════════════════════════════════════
# RESUMO FINAL
# ═══════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo "✅ CORREÇÃO CONCLUÍDA!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🔑 CREDENCIAIS DE ACESSO:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Email: admin@dashboard.com"
echo "  Senha: admin123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 ACESSE:"
echo "  http://72.61.40.170"
echo ""
echo "⚠️  IMPORTANTE:"
echo "  1. Limpe o cache do navegador (Ctrl+Shift+Delete)"
echo "  2. Ou abra em aba anônima (Ctrl+Shift+N)"
echo "  3. Se ainda não funcionar, o problema está no FRONTEND"
echo ""
echo "📝 PRÓXIMOS PASSOS SE NÃO FUNCIONAR:"
echo "  1. Você precisa transferir os arquivos do frontend/dist/"
echo "  2. Use WinSCP ou SCP para enviar os arquivos"
echo "  3. Veja o arquivo ATUALIZAR_FRONTEND.txt"
echo ""
echo "═══════════════════════════════════════════════════════════════"
