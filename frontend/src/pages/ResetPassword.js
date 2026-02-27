// ============================================================================
// PÁGINA REDEFINIR SENHA - Token recebido por email
// ============================================================================

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const API = process.env.REACT_APP_API_URL || 'https://gainyourmuscle-v2.onrender.com';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (novaSenha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirma) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novaSenha })
      });

      const data = await res.json();

      if (data.success) {
        setMessage(data.message);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || 'Erro ao redefinir senha.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">GainYourMuscle</h1>
        <h2 className="auth-subtitle">Nova Senha</h2>

        {error && <div className="alert alert-error">{error}</div>}

        {message ? (
          <div className="alert" style={{ background: '#e8f8ee', color: '#27ae60', borderLeft: '4px solid #27ae60' }}>
            {message}
            <p style={{ marginTop: 8, fontSize: '0.85em' }}>Redirecionando para o login...</p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="novaSenha">Nova Senha:</label>
              <input
                type="password"
                id="novaSenha"
                placeholder="Mínimo 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirma">Confirmar Nova Senha:</label>
              <input
                type="password"
                id="confirma"
                placeholder="Repita a nova senha"
                value={confirma}
                onChange={(e) => setConfirma(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </form>
        )}

        <div className="auth-links">
          <Link to="/login">Voltar para o login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
