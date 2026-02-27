// ============================================================================
// CONTROLLER DE NUTRIÇÃO
// ============================================================================

const User = require('../models/User');
const { gerarPlanoNutricional, modificarPlanoNutricional } = require('../utils/nutritionGenerator');

/**
 * @route  POST /api/nutrition/generate
 * @desc   Gera plano nutricional com IA e salva no perfil do usuário
 * @access Private
 */
const generateNutritionPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('treinoAtual');
    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });

    // Injeta dados físicos + contexto completo do usuário
    const params = {
      ...req.body,
      peso: user.peso,
      altura: user.altura,
      idade: user.idade,
      sexo: user.sexo,
      // Dados do treino atual (se existir)
      treino: user.treinoAtual ? {
        tipo: user.treinoAtual.tipo,
        nivel: user.treinoAtual.nivel,
        diasPorSemana: user.treinoAtual.diasPorSemana,
        divisao: user.treinoAtual.divisao,
      } : null,
      // Dados da anamnese (se preenchida)
      anamnese: user.anamnese || null,
      // Preferências de treino
      diasTreino: user.preferencias?.diasTreino || null,
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

/**
 * @route  POST /api/nutrition/modify
 * @desc   Modifica plano nutricional existente via chat da IA
 * @access Private
 */
const modifyNutritionPlan = async (req, res) => {
  try {
    const { plano, pedido } = req.body;
    if (!plano || !pedido) {
      return res.status(400).json({ success: false, message: 'Plano e pedido são obrigatórios' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });

    const resultado = await modificarPlanoNutricional(plano, pedido);

    user.planoNutricional = resultado.plano;
    user.markModified('planoNutricional');
    await user.save();

    res.json({ success: true, plano: resultado.plano, mensagem: resultado.mensagem });
  } catch (error) {
    console.error('Erro ao modificar plano nutricional:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao modificar plano nutricional',
    });
  }
};

module.exports = { generateNutritionPlan, getNutritionPlan, modifyNutritionPlan };
