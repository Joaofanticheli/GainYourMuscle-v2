// ============================================================================
// CONTEXT DE AUTENTICAÇÃO
// ============================================================================
// Gerencia o estado de autenticação global da aplicação

import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

// Cria o Context
const AuthContext = createContext();

// Hook personalizado para usar o AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

// Provider que envolve a aplicação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Carrega usuário ao iniciar a aplicação
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Função de login
  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);

    return response.data;
  };

  // Função de registro
  const register = async (userData) => {
    const response = await authAPI.register(userData);
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);

    return response.data;
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
