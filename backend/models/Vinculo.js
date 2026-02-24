// ============================================================================
// MODEL DE VÍNCULO - Conexão entre Profissional e Cliente
// ============================================================================

const mongoose = require('mongoose');

const VinculoSchema = new mongoose.Schema({
  profissional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Profissional é obrigatório']
  },

  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Cliente é obrigatório']
  },

  tipoProfissional: {
    type: String,
    enum: ['personal', 'nutricionista', 'psicologo', 'ia'],
    required: [true, 'Tipo de profissional é obrigatório']
  },

  status: {
    type: String,
    enum: ['pendente', 'ativo', 'recusado'],
    default: 'pendente'
  }
}, {
  timestamps: true
});

// Índice composto para evitar vínculos duplicados entre o mesmo par
VinculoSchema.index({ profissional: 1, cliente: 1 }, { unique: true });

module.exports = mongoose.model('Vinculo', VinculoSchema);
