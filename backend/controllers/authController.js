const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authDb = require('../config/authDatabase');

// Secret para JWT (em produção, use variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui-2024';
const JWT_EXPIRES_IN = '24h';

// Registrar novo usuário
const register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validação
    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Validar senha (mínimo 6 caracteres)
    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter no mínimo 6 caracteres'
      });
    }

    // Verificar se email já existe
    const usuarioExistente = authDb.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const result = authDb.prepare(`
      INSERT INTO usuarios (nome, email, senha, role)
      VALUES (?, ?, ?, ?)
    `).run(nome, email, senhaHash, 'user');

    // Buscar usuário criado
    const novoUsuario = authDb.prepare(`
      SELECT id, nome, email, role, data_criacao
      FROM usuarios
      WHERE id = ?
    `).get(result.lastInsertRowid);

    // Gerar token
    const token = jwt.sign(
      { id: novoUsuario.id, email: novoUsuario.email, role: novoUsuario.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        token,
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          role: novoUsuario.role
        }
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário',
      error: error.message
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const emailNormalizado = (email || '').trim().toLowerCase();

    // Validação
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário
    const usuario = authDb.prepare(`
      SELECT id, nome, email, senha, role, ativo
      FROM usuarios
      WHERE LOWER(email) = ?
    `).get(emailNormalizado);

    console.log('[AUTH] Login tentativa:', {
      emailRecebido: email,
      emailNormalizado,
      usuarioEncontrado: !!usuario
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo. Entre em contato com o administrador.'
      });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    console.log('[AUTH] Resultado senha valida:', senhaValida, 'para usuário id:', usuario.id);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Atualizar último acesso
    authDb.prepare(`
      UPDATE usuarios
      SET ultimo_acesso = datetime('now')
      WHERE id = ?
    `).run(usuario.id);

    // Gerar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role
        }
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: error.message
    });
  }
};

// Verificar token e retornar dados do usuário
const me = async (req, res) => {
  try {
    // req.user já foi populado pelo middleware de autenticação
    const usuario = authDb.prepare(`
      SELECT id, nome, email, role, data_criacao, ultimo_acesso
      FROM usuarios
      WHERE id = ?
    `).get(req.user.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: error.message
    });
  }
};

// Listar todos os usuários (apenas admin)
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = authDb.prepare(`
      SELECT id, nome, email, role, ativo, data_criacao, ultimo_acesso
      FROM usuarios
      ORDER BY data_criacao DESC
    `).all();

    res.json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários',
      error: error.message
    });
  }
};

// Atualizar usuário
const atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, role, ativo } = req.body;

    // Verificar se usuário existe
    const usuario = authDb.prepare('SELECT id FROM usuarios WHERE id = ?').get(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar permissão (apenas admin ou o próprio usuário)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para atualizar este usuário'
      });
    }

    // Construir query de atualização
    const updates = [];
    const params = [];

    if (nome) {
      updates.push('nome = ?');
      params.push(nome);
    }

    if (email) {
      // Verificar se email já existe (exceto para o próprio usuário)
      const emailExistente = authDb.prepare(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?'
      ).get(email, id);
      
      if (emailExistente) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }

      updates.push('email = ?');
      params.push(email);
    }

    if (senha) {
      if (senha.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Senha deve ter no mínimo 6 caracteres'
        });
      }
      const senhaHash = await bcrypt.hash(senha, 10);
      updates.push('senha = ?');
      params.push(senhaHash);
    }

    // Apenas admin pode alterar role e ativo
    if (req.user.role === 'admin') {
      if (role) {
        updates.push('role = ?');
        params.push(role);
      }
      if (typeof ativo !== 'undefined') {
        updates.push('ativo = ?');
        params.push(ativo ? 1 : 0);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
    }

    params.push(id);

    authDb.prepare(`
      UPDATE usuarios
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...params);

    // Buscar usuário atualizado
    const usuarioAtualizado = authDb.prepare(`
      SELECT id, nome, email, role, ativo, data_criacao, ultimo_acesso
      FROM usuarios
      WHERE id = ?
    `).get(id);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: usuarioAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message
    });
  }
};

// Deletar usuário (apenas admin)
const deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir deletar o próprio usuário
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar seu próprio usuário'
      });
    }

    // Verificar se usuário existe
    const usuario = authDb.prepare('SELECT id FROM usuarios WHERE id = ?').get(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    authDb.prepare('DELETE FROM usuarios WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar usuário',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  me,
  listarUsuarios,
  atualizarUsuario,
  deletarUsuario,
  JWT_SECRET
};

