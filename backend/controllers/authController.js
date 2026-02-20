// ============================================================================
// CONTROLLER DE AUTENTICAÇÃO
// ============================================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Função auxiliar para gerar token JWT
 * @param {string} id - ID do usuário
 * @returns {string} - Token JWT
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },                           // Payload: dados que vão dentro do token
    process.env.JWT_SECRET,           // Chave secreta para assinar o token
    { expiresIn: process.env.JWT_EXPIRE || '7d' }  // Token expira em 7 dias
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public (qualquer um pode acessar)
 */
const register = async (req, res) => {
  try {
    // Desestrutura os dados do corpo da requisição
    const {
      email,
      password,
      nome,
      idade,
      sexo,
      peso,
      altura,
      frequencia
    } = req.body;

    // 1. Validação básica dos campos obrigatórios
    if (!email || !password || !nome || !idade || !sexo || !peso || !altura) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, preencha todos os campos obrigatórios'
      });
    }

    // 2. Verifica se o email já está cadastrado
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // 3. Cria o novo usuário no banco de dados
    // A senha será automaticamente criptografada pelo middleware pre-save do model
    const user = await User.create({
      email,
      password,
      nome,
      idade,
      sexo,
      peso,
      altura,
      frequencia: frequencia || 0
    });

    // 4. Gera token JWT para o usuário
    const token = generateToken(user._id);

    // 5. Retorna sucesso com o token e dados do usuário
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      token,
      user: user.dadosPublicos()  // Método que retorna dados sem senha
    });

  } catch (error) {
    console.error('Erro no registro:', error);

    // Trata erros de validação do Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Fazer login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Valida se email e senha foram fornecidos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça email e senha'
      });
    }

    // 2. Busca o usuário pelo email
    // .select('+password') inclui a senha na busca (ela é excluída por padrão)
    const user = await User.findOne({ email }).select('+password');

    // 3. Verifica se o usuário existe
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // 4. Verifica se a senha está correta
    const senhaCorreta = await user.compararSenha(password);

    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // 5. Atualiza data do último login
    user.lastLogin = Date.now();
    await user.save();

    // 6. Gera token
    const token = generateToken(user._id);

    // 7. Retorna sucesso
    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      user: user.dadosPublicos()
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Obter dados do usuário atual (logado)
 * @access  Private (precisa estar autenticado)
 */
const getMe = async (req, res) => {
  try {
    // req.user foi adicionado pelo middleware protect
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: user.dadosPublicos()
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do usuário'
    });
  }
};

/**
 * @route   PUT /api/auth/update-password
 * @desc    Atualizar senha do usuário
 * @access  Private
 */
const updatePassword = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    // 1. Validação
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        success: false,
        message: 'Forneça a senha atual e a nova senha'
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha deve ter no mínimo 6 caracteres'
      });
    }

    // 2. Busca usuário com senha
    const user = await User.findById(req.user.id).select('+password');

    // 3. Verifica se a senha atual está correta
    const senhaCorreta = await user.compararSenha(senhaAtual);

    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // 4. Atualiza a senha
    user.password = novaSenha;
    await user.save();  // O middleware pre-save vai criptografar automaticamente

    // 5. Gera novo token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Senha atualizada com sucesso!',
      token
    });

  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar senha'
    });
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar recuperação de senha (envia email)
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    // Sempre retorna 200 para não revelar se o email existe no sistema
    // Em produção: buscar usuário, gerar token e enviar email real
    res.json({
      success: true,
      message: 'Se esse email estiver cadastrado, você receberá as instruções em breve.'
    });

  } catch (error) {
    console.error('Erro em forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar solicitação'
    });
  }
};

// Exporta todas as funções
module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword
};
