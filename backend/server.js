// ============================================================================
// SERVIDOR PRINCIPAL - GainYourMuscle Backend
// ============================================================================

// Importa as dependências necessárias
const express = require('express');           // Framework web
const mongoose = require('mongoose');         // ODM para MongoDB
const cors = require('cors');                 // Permite requisições cross-origin
const dotenv = require('dotenv');             // Carrega variáveis de ambiente

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Importa a configuração do banco de dados
const connectDB = require('./config/db');

// Importa modelos para seeds
const User = require('./models/User');

// Importa as rotas da API
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const workoutRoutes = require('./routes/workout');
const nutritionRoutes = require('./routes/nutrition');
const extrasRoutes = require('./routes/extras');
const profissionalRoutes = require('./routes/profissional');
const consultaRoutes = require('./routes/consulta');

// ============================================================================
// CONFIGURAÇÃO DO SERVIDOR
// ============================================================================

// Cria a aplicação Express
const app = express();

// Define a porta do servidor (usa variável de ambiente ou 5000 como padrão)
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARES
// ============================================================================

// CORS - Permite que o frontend (React) se comunique com o backend
app.use(cors({
  origin: true,
  credentials: true
}));

// Body Parser - Permite ler JSON no corpo das requisições
app.use(express.json());

// Middleware para log de requisições (útil para debug)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROTAS DA API
// ============================================================================

// Rota de teste - verifica se o servidor está online
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'GainYourMuscle API está rodando! 💪',
    timestamp: new Date().toISOString()
  });
});

// Rotas de autenticação (login, registro, etc)
app.use('/api/auth', authRoutes);

// Rotas de usuário (perfil, atualizar dados, etc)
app.use('/api/user', userRoutes);

// Rotas de treino (gerar treino, salvar, buscar, etc)
app.use('/api/workout', workoutRoutes);

// Rotas de nutrição (gerar plano nutricional com IA)
app.use('/api/nutrition', nutritionRoutes);
app.use('/api', extrasRoutes);

// Rotas de profissionais (cadastro, vínculos, painel)
app.use('/api/profissional', profissionalRoutes);

// Rotas de consultas (agenda do psicólogo)
app.use('/api/consultas', consultaRoutes);

// Rota 404 - quando a rota não existe
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// ============================================================================
// TRATAMENTO DE ERROS GLOBAL
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Erro:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================================

// Função assíncrona para iniciar o servidor
const startServer = async () => {
  try {
    // 1. Conecta ao MongoDB
    await connectDB();
    console.log('✅ Conectado ao MongoDB com sucesso!');

    // 2. Seed: cria o Profissional IA se não existir
    const iaExistente = await User.findOne({ email: 'ia@gainyourmuscle.com' });
    if (!iaExistente) {
      await User.create({
        email: 'ia@gainyourmuscle.com',
        password: 'IA_GainYourMuscle_2024!',
        nome: 'IA GainYourMuscle',
        dataNascimento: new Date('2024-01-01'),
        sexo: 'masculino',
        peso: 70,
        altura: 170,
        frequencia: 0,
        role: 'profissional',
        profissional: {
          tipo: 'personal',
          registro: 'IA-001',
          bio: 'Personal trainer, nutricionista e psicólogo com inteligência artificial. Disponível 24h por dia para criar seus treinos, planos alimentares e apoio mental.',
          isAI: true,
          status: 'ativo'
        }
      });
      console.log('✅ Profissional IA criado com sucesso!');
    }

    // 2. Inicia o servidor Express
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║           🏋️  GAINYOURMUSCLE API - BACKEND 🏋️                  ║
╚════════════════════════════════════════════════════════════════╝

🚀 Servidor rodando em: http://localhost:${PORT}
📊 Health check: http://localhost:${PORT}/api/health
🗄️  MongoDB: Conectado
🌐 CORS: ${process.env.FRONTEND_URL || 'http://localhost:3000'}

Ambiente: ${process.env.NODE_ENV || 'development'}

Pressione Ctrl+C para parar o servidor
      `);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1); // Encerra o processo se houver erro crítico
  }
};

// Inicia o servidor
startServer();

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});
