// ============================================================================
// CONTROLLER DE TREINO
// ============================================================================

const Workout = require('../models/Workout');
const User = require('../models/User');
const { gerarTreinoPersonalizado } = require('../utils/workoutGenerator');
const { gerarTreinoComIA }         = require('../utils/workoutGeneratorAI');

/**
 * @route   POST /api/workout/generate
 * @desc    Gerar novo treino personalizado
 * @access  Private
 */
const generateWorkout = async (req, res) => {
  try {
    // Pega os parâmetros do corpo da requisição
    const params = req.body;

    // Valida se os parâmetros obrigatórios foram fornecidos
    if (!params.diasTreino || !params.experiencia || !params.ambiente) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros incompletos. Preencha todo o questionário.'
      });
    }

    // Tenta gerar com IA; se falhar, usa o gerador manual como fallback
    let treinoGerado;
    let geradoPorIA = false;

    if (process.env.GROQ_API_KEY) {
      try {
        treinoGerado = await gerarTreinoComIA(params);
        geradoPorIA = true;
        console.log('✅ Treino gerado com IA (Groq)');
      } catch (iaErr) {
        console.warn('⚠️  Groq falhou, usando gerador manual:', iaErr.message);
        treinoGerado = gerarTreinoPersonalizado(params);
      }
    } else {
      treinoGerado = gerarTreinoPersonalizado(params);
    }

    // Cria o treino no banco de dados
    const workout = await Workout.create({
      usuario: req.user.id,
      ...treinoGerado
    });

    // Atualiza o usuário para apontar para este treino como atual
    await User.findByIdAndUpdate(req.user.id, {
      treinoAtual: workout._id,
      preferencias: params  // Salva as preferências também
    });

    res.status(201).json({
      success: true,
      message: geradoPorIA
        ? 'Treino gerado com IA! 🤖💪'
        : 'Treino gerado com sucesso! 💪',
      workout
    });

  } catch (error) {
    console.error('Erro ao gerar treino:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar treino',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/workout/current
 * @desc    Obter treino atual do usuário
 * @access  Private
 */
const getCurrentWorkout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.treinoAtual) {
      return res.status(404).json({
        success: false,
        message: 'Você ainda não tem um treino. Gere um agora!'
      });
    }

    const workout = await Workout.findById(user.treinoAtual);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Treino não encontrado'
      });
    }

    res.json({
      success: true,
      workout
    });

  } catch (error) {
    console.error('Erro ao buscar treino atual:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar treino'
    });
  }
};

/**
 * @route   GET /api/workout/today
 * @desc    Obter treino do dia atual
 * @access  Private
 */
const getTodayWorkout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.treinoAtual) {
      return res.status(404).json({
        success: false,
        message: 'Você ainda não tem um treino'
      });
    }

    const workout = await Workout.findById(user.treinoAtual);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Treino não encontrado'
      });
    }

    // Usa o método do model para pegar treino do dia
    const treinoDoDia = workout.getTreinoDoDia();

    if (!treinoDoDia) {
      return res.json({
        success: true,
        message: 'Hoje é dia de descanso! 😴',
        descansando: true
      });
    }

    res.json({
      success: true,
      treinoDoDia,
      nomePrograma: workout.nome
    });

  } catch (error) {
    console.error('Erro ao buscar treino do dia:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar treino do dia'
    });
  }
};

/**
 * @route   GET /api/workout/history
 * @desc    Obter histórico de treinos do usuário
 * @access  Private
 */
const getWorkoutHistory = async (req, res) => {
  try {
    const workouts = await Workout.find({ usuario: req.user.id })
      .sort({ createdAt: -1 }); // Mais recente primeiro

    res.json({
      success: true,
      count: workouts.length,
      workouts
    });

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico'
    });
  }
};

/**
 * @route   POST /api/workout/:id/complete
 * @desc    Marcar treino como completo
 * @access  Private
 */
const completeWorkout = async (req, res) => {
  try {
    const { diaRealizado, exerciciosRealizados, tempoDuracao, feedback } = req.body;

    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Treino não encontrado'
      });
    }

    // Verifica se o treino pertence ao usuário
    if (workout.usuario.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado'
      });
    }

    // Adiciona ao histórico
    workout.historico.push({
      data: new Date(),
      diaRealizado,
      exerciciosRealizados,
      tempoDuracao,
      feedback
    });

    await workout.marcarCompleto();

    res.json({
      success: true,
      message: 'Treino marcado como completo! Parabéns! 🎉',
      workout
    });

  } catch (error) {
    console.error('Erro ao completar treino:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao completar treino'
    });
  }
};

/**
 * @route   DELETE /api/workout/:id
 * @desc    Deletar treino
 * @access  Private
 */
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Treino não encontrado'
      });
    }

    // Verifica se o treino pertence ao usuário
    if (workout.usuario.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado'
      });
    }

    await workout.deleteOne();

    res.json({
      success: true,
      message: 'Treino deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar treino:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar treino'
    });
  }
};

module.exports = {
  generateWorkout,
  getCurrentWorkout,
  getTodayWorkout,
  getWorkoutHistory,
  completeWorkout,
  deleteWorkout
};
