// ============================================================================
// MODEL DE CONSULTA — Agenda do Psicólogo
// ============================================================================

const mongoose = require('mongoose');

const ConsultaSchema = new mongoose.Schema({
  profissional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  data: {
    type: Date,
    required: true
  },
  hora: {
    type: String,  // ex: '14:30'
    required: true
  },
  status: {
    type: String,
    enum: ['agendada', 'realizada', 'cancelada'],
    default: 'agendada'
  },
  notas: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Consulta', ConsultaSchema);
