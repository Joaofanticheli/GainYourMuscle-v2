const Consulta = require('../models/Consulta');
const Vinculo = require('../models/Vinculo');

// Listar consultas do psicólogo
const listarConsultas = async (req, res) => {
  try {
    const consultas = await Consulta.find({ profissional: req.user._id })
      .populate('cliente', 'nome email contato')
      .sort({ data: 1, hora: 1 });
    res.json({ success: true, consultas });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao listar consultas' });
  }
};

// Criar consulta
const criarConsulta = async (req, res) => {
  try {
    const { clienteId, data, hora, notas } = req.body;
    if (!clienteId || !data || !hora) {
      return res.status(400).json({ success: false, message: 'Cliente, data e hora são obrigatórios' });
    }

    const vinculo = await Vinculo.findOne({
      profissional: req.user._id,
      cliente: clienteId,
      status: 'ativo'
    });
    if (!vinculo) {
      return res.status(403).json({ success: false, message: 'Este cliente não está vinculado a você' });
    }

    const consulta = await Consulta.create({
      profissional: req.user._id,
      cliente: clienteId,
      data: new Date(data),
      hora,
      notas: notas || ''
    });

    const populada = await consulta.populate('cliente', 'nome email contato');
    res.status(201).json({ success: true, consulta: populada });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao criar consulta' });
  }
};

// Atualizar status/notas da consulta
const atualizarConsulta = async (req, res) => {
  try {
    const { status, notas } = req.body;
    const consulta = await Consulta.findOneAndUpdate(
      { _id: req.params.id, profissional: req.user._id },
      { status, notas },
      { new: true }
    ).populate('cliente', 'nome email contato');

    if (!consulta) return res.status(404).json({ success: false, message: 'Consulta não encontrada' });
    res.json({ success: true, consulta });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar consulta' });
  }
};

// Deletar consulta
const deletarConsulta = async (req, res) => {
  try {
    await Consulta.findOneAndDelete({ _id: req.params.id, profissional: req.user._id });
    res.json({ success: true, message: 'Consulta removida' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao deletar consulta' });
  }
};

module.exports = { listarConsultas, criarConsulta, atualizarConsulta, deletarConsulta };
