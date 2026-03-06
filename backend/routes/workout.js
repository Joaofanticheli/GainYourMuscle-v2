const express = require('express');
const router = express.Router();
const {
  generateWorkout, getCurrentWorkout, getTodayWorkout, getWorkoutHistory,
  completeWorkout, deleteWorkout, saveManualWorkout,
  getClienteWorkouts, copiarWorkout, arquivarWorkout
} = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/generate', generateWorkout);
router.get('/current', getCurrentWorkout);
router.get('/today', getTodayWorkout);
router.get('/history', getWorkoutHistory);
router.post('/manual', saveManualWorkout);
router.get('/cliente/:clienteId', getClienteWorkouts);
router.post('/:id/complete', completeWorkout);
router.post('/:id/copiar', copiarWorkout);
router.put('/:id/arquivar', arquivarWorkout);
router.delete('/:id', deleteWorkout);

module.exports = router;
