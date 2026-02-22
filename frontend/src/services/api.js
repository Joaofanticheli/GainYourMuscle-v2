// ============================================================================
// SERVIÇO DE API - Comunicação com Backend
// ============================================================================

import axios from 'axios';

// URL base da API (mude para produção depois)
const API_URL = 'https://gainyourmuscle-v2.onrender.com/api';

// Cria instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: adiciona token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

export const authAPI = {
  // Registro
  register: (userData) => api.post('/auth/register', userData),

  // Login
  login: (credentials) => api.post('/auth/login', credentials),

  // Obter dados do usuário logado
  getMe: () => api.get('/auth/me'),

  // Atualizar senha
  updatePassword: (passwords) => api.put('/auth/update-password', passwords),

  // Esqueceu senha
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
};

// ============================================================================
// USUÁRIO
// ============================================================================

export const userAPI = {
  // Obter perfil
  getProfile: () => api.get('/user/profile'),

  // Atualizar perfil
  updateProfile: (data) => api.put('/user/profile', data),

  // Atualizar preferências
  updatePreferences: (preferences) => api.put('/user/preferences', preferences),

  // Adicionar progresso
  addProgress: (progressData) => api.post('/user/progress', progressData),

  // Obter progresso
  getProgress: () => api.get('/user/progress'),

  // Deletar registro de progresso
  deleteProgress: (id) => api.delete(`/user/progress/${id}`)
};

// ============================================================================
// TREINO
// ============================================================================

export const workoutAPI = {
  // Gerar novo treino
  generate: (params) => api.post('/workout/generate', params),

  // Obter treino atual
  getCurrent: () => api.get('/workout/current'),

  // Obter treino de hoje
  getToday: () => api.get('/workout/today'),

  // Obter histórico
  getHistory: () => api.get('/workout/history'),

  // Marcar como completo
  complete: (id, data) => api.post(`/workout/${id}/complete`, data),

  // Deletar treino
  delete: (id) => api.delete(`/workout/${id}`),

  // Salvar treino manual
  saveManual: (data) => api.post('/workout/manual', data)
};

// ============================================================================
// NUTRIÇÃO
// ============================================================================

export const nutritionAPI = {
  // Gerar plano nutricional com IA
  generate: (params) => api.post('/nutrition/generate', params),

  // Obter plano salvo
  getPlan: () => api.get('/nutrition/plan'),
};

// ============================================================================
// EXTRAS (Vídeo + Chat Dúvidas)
// ============================================================================

export const extrasAPI = {
  // Buscar vídeo do exercício
  getVideo: (nome) => api.get(`/youtube/video?nome=${encodeURIComponent(nome)}`),

  // Chat de dúvidas fitness/nutrição
  chat: (mensagem, historico) => api.post('/chat/duvidas', { mensagem, historico }),
};

export default api;
