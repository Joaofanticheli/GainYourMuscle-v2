// ============================================================================
// PÁGINA ESQUECEU SENHA
// ============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setMessage('Se esse email estiver cadastrado, você receberá as instruções em breve.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">GainYourMuscle</h1>
        <h2 className="auth-subtitle">Recuperar Senha</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {message && (
          <div className="alert" style={{ background: '#e8f8ee', color: '#27ae60', borderLeft: '4px solid #27ae60' }}>
            {message}
          </div>
        )}

        {!message && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email cadastrado:</label>
              <input
                type="email"
                id="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Instruções'}
            </button>
          </form>
        )}

        <div className="auth-links">
          <Link to="/login">Lembrou a senha? Fazer login</Link>
        </div>

        <div className="auth-back">
          <Link to="/">← Voltar para home</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
