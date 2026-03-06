const Workout = require('../models/Workout');
const User = require('../models/User');
const Vinculo = require('../models/Vinculo');
const { gerarTreinoPersonalizado } = require('../utils/workoutGenerator');
const { gerarTreinoComIA }         = require('../utils/workoutGeneratorAI');

const generateWorkout = async (req, res) => {
  try {
    const { clienteId, ...params } = req.body;
    if (!params.diasTreino || !params.experiencia || !params.ambiente) {
      return res.status(400).json({ success: false, message: 'Parâmetros incompletos.' });
    }
    let targetUserId = req.user.id;
    if (clienteId) {
      if (req.user.role !== 'profissional') return res.status(403).json({ success: false, message: 'Apenas profissionais podem criar treinos para clientes.' });
      const vinculo = await Vinculo.findOne({ profissional: req.user.id, cliente: clienteId, status: 'ativo' });
      if (!vinculo) return res.status(403).json({ success: false, message: 'Sem vínculo ativo com este cliente.' });
      targetUserId = clienteId;
    }
    let treinoGerado, geradoPorIA = false;
    if (process.env.GROQ_API_KEY) {
      try { treinoGerado = await gerarTreinoComIA(params); geradoPorIA = true; }
      catch (e) { treinoGerado = gerarTreinoPersonalizado(params); }
    } else {
      treinoGerado = gerarTreinoPersonalizado(params);
    }
    const workout = await Workout.create({ usuario: targetUserId, criadoPor: req.user.id, ...treinoGerado });
    await User.findByIdAndUpdate(targetUserId, { treinoAtual: workout._id, preferencias: params, frequencia: params.diasTreino });
    res.status(201).json({ success: true, message: geradoPorIA ? 'Treino gerado com IA! 🤖💪' : 'Treino gerado! 💪', workout });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao gerar treino', error: error.message });
  }
};

const getCurrentWorkout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.treinoAtual) return res.status(404).json({ success: false, message: 'Você ainda não tem um treino.' });
    const workout = await Workout.findById(user.treinoAtual);
    if (!workout) return res.status(404).json({ success: false, message: 'Treino não encontrado.' });
    res.json({ success: true, workout });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar treino' });
  }
};

const getTodayWorkout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.treinoAtual) return res.status(404).json({ success: false, message: 'Você ainda não tem um treino' });
    const workout = await Workout.findById(user.treinoAtual);
    if (!workout) return res.status(404).json({ success: false, message: 'Treino não encontrado' });
    const treinoDoDia = workout.getTreinoDoDia();
    if (!treinoDoDia) return res.json({ success: true, message: 'Hoje é dia de descanso! 😴', descansando: true });
    res.json({ success: true, treinoDoDia, nomePrograma: workout.nome });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar treino do dia' });
  }
};

