// ============================================================================
// MODEL DE TREINO - Esquema do MongoDB
// ============================================================================

const mongoose = require('mongoose');

/**
 * Schema de um Exercício individual
 */
const ExerciseSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  grupoMuscular: {
    type: String,
    required: true,
    enum: ['peito', 'costas', 'ombro', 'biceps', 'triceps', 'pernas', 'abdomen', 'cardio', 'mobilidade']
  },
  series: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  repeticoes: {
    type: String,  // Ex: "8-12", "15-20", "AMRAP"
    required: true
  },
  descanso: {
    type: Number,  // Descanso em segundos
    default: 60
  },
  observacoes: String,
  videoUrl: String,  // Link para vídeo demonstrativo (opcional)
  ordem: Number      // Ordem do exercício no treino
});

/**
 * Schema de um Dia de Treino
 */
const DayWorkoutSchema = new mongoose.Schema({
  dia: {
    type: String,
    required: true
    // Ex: "Seg", "Ter", "Qua", etc
  },
  nome: {
    type: String,
    required: true
    // Ex: "Peito e Tríceps", "Costas e Bíceps"
  },
  focoPrincipal: [String],  // Ex: ["peito", "triceps"]
  exercicios: [ExerciseSchema],
  duracaoEstimada: Number,  // Duração em minutos
  dificuldade: {
    type: String,
    enum: ['facil', 'moderado', 'dificil'],
    default: 'moderado'
  }
});

/**
 * Schema principal do Treino
 */
const WorkoutSchema = new mongoose.Schema({
  // ========== RELACIONAMENTO COM USUÁRIO ==========
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ========== INFORMAÇÕES DO TREINO ==========
  nome: {
    type: String,
    required: true
    // Ex: "Treino ABC - Hipertrofia"
  },

  descricao: {
    type: String
  },

  tipo: {
    type: String,
    enum: ['hipertrofia', 'forca', 'resistencia', 'emagrecimento', 'funcional'],
    default: 'hipertrofia'
  },

  nivel: {
    type: String,
    enum: ['iniciante', 'intermediario', 'avancado'],
    default: 'iniciante'
  },

  // ========== ESTRUTURA DO TREINO ==========
  divisao: {
    type: String,
    required: true
    // Ex: "ABC", "ABCDE", "FullBody", "Upper/Lower"
  },

  diasPorSemana: {
    type: Number,
    required: true,
    min: 3,
    max: 6
  },

  // Array de dias de treino
  dias: [DayWorkoutSchema],

  // ========== PARÂMETROS DE GERAÇÃO ==========
  parametros: {
    experiencia: String,
    fadiga: String,
    lesao: String,
    duracao: String,
    disciplina: String,
    variedade: String,
    ambiente: String,
    muscular: String
  },

  // ========== STATUS E PROGRESSO ==========
  isActive: {
    type: Boolean,
    default: true
  },

  dataInicio: {
    type: Date,
    default: Date.now
  },

  dataFim: Date,

  // Quantas vezes o usuário completou este treino
  vezesCompleto: {
    type: Number,
    default: 0
  },

  // Histórico de treinos realizados
  historico: [{
    data: {
      type: Date,
      default: Date.now
    },
    diaRealizado: String,  // Qual dia do treino foi feito
    exerciciosRealizados: Number,
    tempoDuracao: Number,  // Minutos
    feedback: {
      dificuldade: Number,  // 1-5
      satisfacao: Number,   // 1-5
      energia: Number,      // 1-5
      notas: String
    }
  }],

  // ========== METADADOS ==========
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ============================================================================
// MÉTODOS DO SCHEMA
// ============================================================================

/**
 * Método para obter treino do dia atual
 * @returns {Object} - Dia de treino correspondente
 */
WorkoutSchema.methods.getTreinoDoDia = function() {
  const hoje = new Date().getDay(); // 0 = Domingo, 1 = Segunda, etc

  // Mapeia dia da semana para o treino
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const diaAtual = diasSemana[hoje];

  // Encontra o treino do dia atual
  return this.dias.find(dia => dia.dia === diaAtual);
};

/**
 * Método para marcar treino como completo
 */
WorkoutSchema.methods.marcarCompleto = async function() {
  this.vezesCompleto += 1;
  return await this.save();
};

// ============================================================================
// EXPORTA O MODEL
// ============================================================================

module.exports = mongoose.model('Workout', WorkoutSchema);
