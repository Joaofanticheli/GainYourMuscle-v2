// ============================================================================
// CONTROLLER DE NUTRIÇÃO
// ============================================================================

const User = require('../models/User');
const { gerarPlanoNutricional } = require('../utils/nutritionGenerator');

/**
 * @route  POST /api/nutrition/generate
 * @desc   Gera plano nutricional com IA e salva no perfil do usuário
 * @access Private
 */
const generateNutritionPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });

    // Injeta dados físicos do perfil
    const params = {
      ...req.body,
      peso: user.peso,
      altura: user.altura,
      idade: user.idade,
      sexo: user.sexo,
    };

    const plano = await gerarPlanoNutricional(params);

    // Salva o plano no usuário
    user.planoNutricional = plano;
    user.markModified('planoNutricional');
    await user.save();

    res.json({ success: true, plano });
  } catch (error) {
    console.error('Erro ao gerar plano nutricional:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao gerar plano nutricional',
    });
  }
};

/**
 * @route  GET /api/nutrition/plan
 * @desc   Retorna o plano nutricional salvo do usuário
 * @access Private
 */
const getNutritionPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });

    res.json({ success: true, plano: user.planoNutricional || null });
  } catch (error) {
    console.error('Erro ao buscar plano nutricional:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar plano' });
  }
};

module.exports = { generateNutritionPlan, getNutritionPlan };
