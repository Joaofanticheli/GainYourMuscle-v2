// ============================================================================
// MODEL DE USUÁRIO - Esquema do MongoDB
// ============================================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schema (esquema) do Usuário
 * Define a estrutura dos dados que serão salvos no MongoDB
 */
const UserSchema = new mongoose.Schema({
  // ========== INFORMAÇÕES DE LOGIN ==========
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,                          // Não pode ter emails duplicados
    lowercase: true,                        // Converte para minúsculo
    trim: true,                             // Remove espaços nas pontas
    match: [                                // Validação de formato de email
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, insira um email válido'
    ]
  },

  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
    select: false                          // Não retorna senha nas queries por padrão
  },

  // ========== INFORMAÇÕES PESSOAIS ==========
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },

  idade: {
    type: Number,
    required: [true, 'Idade é obrigatória'],
    min: [13, 'Idade mínima é 13 anos'],
    max: [120, 'Idade máxima é 120 anos']
  },

  sexo: {
    type: String,
    required: [true, 'Sexo biológico é obrigatório'],
    enum: {
      values: ['masculino', 'feminino'],
      message: 'Sexo deve ser masculino ou feminino'
    }
  },

  // ========== INFORMAÇÕES FÍSICAS ==========
  peso: {
    type: Number,
    required: [true, 'Peso é obrigatório'],
    min: [30, 'Peso mínimo é 30kg'],
    max: [300, 'Peso máximo é 300kg']
  },

  altura: {
    type: Number,
    required: [true, 'Altura é obrigatória'],
    min: [55, 'Altura mínima é 55cm'],
    max: [250, 'Altura máxima é 250cm']
  },

  // Frequência de atividade física (vezes por semana)
  frequencia: {
    type: Number,
    required: [true, 'Frequência é obrigatória'],
    min: [0, 'Frequência mínima é 0'],
    max: [7, 'Frequência máxima é 7 dias por semana']
  },

  // ========== PREFERÊNCIAS DE TREINO ==========
  preferencias: {
    // Dias de treino por semana
    diasTreino: {
      type: Number,
      min: 3,
      max: 6,
      default: 4
    },

    // Nível de experiência
    experiencia: {
      type: String,
      enum: ['nunca', 'novato', 'intermediaria'],
      default: 'novato'
    },

    // Relação com fadiga
    fadiga: {
      type: String,
      enum: ['evito', 'consigo', 'nao'],
      default: 'consigo'
    },

    // Limitações físicas
    lesao: {
      type: String,
      enum: ['nenhuma', 'leve', 'pequena'],
      default: 'nenhuma'
    },

    // Duração preferida de treino
    duracao: {
      type: String,
      enum: ['curto', 'normal', 'longo'],
      default: 'normal'
    },

    // Nível de disciplina
    disciplina: {
      type: String,
      enum: ['frequentemente', 'intermediario', 'raramente'],
      default: 'intermediario'
    },

    // Preferência por variedade
    variedade: {
      type: String,
      enum: ['gosto', 'nao', 'intermediario'],
      default: 'intermediario'
    },

    // Ambiente de treino
    ambiente: {
      type: String,
      enum: ['casa', 'pequena', 'grande'],
      default: 'grande'
    },

    // Tolerância a desconforto muscular
    muscular: {
      type: String,
      enum: ['atrapalharia', 'pouco', 'nao'],
      default: 'pouco'
    }
  },

  // ========== PROGRESSO E HISTÓRICO ==========
  progresso: [{
    data: {
      type: Date,
      default: Date.now
    },
    peso: Number,
    medidas: {
      braco: Number,
      peito: Number,
      cintura: Number,
      quadril: Number,
      coxa: Number
    },
    foto: String,  // URL da foto (opcional)
    notas: String
  }],

  // ========== TREINO ATUAL ==========
  treinoAtual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout'  // Referência para o modelo de Treino
  },

  // ========== METADADOS ==========
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  isActive: {
    type: Boolean,
    default: true
  },

  lastLogin: {
    type: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Adiciona campos createdAt e updatedAt automaticamente
  timestamps: true
});

// ============================================================================
// MIDDLEWARES DO SCHEMA
// ============================================================================

/**
 * Middleware PRE-SAVE
 * Executado ANTES de salvar o documento no banco
 * Usado para criptografar a senha antes de salvar
 */
UserSchema.pre('save', async function() {
  // Se a senha não foi modificada, não precisa criptografar novamente
  if (!this.isModified('password')) return;

  // Gera um "salt" e criptografa a senha
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ============================================================================
// MÉTODOS DO SCHEMA
// ============================================================================

/**
 * Método para comparar senha fornecida com a senha criptografada no banco
 * @param {string} senhaFornecida - Senha em texto plano fornecida no login
 * @returns {Promise<boolean>} - true se as senhas coincidem
 */
UserSchema.methods.compararSenha = async function(senhaFornecida) {
  return await bcrypt.compare(senhaFornecida, this.password);
};

/**
 * Método para retornar dados públicos do usuário (sem senha)
 * @returns {Object} - Objeto com dados públicos
 */
UserSchema.methods.dadosPublicos = function() {
  return {
    id: this._id,
    nome: this.nome,
    email: this.email,
    idade: this.idade,
    sexo: this.sexo,
    peso: this.peso,
    altura: this.altura,
    frequencia: this.frequencia,
    preferencias: this.preferencias,
    treinoAtual: this.treinoAtual,
    createdAt: this.createdAt
  };
};

// ============================================================================
// EXPORTA O MODEL
// ============================================================================

module.exports = mongoose.model('User', UserSchema);
