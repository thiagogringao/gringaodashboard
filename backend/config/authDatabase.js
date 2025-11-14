const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'auth.db');
const db = new Database(dbPath);

// Criar tabela de usuários
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    ativo INTEGER DEFAULT 1,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso DATETIME
  )
`);

// Criar índice para busca rápida por email
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)
`);

// Criar usuário admin padrão (se não existir)
const adminExists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('admin@dashboard.com');
const adminSenhaHash = bcrypt.hashSync('admin123', 10);

if (!adminExists) {
  db.prepare(`
    INSERT INTO usuarios (nome, email, senha, role)
    VALUES (?, ?, ?, ?)
  `).run('Administrador', 'admin@dashboard.com', adminSenhaHash, 'admin');
  
  console.log('✅ Usuário admin criado: admin@dashboard.com / admin123');
} else {
  db.prepare(`
    UPDATE usuarios
    SET senha = ?, role = 'admin', ativo = 1
    WHERE id = ?
  `).run(adminSenhaHash, adminExists.id);
  
  console.log('✅ Usuário admin atualizado: admin@dashboard.com / admin123');
}

console.log('✅ Banco de dados de autenticação inicializado:', dbPath);

module.exports = db;
