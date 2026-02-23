// ============================================================================
// CONTROLLER DE PROFISSIONAIS - Vínculos e Painel
// ============================================================================

const User = require('../models/User');
const Vinculo = require('../models/Vinculo');

/**
 * @route   GET /api/profissional/listar
 * @desc    Lista todos os profissionais ativos (para busca do cliente)
 * @access  Private (autenticado)
 */
const listarProfissionais = async (req, res) => {
  try {
    const { tipo } = req.query;

    const filtro = { role: 'profissional', 'profissional.status': 'ativo' };
    if (tipo) filtro['profissional.tipo'] = tipo;

    const profissionais = await User.find(filtro).select(
      'nome email profissional createdAt'
    );

    res.json({ success: true, profissionais });
  } catch (error) {
    console.error('Erro ao listar profissionais:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar profissionais' });
  }
};

/**
 * @route   GET /api/profissional/meus-clientes
 * @desc    Lista clientes vinculados ao profissional logado
 * @access  Profissional
 */
const meusClientes = async (req, res) => {
  try {
    const vinculos = await Vinculo.find({
      profissional: req.user._id,
      status: 'ativo'
    }).populate('cliente', 'nome email idade peso altura frequencia treinoAtual lastLogin');

    res.json({ success: true, clientes: vinculos.map(v => v.cliente) });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar clientes' });
  }
};

/**
 * @route   GET /api/profissional/cliente/:id
 * @desc    Dados completos de um cliente vinculado
 * @access  Profissional
 */
const dadosCliente = async (req, res) => {
  try {
    const vinculo = await Vinculo.findOne({
      profissional: req.user._id,
      cliente: req.params.id,
      status: 'ativo'
    });

    if (!vinculo) {
      return res.status(403).json({
        success: false,
        message: 'Este cliente não está vinculado a você'
      });
    }

    const cliente = await User.findById(req.params.id).select('-password');
    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
    }

    res.json({ success: true, cliente });
  } catch (error) {
    console.error('Erro ao buscar dados do cliente:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar dados do cliente' });
  }
};

/**
 * @route   POST /api/profissional/vincular
 * @desc    Usuário comum solicita vínculo com um profissional
 * @access  Private (usuário comum)
 */
const solicitarVinculo = async (req, res) => {
  try {
    const { profissionalId } = req.body;

    if (!profissionalId) {
      return res.status(400).json({
        success: false,
        message: 'ID do profissional é obrigatório'
      });
    }

    const profissional = await User.findById(profissionalId);
    if (!profissional || profissional.role !== 'profissional') {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }

    if (profissional.profissional.status !== 'ativo') {
      return res.status(400).json({
        success: false,
        message: 'Este profissional ainda não está aprovado na plataforma'
      });
    }

    const vinculoExistente = await Vinculo.findOne({
      profissional: profissionalId,
      cliente: req.user._id
    });

    if (vinculoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Você já possui uma solicitação ou vínculo com este profissional',
        status: vinculoExistente.status
      });
    }

    const vinculo = await Vinculo.create({
      profissional: profissionalId,
      cliente: req.user._id,
      tipoProfissional: profissional.profissional.tipo
    });

    res.status(201).json({
      success: true,
      message: 'Solicitação enviada! Aguarde a aprovação do profissional.',
      vinculo
    });
  } catch (error) {
    console.error('Erro ao solicitar vínculo:', error);
    res.status(500).json({ success: false, message: 'Erro ao solicitar vínculo' });
  }
};

/**
 * @route   PUT /api/profissional/vinculos/:id
 * @desc    Profissional aceita ou recusa solicitação
 * @access  Profissional
 */
const responderVinculo = async (req, res) => {
  try {
    const { acao } = req.body; // 'aceitar' ou 'recusar'

    if (!['aceitar', 'recusar'].includes(acao)) {
      return res.status(400).json({
        success: false,
        message: 'Ação inválida. Use "aceitar" ou "recusar"'
      });
    }

    const vinculo = await Vinculo.findOne({
      _id: req.params.id,
      profissional: req.user._id
    });

    if (!vinculo) {
      return res.status(404).json({ success: false, message: 'Solicitação não encontrada' });
    }

    if (vinculo.status !== 'pendente') {
      return res.status(400).json({
        success: false,
        message: 'Esta solicitação já foi respondida'
      });
    }

    vinculo.status = acao === 'aceitar' ? 'ativo' : 'recusado';
    await vinculo.save();

    res.json({
      success: true,
      message: acao === 'aceitar' ? 'Vínculo aceito com sucesso!' : 'Solicitação recusada.',
      vinculo
    });
  } catch (error) {
    console.error('Erro ao responder vínculo:', error);
    res.status(500).json({ success: false, message: 'Erro ao responder vínculo' });
  }
};

/**
 * @route   GET /api/profissional/vinculos/pendentes
 * @desc    Lista solicitações pendentes para o profissional
 * @access  Profissional
 */
const vinculosPendentes = async (req, res) => {
  try {
    const pendentes = await Vinculo.find({
      profissional: req.user._id,
      status: 'pendente'
    }).populate('cliente', 'nome email idade peso altura frequencia');

    res.json({ success: true, pendentes });
  } catch (error) {
    console.error('Erro ao buscar pendentes:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar solicitações pendentes' });
  }
};

/**
 * @route   GET /api/profissional/meus-vinculos
 * @desc    Lista todos os vínculos do usuário logado (como cliente)
 * @access  Private
 */
const meusVinculos = async (req, res) => {
  try {
    const vinculos = await Vinculo.find({ cliente: req.user._id }).populate(
      'profissional',
      'nome email profissional'
    );

    res.json({ success: true, vinculos });
  } catch (error) {
    console.error('Erro ao buscar vínculos:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar vínculos' });
  }
};

module.exports = {
  listarProfissionais,
  meusClientes,
  dadosCliente,
  solicitarVinculo,
  responderVinculo,
  vinculosPendentes,
  meusVinculos
};
