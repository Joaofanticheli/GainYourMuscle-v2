// ============================================================================
// MIDDLEWARE DE AUTENTICAÇÃO - Proteção de Rotas
// ============================================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware para proteger rotas que precisam de autenticação
 * Verifica se o usuário enviou um token JWT válido
 *
 * Uso: adicione este middleware antes das rotas que precisam de autenticação
 * Exemplo: router.get('/perfil', protect, getUserProfile)
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Verifica se o token foi enviado no header Authorization
    // Formato esperado: "Authorization: Bearer TOKEN_AQUI"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extrai o token (remove a palavra "Bearer ")
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Se não há token, retorna erro de não autorizado
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado - Token não fornecido'
      });
    }

    try {
      // 3. Verifica se o token é válido
      // jwt.verify decodifica o token usando a chave secreta
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Busca o usuário no banco usando o ID que está no token
      // .select('-password') significa: retorna tudo EXCETO a senha
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Se o usuário não existe mais no banco (foi deletado), retorna erro
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // 6. Se tudo ok, permite acesso à próxima função (controller)
      next();

    } catch (error) {
      // Token inválido ou expirado
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor'
    });
  }
};

/**
 * Middleware para verificar se o usuário é admin
 * Deve ser usado DEPOIS do middleware protect
 *
 * Uso: router.delete('/user/:id', protect, admin, deleteUser)
 */
const admin = (req, res, next) => {
  // Verifica se o usuário autenticado tem role de admin
  if (req.user && req.user.role === 'admin') {
    next(); // Permite acesso
  } else {
    res.status(403).json({
      success: false,
      message: 'Acesso negado - Apenas administradores'
    });
  }
};

// Exporta os middlewares
module.exports = { protect, admin };
