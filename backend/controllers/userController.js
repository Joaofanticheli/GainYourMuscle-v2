// ============================================================================
// CONTROLLER DE USUÁRIO - Gerenciamento de Perfil
// ============================================================================

const User = require('../models/User');

/**
 * @route   GET /api/user/profile
 * @desc    Obter perfil completo do usuário
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('treinoAtual'); // Popula os dados do treino atual

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      user: user.dadosPublicos()
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil'
    });
  }
};

/**
 * @route   PUT /api/user/profile
 * @desc    Atualizar dados do perfil
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    // Campos que podem ser atualizados
    const allowedUpdates = ['nome', 'idade', 'peso', 'altura', 'frequencia'];

    // Filtra apenas os campos permitidos
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Atualiza o usuário
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      {
        new: true,              // Retorna o documento atualizado
        runValidators: true     // Executa as validações do schema
      }
    );

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      user: user.dadosPublicos()
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil'
    });
  }
};

/**
 * @route   PUT /api/user/preferences
 * @desc    Atualizar preferências de treino
 * @access  Private
 */
const updatePreferences = async (req, res) => {
  try {
    const {
      diasTreino,
      experiencia,
      fadiga,
      lesao,
      duracao,
      disciplina,
      variedade,
      ambiente,
      muscular
    } = req.body;

    // Atualiza as preferências
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Atualiza cada campo se foi fornecido
    if (diasTreino) user.preferencias.diasTreino = diasTreino;
    if (experiencia) user.preferencias.experiencia = experiencia;
    if (fadiga) user.preferencias.fadiga = fadiga;
    if (lesao) user.preferencias.lesao = lesao;
    if (duracao) user.preferencias.duracao = duracao;
    if (disciplina) user.preferencias.disciplina = disciplina;
    if (variedade) user.preferencias.variedade = variedade;
    if (ambiente) user.preferencias.ambiente = ambiente;
    if (muscular) user.preferencias.muscular = muscular;

    await user.save();

    res.json({
      success: true,
      message: 'Preferências atualizadas com sucesso!',
      preferencias: user.preferencias
    });

  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar preferências'
    });
  }
};

/**
 * @route   POST /api/user/progress
 * @desc    Adicionar registro de progresso
 * @access  Private
 */
const addProgress = async (req, res) => {
  try {
    const { peso, medidas, foto, notas } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Adiciona novo registro de progresso
    user.progresso.push({
      data: new Date(),
      peso,
      medidas,
      foto,
      notas
    });

    await user.save();

    res.json({
      success: true,
      message: 'Progresso registrado com sucesso!',
      progresso: user.progresso
    });

  } catch (error) {
    console.error('Erro ao adicionar progresso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar progresso'
    });
  }
};

/**
 * @route   GET /api/user/progress
 * @desc    Obter histórico de progresso
 * @access  Private
 */
const getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      progresso: user.progresso.sort((a, b) => b.data - a.data) // Mais recente primeiro
    });

  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar progresso'
    });
  }
};

// Exporta todas as funções
module.exports = {
  getProfile,
  updateProfile,
  updatePreferences,
  addProgress,
  getProgress
};
