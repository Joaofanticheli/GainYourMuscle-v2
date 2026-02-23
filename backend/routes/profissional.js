// ============================================================================
// ROTAS DE PROFISSIONAL
// ============================================================================

const express = require('express');
const router = express.Router();

const {
  listarProfissionais,
  meusClientes,
  dadosCliente,
  solicitarVinculo,
  responderVinculo,
  vinculosPendentes,
  meusVinculos
} = require('../controllers/profissionalController');

const { protect, isProfissional } = require('../middleware/auth');

// Todos autenticados
router.get('/listar', protect, listarProfissionais);
router.post('/vincular', protect, solicitarVinculo);
router.get('/meus-vinculos', protect, meusVinculos);

// Apenas profissionais
router.get('/meus-clientes', protect, isProfissional, meusClientes);
router.get('/cliente/:id', protect, isProfissional, dadosCliente);
router.put('/vinculos/:id', protect, isProfissional, responderVinculo);
router.get('/vinculos/pendentes', protect, isProfissional, vinculosPendentes);

module.exports = router;
