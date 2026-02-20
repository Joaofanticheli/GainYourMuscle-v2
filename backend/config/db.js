// ============================================================================
// CONFIGURAÇÃO DO BANCO DE DADOS MONGODB
// ============================================================================

const mongoose = require('mongoose');

/**
 * Conecta ao banco de dados MongoDB
 * Usa a string de conexão definida nas variáveis de ambiente
 */
const connectDB = async () => {
  try {
    // Opções de configuração do Mongoose
    const options = {
      // useNewUrlParser: true,      // Usa o novo parser de URL do MongoDB
      // useUnifiedTopology: true,   // Usa o novo motor de gerenciamento de conexão
    };

    // Pega a string de conexão do arquivo .env
    const mongoURI = process.env.MONGO_URI;

    // Verifica se a variável de ambiente foi definida
    if (!mongoURI) {
      throw new Error('MONGO_URI não está definida no arquivo .env');
    }

    // Conecta ao MongoDB
    const conn = await mongoose.connect(mongoURI, options);

    // Log de sucesso com informações da conexão
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Event listeners para monitorar a conexão
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });

  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    // Encerra o processo se não conseguir conectar ao banco
    process.exit(1);
  }
};

// Exporta a função para ser usada no server.js
module.exports = connectDB;
