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
    const allowedUpdates = ['nome', 'dataNascimento', 'peso', 'altura', 'frequencia', 'contato'];

    // Filtra apenas os campos permitidos
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Profissionais podem atualizar bio
    if (req.body.bio !== undefined) {
      updates['profissional.bio'] = req.body.bio;
    }

    // Recalcula idade se data de nascimento foi atualizada
    if (updates.dataNascimento) {
      const nascimento = new Date(updates.dataNascimento);
      const hoje = new Date();
      let idadeCalculada = hoje.getFullYear() - nascimento.getFullYear();
      const mesAtual = hoje.getMonth() - nascimento.getMonth();
      if (mesAtual < 0 || (mesAtual === 0 && hoje.getDate() < nascimento.getDate())) {
        idadeCalculada--;
      }
      updates.idade = idadeCalculada;
    }

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

/**
 * @route   DELETE /api/user/progress/:id
 * @desc    Deletar um registro de progresso
 * @access  Private
 */
const deleteProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    const registro = user.progresso.id(req.params.id);
    if (!registro) {
      return res.status(404).json({ success: false, message: 'Registro não encontrado' });
    }

    user.progresso.pull({ _id: req.params.id });
    await user.save();

    res.json({ success: true, message: 'Registro removido.' });
  } catch (error) {
    console.error('Erro ao deletar progresso:', error);
    res.status(500).json({ success: false, message: 'Erro ao remover registro' });
  }
};

/**
 * @route   PUT /api/user/anamnese
 * @desc    Salvar ficha de anamnese do aluno (sem gerar treino)
 * @access  Private
 */
const salvarAnamnese = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { anamnese: { ...req.body, atualizadoEm: new Date() } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Ficha salva com sucesso!',
      anamnese: user.anamnese
    });
  } catch (error) {
    console.error('Erro ao salvar anamnese:', error);
    res.status(500).json({ success: false, message: 'Erro ao salvar ficha.' });
  }
};

/**
 * @route   POST /api/user/notificacoes/enviar
 * @desc    Profissional envia notificação in-app para um aluno
 * @access  Profissional
 */
const enviarNotificacao = async (req, res) => {
  try {
    const { clienteId, mensagem } = req.body;
    if (!clienteId || !mensagem) {
      return res.status(400).json({ success: false, message: 'clienteId e mensagem são obrigatórios.' });
    }

    const aluno = await User.findById(clienteId);
    if (!aluno) {
      return res.status(404).json({ success: false, message: 'Aluno não encontrado.' });
    }

    await User.updateOne(
      { _id: clienteId },
      { $push: { notificacoes: { mensagem, de: req.user.nome } } }
    );

    res.json({ success: true, message: 'Notificação enviada!' });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ success: false, message: 'Erro ao enviar notificação.' });
  }
};

/**
 * @route   GET /api/user/notificacoes
 * @desc    Aluno busca suas notificações não lidas
 * @access  Private
 */
const getNotificacoes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notificacoes');
    const naoLidas = user.notificacoes.filter(n => !n.lida);
    res.json({ success: true, notificacoes: naoLidas });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar notificações.' });
  }
};

/**
 * @route   PUT /api/user/notificacoes/:id/lida
 * @desc    Marca uma notificação como lida
 * @access  Private
 */
const marcarNotificacaoLida = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const notif = user.notificacoes.id(req.params.id);
    if (!notif) return res.status(404).json({ success: false, message: 'Notificação não encontrada.' });

    notif.lida = true;
    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
    res.status(500).json({ success: false, message: 'Erro ao marcar notificação.' });
  }
};

// Exporta todas as funções
module.exports = {
  getProfile,
  updateProfile,
  updatePreferences,
  addProgress,
  getProgress,
  deleteProgress,
  salvarAnamnese,
  enviarNotificacao,
  getNotificacoes,
  marcarNotificacaoLida
};
