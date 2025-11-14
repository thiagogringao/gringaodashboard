import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar se há token salvo ao carregar
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.status === 200 && response.data?.success) {
            setUser(response.data.data);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Erro ao buscar usuário:', error);
          localStorage.removeItem('token');
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await api.post('/api/auth/login', { email, senha });
      const data = response.data;

      localStorage.setItem('token', data.data.token);
      setUser(data.data.usuario);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  };

  const register = async (nome, email, senha) => {
    try {
      const response = await api.post('/api/auth/register', { nome, email, senha });
      const data = response.data;

      localStorage.setItem('token', data.data.token);
      setUser(data.data.usuario);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

