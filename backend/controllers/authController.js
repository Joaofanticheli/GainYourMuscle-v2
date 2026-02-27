// ============================================================================
// CONTROLLER DE AUTENTICAÇÃO
// ============================================================================

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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
      dataNascimento,
      sexo,
      peso,
      altura,
      frequencia,
      contato
    } = req.body;

    // 1. Validação básica dos campos obrigatórios
    if (!email || !password || !nome || !dataNascimento || !sexo || !peso || !altura) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, preencha todos os campos obrigatórios'
      });
    }

    // Calcula idade a partir da data de nascimento
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idadeCalculada = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth() - nascimento.getMonth();
    if (mesAtual < 0 || (mesAtual === 0 && hoje.getDate() < nascimento.getDate())) {
      idadeCalculada--;
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
      dataNascimento: nascimento,
      idade: idadeCalculada,
      sexo,
      peso,
      altura,
      frequencia: frequencia || 0,
      contato: contato || ''
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

    // 5. Atualiza data do último login (sem disparar validação completa)
    await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

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
 * @desc    Solicitar recuperação de senha (envia email real)
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Sempre retorna sucesso para não revelar se o email existe
    if (!user) {
      return res.json({
        success: true,
        message: 'Se esse email estiver cadastrado, você receberá as instruções em breve.'
      });
    }

    // Gera token aleatório de 32 bytes
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Salva o hash do token no banco (nunca o token puro)
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: Date.now() + 3600000 // expira em 1 hora
    });

    // Monta o link de redefinição
    const frontendUrl = process.env.FRONTEND_URL || 'https://projetogym.vercel.app';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Configura o transporter com SMTP explícito do Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Envia o email
    await transporter.sendMail({
      from: `"GainYourMuscle" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Recuperação de Senha - GainYourMuscle',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #0f0f1a; color: #e0e0e0; border-radius: 12px;">
          <h2 style="color: #8b5cf6; margin-bottom: 4px;">GainYourMuscle 💪</h2>
          <p style="color: #aaa; margin-top: 0; font-size: 0.85em;">Sua plataforma de treinos</p>
          <hr style="border: none; border-top: 1px solid #2a2a3a; margin: 16px 0;" />
          <p>Olá, <strong>${user.nome}</strong>!</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1em;">
              Redefinir Minha Senha
            </a>
          </div>
          <p style="color: #888; font-size: 0.82em;">⏰ Este link expira em <strong>1 hora</strong>.</p>
          <p style="color: #888; font-size: 0.82em;">Se você não solicitou a recuperação de senha, ignore este email — sua senha não será alterada.</p>
          <hr style="border: none; border-top: 1px solid #2a2a3a; margin: 20px 0;" />
          <p style="color: #555; font-size: 0.78em;">Ou copie e cole este link no navegador:<br/>${resetUrl}</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'Se esse email estiver cadastrado, você receberá as instruções em breve.'
    });

  } catch (error) {
    console.error('Erro em forgot password:', error.message || error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar email. Tente novamente mais tarde.',
      detail: error.message
    });
  }
};

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Redefinir senha com token do email
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { novaSenha } = req.body;

    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha deve ter no mínimo 6 caracteres'
      });
    }

    // Gera o hash do token recebido para comparar com o banco
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Busca usuário com token válido e não expirado
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado. Solicite um novo link de recuperação.'
      });
    }

    // Atualiza a senha e limpa os campos de reset
    user.password = novaSenha;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso! Faça login com sua nova senha.'
    });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao redefinir senha'
    });
  }
};

/**
 * @route   POST /api/auth/register-profissional
 * @desc    Registrar novo profissional (personal, nutricionista, psicólogo)
 * @access  Public
 */
const registerProfissional = async (req, res) => {
  try {
    const { email, password, nome, tipo, registro, bio, contato } = req.body;

    if (!email || !password || !nome || !tipo || !registro) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, preencha todos os campos obrigatórios'
      });
    }

    const tiposValidos = ['personal', 'nutricionista', 'psicologo'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de profissional inválido'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    const user = await User.create({
      email,
      password,
      nome,
      // Campos físicos com valores padrão neutros para profissional
      dataNascimento: new Date('1990-01-01'),
      sexo: 'masculino',
      peso: 70,
      altura: 170,
      frequencia: 0,
      contato: contato || '',
      role: 'profissional',
      profissional: {
        tipo,
        registro,
        bio: bio || '',
        status: 'ativo'
      }
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Cadastro realizado! Aguarde a aprovação do seu perfil.',
      token,
      user: user.dadosPublicos()
    });

  } catch (error) {
    console.error('Erro no registro de profissional:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao criar profissional',
      error: error.message
    });
  }
};

// Exporta todas as funções
module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  registerProfissional
};
