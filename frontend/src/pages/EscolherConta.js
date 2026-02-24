// ============================================================================
// PÁGINA DE ESCOLHA DE TIPO DE CONTA
// ============================================================================

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';
import '../styles/EscolherConta.css';

const EscolherConta = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-box escolher-box">
        <h1 className="auth-title">GainYourMuscle</h1>
        <h2 className="auth-subtitle">Criar Conta</h2>

        <p className="escolher-descricao">Como voce quer se cadastrar?</p>

        <div className="escolher-cards">
          <button
            className="escolher-card"
            onClick={() => navigate('/register')}
          >
            <span className="escolher-icon">🏋️</span>
            <strong>Aluno</strong>
            <span>Quero treinar, acompanhar meu progresso e receber planos personalizados</span>
          </button>

          <button
            className="escolher-card"
            onClick={() => navigate('/register-profissional')}
          >
            <span className="escolher-icon">👨‍⚕️</span>
            <strong>Profissional</strong>
            <span>Sou Personal Trainer, Nutricionista ou Psicologo e quero atender alunos</span>
          </button>
        </div>

        <div className="auth-links">
          <Link to="/login">Ja tem conta? Fazer login</Link>
        </div>

        <div className="auth-back">
          <Link to="/">&#8592; Voltar para home</Link>
        </div>
      </div>
    </div>
  );
};

export default EscolherConta;
