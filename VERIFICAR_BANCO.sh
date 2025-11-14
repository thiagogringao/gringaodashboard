#!/bin/bash
# Script para verificar e corrigir banco de dados

echo "🔍 VERIFICANDO BANCO DE DADOS"
echo "=============================="
echo ""

cd /var/www/dashboard/backend

# Verificar se o banco existe
if [ ! -f "auth.db" ]; then
    echo "❌ Banco de dados não encontrado!"
    echo "📝 Criando banco de dados..."
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
    
    // Verificar se admin existe
    const admin = db.prepare('SELECT * FROM usuarios WHERE email = ?').get('admin@dashboard.com');
    
    if (!admin) {
        console.log('Criando usuário admin...');
        const senhaHash = bcrypt.hashSync('admin123', 10);
        db.prepare(\`
            INSERT INTO usuarios (nome, email, senha, role, ativo)
            VALUES (?, ?, ?, ?, ?)
        \`).run('Administrador', 'admin@dashboard.com', senhaHash, 'admin', 1);
        console.log('✅ Admin criado!');
    } else {
        console.log('✅ Admin já existe');
    }
    
    db.close();
    console.log('✅ Banco configurado!');
    "
else
    echo "✅ Banco de dados encontrado"
fi

echo ""
echo "📊 Verificando usuários..."
node -e "
const Database = require('better-sqlite3');
const db = new Database('auth.db');

const usuarios = db.prepare('SELECT id, nome, email, role, ativo FROM usuarios').all();

console.log('');
console.log('Usuários cadastrados:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
usuarios.forEach(u => {
    console.log(\`ID: \${u.id} | Nome: \${u.nome}\`);
    console.log(\`Email: \${u.email}\`);
    console.log(\`Role: \${u.role} | Ativo: \${u.ativo ? 'Sim' : 'Não'}\`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

db.close();
"

echo ""
echo "🔑 CREDENCIAIS DE TESTE:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Email: admin@dashboard.com"
echo "Senha: admin123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ Verificação concluída!"
