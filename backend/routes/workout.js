// ============================================================================
// ROTAS DE TREINO
// ============================================================================

const express = require('express');
const router = express.Router();

const {
  generateWorkout,
  getCurrentWorkout,
  getTodayWorkout,
  getWorkoutHistory,
  completeWorkout,
  deleteWorkout,
  saveManualWorkout
} = require('../controllers/workoutController');

const { protect } = require('../middleware/auth');

// Todas as rotas precisam de autenticação
router.use(protect);

/**
 * POST /api/workout/generate
 * Gerar novo treino personalizado
 */
router.post('/generate', generateWorkout);

/**
 * GET /api/workout/current
 * Obter treino atual
 */
router.get('/current', getCurrentWorkout);

/**
 * GET /api/workout/today
 * Obter treino do dia
 */
router.get('/today', getTodayWorkout);

/**
 * GET /api/workout/history
 * Obter histórico de treinos
 */
router.get('/history', getWorkoutHistory);

/**
 * POST /api/workout/:id/complete
 * Marcar treino como completo
 */
router.post('/:id/complete', completeWorkout);

/**
 * POST /api/workout/manual
 * Salvar treino criado manualmente
 */
router.post('/manual', saveManualWorkout);

/**
 * DELETE /api/workout/:id
 * Deletar treino
 */
router.delete('/:id', deleteWorkout);

module.exports = router;