const getWorkoutHistory = async (req, res) => {
  try {
    const workouts = await Workout.find({ usuario: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: workouts.length, workouts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar histórico' });
  }
};

const completeWorkout = async (req, res) => {
  try {
    const { diaRealizado, exerciciosRealizados, tempoDuracao, feedback } = req.body;
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ success: false, message: 'Treino não encontrado' });
    if (workout.usuario.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Não autorizado' });
    workout.historico.push({ data: new Date(), diaRealizado, exerciciosRealizados, tempoDuracao, feedback });
    await workout.marcarCompleto();
    res.json({ success: true, message: 'Treino marcado como completo! 🎉', workout });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao completar treino' });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ success: false, message: 'Treino não encontrado' });
    // Profissional pode deletar treinos de seus clientes
    const isOwner = workout.usuario.toString() === req.user.id;
    const isCriador = workout.criadoPor && workout.criadoPor.toString() === req.user.id;
    if (!isOwner && !isCriador) return res.status(403).json({ success: false, message: 'Não autorizado' });
    await workout.deleteOne();
    res.json({ success: true, message: 'Treino deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar treino' });
  }
};

const saveManualWorkout = async (req, res) => {
  try {
    const { nome, descricao, tipo, nivel, divisao, diasPorSemana, dias, clienteId } = req.body;
    if (!nome || !dias || !Array.isArray(dias) || dias.length === 0) {
      return res.status(400).json({ success: false, message: 'Nome e pelo menos um dia de treino são obrigatórios.' });
    }
    let targetUserId = req.user.id;
    if (clienteId) {
      if (req.user.role !== 'profissional') return res.status(403).json({ success: false, message: 'Apenas profissionais podem criar treinos para clientes.' });
      const vinculo = await Vinculo.findOne({ profissional: req.user.id, cliente: clienteId, status: 'ativo' });
      if (!vinculo) return res.status(403).json({ success: false, message: 'Sem vínculo ativo com este cliente.' });
      targetUserId = clienteId;
    }
    const diasNormalizados = dias.map(dia => ({
      ...dia,
      exercicios: (dia.exercicios || []).map((ex, i) => ({ ...ex, ordem: i + 1 }))
    }));
    const workout = await Workout.create({
      usuario: targetUserId,
      criadoPor: req.user.id,
      nome,
      descricao: descricao || 'Treino criado manualmente.',
      tipo: tipo || 'hipertrofia',
      nivel: nivel || 'intermediario',
      divisao: divisao || 'Manual',
      diasPorSemana: diasPorSemana || dias.length,
      dias: diasNormalizados,
      parametros: { manual: true }
    });
    // Só seta treinoAtual se o próprio usuário criou (não profissional criando para cliente)
    if (!clienteId) {
      await User.findByIdAndUpdate(targetUserId, { treinoAtual: workout._id });
    }
    res.status(201).json({ success: true, message: 'Treino salvo com sucesso! 💪', workout });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao salvar treino manual', error: error.message });
  }
};

// Listar todos os treinos de um cliente (rota do profissional)
const getClienteWorkouts = async (req, res) => {
  try {
    if (req.user.role !== 'profissional') return res.status(403).json({ success: false, message: 'Apenas profissionais.' });
    const vinculo = await Vinculo.findOne({ profissional: req.user.id, cliente: req.params.clienteId, status: 'ativo' });
    if (!vinculo) return res.status(403).json({ success: false, message: 'Sem vínculo ativo com este cliente.' });
    const workouts = await Workout.find({ usuario: req.params.clienteId }).sort({ createdAt: -1 });
    res.json({ success: true, workouts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar treinos do cliente' });
  }
};

// Copiar treino para outro cliente (ou mesmo cliente)
const copiarWorkout = async (req, res) => {
  try {
    const { destinoId } = req.body;
    const original = await Workout.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Treino não encontrado.' });

    // Verifica permissão: dono ou profissional que criou
    const isOwner = original.usuario.toString() === req.user.id;
    const isCriador = original.criadoPor && original.criadoPor.toString() === req.user.id;
    const isProfissional = req.user.role === 'profissional';

    if (!isOwner && !isCriador && !isProfissional) {
      return res.status(403).json({ success: false, message: 'Sem permissão para copiar este treino.' });
    }

    let targetUserId = original.usuario;
    if (destinoId) {
      if (!isProfissional) return res.status(403).json({ success: false, message: 'Apenas profissionais podem transferir treinos.' });
      const vinculo = await Vinculo.findOne({ profissional: req.user.id, cliente: destinoId, status: 'ativo' });
      if (!vinculo) return res.status(403).json({ success: false, message: 'Sem vínculo ativo com o cliente destino.' });
      targetUserId = destinoId;
    }

    const originalObj = original.toObject();
    delete originalObj._id;
    delete originalObj.createdAt;
    delete originalObj.updatedAt;
    originalObj.historico = [];
    originalObj.vezesCompleto = 0;
    originalObj.usuario = targetUserId;
    originalObj.criadoPor = req.user.id;
    originalObj.nome = destinoId ? original.nome : `${original.nome} (cópia)`;
    originalObj.dias = originalObj.dias.map(d => {
      const dObj = { ...d };
      delete dObj._id;
      dObj.exercicios = (dObj.exercicios || []).map(ex => { const eObj = { ...ex }; delete eObj._id; return eObj; });
      return dObj;
    });

    const copia = await Workout.create(originalObj);
    res.status(201).json({ success: true, message: 'Treino copiado com sucesso!', workout: copia });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao copiar treino', error: error.message });
  }
};

// Arquivar/desarquivar treino
const arquivarWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ success: false, message: 'Treino não encontrado.' });
    const isOwner = workout.usuario.toString() === req.user.id;
    const isCriador = workout.criadoPor && workout.criadoPor.toString() === req.user.id;
    if (!isOwner && !isCriador) return res.status(403).json({ success: false, message: 'Sem permissão.' });
    workout.arquivado = !workout.arquivado;
    await workout.save();
    res.json({ success: true, arquivado: workout.arquivado, message: workout.arquivado ? 'Treino arquivado.' : 'Treino desarquivado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao arquivar treino' });
  }
};

module.exports = {
  generateWorkout, getCurrentWorkout, getTodayWorkout, getWorkoutHistory,
  completeWorkout, deleteWorkout, saveManualWorkout,
  getClienteWorkouts, copiarWorkout, arquivarWorkout
};
