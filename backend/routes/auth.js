// ============================================================================
// ROTAS DE AUTENTICAÇÃO
// ============================================================================

const express = require('express');
const router = express.Router();

// Importa os controllers
const {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword
} = require('../controllers/authController');

// Importa o middleware de proteção
const { protect } = require('../middleware/auth');

// ============================================================================
// ROTAS PÚBLICAS (não precisam de autenticação)
// ============================================================================

/**
 * POST /api/auth/register
 * Registrar novo usuário
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Fazer login
 */
router.post('/login', login);

/**
 * POST /api/auth/forgot-password
 * Solicitar recuperação de senha
 */
router.post('/forgot-password', forgotPassword);

// ============================================================================
// ROTAS PRIVADAS (precisam de autenticação)
// ============================================================================

/**
 * GET /api/auth/me
 * Obter dados do usuário logado
 * Middleware protect verifica o token antes de executar getMe
 */
router.get('/me', protect, getMe);

/**
 * PUT /api/auth/update-password
 * Atualizar senha do usuário
 */
router.put('/update-password', protect, updatePassword);

// Exporta o router
module.exports = router;
