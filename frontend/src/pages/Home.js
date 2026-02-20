// ============================================================================
// PÁGINA HOME - Página Inicial Motivacional
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showMotivation, setShowMotivation] = useState(false);

  // Verifica se há token salvo (usuário já tem conta)
  const temToken = !!localStorage.getItem('token');

  // Se já está logado, redireciona para dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleYes = () => {
    setShowMotivation(true);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">GainYourMuscle</h1>
        <h2 className="home-subtitle">Melhore seu estilo de vida!</h2>
      </header>

      {temToken ? (
        /* Usuário já tem conta — mostrar boas-vindas */
        <main className="home-main">
          <div className="home-welcome">
            <div className="home-welcome-icon">👋</div>
            <h2>Bem-vindo de volta!</h2>
            <p>Sua conta está esperando por você.<br />Continue de onde parou.</p>
            <div className="home-answers">
              <button className="btn btn-primary btn-large" onClick={() => navigate('/login')}>
                Fazer Login
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/register')}>
                Nova Conta
              </button>
            </div>
          </div>
        </main>
      ) : !showMotivation ? (
        <main className="home-main">
          <div className="home-question">
            <p>Está pronto</p>
            <p>para mudar seu</p>
            <p>estilo de vida?</p>
          </div>

          <div className="home-answers">
            <button className="btn btn-primary" onClick={handleYes}>
              Sim
            </button>
            <a
              href="https://www.google.com.br"
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Não
            </a>
          </div>
        </main>
      ) : (
        <main className="home-main motivation-text">
          <div className="motivation-content">
            <p>
              Ter um estilo de vida mais fitness traz benefícios que vão muito
              além da estética.
            </p>
            <p>
              Praticar atividades físicas regularmente fortalece o coração, os
              músculos e os ossos, além de ajudar a prevenir doenças como diabetes,
              hipertensão e obesidade.
            </p>
            <p>
              Quem adota hábitos saudáveis percebe também um aumento significativo
              de energia e disposição, enfrentando o dia a dia com menos cansaço e
              mais vitalidade.
            </p>
            <p>
              <strong>Não estamos falando de ter uma vida regrada</strong> onde você não vai conseguir
              sentir prazer em um alimento igual um atleta de bodybuilder ou deixar de
              comer algo porque não quer engordar!
            </p>
            <p>
              E sim queremos trazer essa <strong>educação alimentar</strong> junto com a musculação
              e mobilidade para você ter uma vida mais saudável, menos dor e
              aproveitando tudo que há de bom na vida! 💪
            </p>

            <div className="home-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={() => navigate('/register')}
              >
                Criar Minha Conta
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/login')}
              >
                Já Tenho Conta
              </button>
            </div>
          </div>
        </main>
      )}

      <footer className="home-footer">
        <p>💡 Versão 2.0 - Mais completo, mais motivador!</p>
      </footer>
    </div>
  );
};

export default Home;
