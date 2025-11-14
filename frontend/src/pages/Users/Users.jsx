import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Users.module.css';

const Users = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { getToken, user: currentUser } = useAuth();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'user',
    ativo: true
  });

  const fetchUsers = useCallback(async () => {
    // Don't set loading to true here to avoid screen flicker on refresh
    try {
      const token = getToken();
      if (!token) {
        setError("Autenticação necessária.");
        setLoading(false);
        return;
      }
      const response = await fetch('/api/auth/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUsuarios(data.data);
      } else {
        setError(data.message || 'Erro ao carregar usuários');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nome || !formData.email) {
      setError('Nome e email são obrigatórios');
      return;
    }

    if (!editingUser && (!formData.senha || formData.senha.length < 6)) {
      setError('Senha é obrigatória e deve ter no mínimo 6 caracteres');
      return;
    }

    const url = editingUser
      ? `/api/auth/usuarios/${editingUser.id}`
      : '/api/auth/usuarios';
    const method = editingUser ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        closeModal();
        fetchUsers();
      } else {
        setError(data.message || 'Erro ao salvar usuário');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleEdit = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      role: usuario.role,
      ativo: usuario.ativo === 1 || usuario.ativo === true
    });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        const token = getToken();
        const response = await fetch(`/api/auth/usuarios/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          fetchUsers();
        } else {
          alert(data.message || 'Erro ao deletar usuário');
        }
      } catch (err) {
        alert('Erro ao conectar com o servidor');
      }
    }
  };

  const openNewUserModal = () => {
    setEditingUser(null);
    setFormData({ nome: '', email: '', senha: '', role: 'user', ativo: true });
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ nome: '', email: '', senha: '', role: 'user', ativo: true });
    setError('');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gerenciamento de Usuários</h1>
          <p className={styles.subtitle}>Cadastre e gerencie usuários do sistema</p>
        </div>
        <button className={styles.addButton} onClick={openNewUserModal}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Usuário
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Função</th>
              <th>Status</th>
              <th>Data Criação</th>
              <th>Último Acesso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>
                      {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span>{usuario.nome}</span>
                  </div>
                </td>
                <td>{usuario.email}</td>
                <td>
                  <span className={`${styles.badge} ${styles[usuario.role]}`}>
                    {usuario.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </span>
                </td>
                <td>
                  <span className={`${styles.status} ${usuario.ativo ? styles.active : styles.inactive}`}>
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>{new Date(usuario.data_criacao).toLocaleDateString('pt-BR')}</td>
                <td>
                  {usuario.ultimo_acesso
                    ? new Date(usuario.ultimo_acesso).toLocaleDateString('pt-BR')
                    : 'Nunca'}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(usuario)}
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {currentUser && usuario.id !== currentUser.id && (
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(usuario.id)}
                        title="Deletar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && !loading && (
          <div className={styles.empty}>
            <p>Nenhum usuário cadastrado</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && (
                <div className={styles.error}>
                  <span>⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="nome">Nome Completo *</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Nome do usuário"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="senha">
                  Senha {editingUser ? '(deixe em branco para manter)' : '*'}
                </label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  placeholder="Mínimo 6 caracteres"
                  required={!editingUser}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="role">Função</label>                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleInputChange}
                    />
                    <span>Usuário Ativo</span>
                  </label>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

