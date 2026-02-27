const express = require('express');
const router = express.Router();
const { generateNutritionPlan, getNutritionPlan, modifyNutritionPlan } = require('../controllers/nutritionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/generate', generateNutritionPlan);
router.get('/plan', getNutritionPlan);
router.post('/modify', modifyNutritionPlan);

module.exports = router;
