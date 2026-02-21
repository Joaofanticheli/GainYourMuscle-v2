// ============================================================================
// ROTAS DE USUÁRIO
// ============================================================================

const express = require('express');
const router = express.Router();

// Importa os controllers
const {
  getProfile,
  updateProfile,
  updatePreferences,
  addProgress,
  getProgress,
  deleteProgress
} = require('../controllers/userController');

// Importa o middleware de proteção
const { protect } = require('../middleware/auth');

// ============================================================================
// TODAS AS ROTAS AQUI SÃO PRIVADAS (precisam de autenticação)
// ============================================================================

// Aplica o middleware protect em todas as rotas deste router
router.use(protect);

/**
 * GET /api/user/profile
 * Obter perfil do usuário
 */
router.get('/profile', getProfile);

/**
 * PUT /api/user/profile
 * Atualizar perfil do usuário
 */
router.put('/profile', updateProfile);

/**
 * PUT /api/user/preferences
 * Atualizar preferências de treino
 */
router.put('/preferences', updatePreferences);

/**
 * POST /api/user/progress
 * Adicionar novo registro de progresso
 */
router.post('/progress', addProgress);

/**
 * GET /api/user/progress
 * Obter histórico de progresso
 */
router.get('/progress', getProgress);

/**
 * DELETE /api/user/progress/:id
 * Deletar um registro de progresso
 */
router.delete('/progress/:id', deleteProgress);

// Exporta o router
module.exports = router;
