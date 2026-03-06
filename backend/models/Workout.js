const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  grupoMuscular: {
    type: String, required: true,
    enum: ['peito','costas','ombro','biceps','triceps','pernas','abdomen','cardio','mobilidade']
  },
  series: { type: Number, required: true, min: 1, max: 10 },
  repeticoes: { type: String, required: true },
  descanso: { type: Number, default: 60 },
  intensidade: { type: String, enum: ['leve','moderado','intenso'], default: 'moderado' },
  carga: { type: String, default: '' },
  observacoes: String,
  videoUrl: String,
  ordem: Number
});

const DayWorkoutSchema = new mongoose.Schema({
  dia: { type: String, required: true },
  nome: { type: String, required: true },
  focoPrincipal: [String],
  exercicios: [ExerciseSchema],
  duracaoEstimada: Number,
  dificuldade: { type: String, enum: ['facil','moderado','dificil'], default: 'moderado' },
  observacaoGeral: { type: String, default: '' }
});

const WorkoutSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nome: { type: String, required: true },
  descricao: { type: String },
  tipo: { type: String, enum: ['hipertrofia','forca','resistencia','emagrecimento','funcional'], default: 'hipertrofia' },
  nivel: { type: String, enum: ['iniciante','intermediario','avancado'], default: 'iniciante' },
  divisao: { type: String, required: true },
  diasPorSemana: { type: Number, required: true, min: 1, max: 6 },
  dias: [DayWorkoutSchema],
  parametros: Object,
  isActive: { type: Boolean, default: true },
  arquivado: { type: Boolean, default: false },
  dataInicio: { type: Date, default: Date.now },
  dataFim: Date,
  vezesCompleto: { type: Number, default: 0 },
  historico: [{
    data: { type: Date, default: Date.now },
    diaRealizado: String,
    exerciciosRealizados: Number,
    tempoDuracao: Number,
    feedback: { dificuldade: Number, satisfacao: Number, energia: Number, notas: String }
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

WorkoutSchema.methods.getTreinoDoDia = function() {
  const hoje = new Date().getDay();
  const diasSemana = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];
  const diaAtual = diasSemana[hoje];
  return this.dias.find(dia => dia.dia === diaAtual);
};

WorkoutSchema.methods.marcarCompleto = async function() {
  this.vezesCompleto += 1;
  return await this.save();
};

module.exports = mongoose.model('Workout', WorkoutSchema);
