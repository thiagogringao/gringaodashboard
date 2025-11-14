#!/bin/bash
# Script para corrigir problemas de login

echo "🔧 CORRIGINDO PROBLEMAS DE LOGIN"
echo "================================="
echo ""

cd /var/www/dashboard/backend

# 1. Verificar logs
echo "📋 Últimos logs do backend:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs dashboard-backend --lines 20 --nostream
echo ""

# 2. Testar endpoint de login
echo "🔍 Testando endpoint de login..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dashboard.com","senha":"admin123"}' \
  -w "\n\nStatus: %{http_code}\n"
echo ""

# 3. Verificar se o banco existe e tem usuários
echo "📊 Verificando banco de dados..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "auth.db" ]; then
    echo "✅ Banco auth.db encontrado"
    
    node -e "
    const Database = require('better-sqlite3');
    const db = new Database('auth.db');
    
    try {
        const count = db.prepare('SELECT COUNT(*) as total FROM usuarios').get();
        console.log('Total de usuários:', count.total);
        
        if (count.total === 0) {
            console.log('⚠️  Nenhum usuário encontrado!');
            console.log('📝 Criando usuário admin...');
            
            const bcrypt = require('bcryptjs');
            const senhaHash = bcrypt.hashSync('admin123', 10);
            
            db.prepare(\`
                INSERT INTO usuarios (nome, email, senha, role, ativo)
                VALUES (?, ?, ?, ?, ?)
            \`).run('Administrador', 'admin@dashboard.com', senhaHash, 'admin', 1);
            
            console.log('✅ Usuário admin criado!');
        } else {
            const usuarios = db.prepare('SELECT id, nome, email, role FROM usuarios').all();
            console.log('');
            console.log('Usuários cadastrados:');
            usuarios.forEach(u => {
                console.log(\`  - \${u.nome} (\${u.email}) - Role: \${u.role}\`);
            });
        }
    } catch (error) {
        console.error('❌ Erro ao acessar banco:', error.message);
    }
    
    db.close();
    "
else
    echo "❌ Banco auth.db NÃO encontrado!"
    echo "📝 Criando banco e usuário admin..."
    
    node -e "
    const Database = require('better-sqlite3');
    const bcrypt = require('bcryptjs');
    
    const db = new Database('auth.db');
    
    // Criar tabela
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
    
    // Criar admin
    const senhaHash = bcrypt.hashSync('admin123', 10);
    db.prepare(\`
        INSERT INTO usuarios (nome, email, senha, role, ativo)
        VALUES (?, ?, ?, ?, ?)
    \`).run('Administrador', 'admin@dashboard.com', senhaHash, 'admin', 1);
    
    console.log('✅ Banco criado e admin cadastrado!');
    
    db.close();
    "
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 CREDENCIAIS PARA LOGIN:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Email: admin@dashboard.com"
echo "Senha: admin123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 4. Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 restart dashboard-backend
sleep 2

echo ""
echo "📊 Status atual:"
pm2 status

echo ""
echo "✅ Correção concluída!"
echo ""
echo "🌐 Tente fazer login novamente em: http://72.61.40.170"
echo ""
