const express = require('express');
const router = express.Router();
const { protect, isProfissional } = require('../middleware/auth');
const { listarConsultas, criarConsulta, atualizarConsulta, deletarConsulta } = require('../controllers/consultaController');

router.get('/', protect, isProfissional, listarConsultas);
router.post('/', protect, isProfissional, criarConsulta);
router.put('/:id', protect, isProfissional, atualizarConsulta);
router.delete('/:id', protect, isProfissional, deletarConsulta);

module.exports = router;
