// ============================================================================
// PÁGINA DASHBOARD - Painel Principal do Usuário
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';
import '../styles/Anamnese.css';

const API = process.env.REACT_APP_API_URL || 'https://gainyourmuscle-v2.onrender.com';

const EyeIcon = ({ visivel }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {visivel ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [treinoHoje, setTreinoHoje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ocultarPeso, setOcultarPeso] = useState(true);
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    loadTreinoHoje();
    loadNotificacoes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotificacoes = async () => {
    try {
      const res = await fetch(`${API}/api/user/notificacoes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setNotificacoes(data.notificacoes);
    } catch {}
  };

  const dispensarNotificacao = async (id) => {
    try {
      await fetch(`${API}/api/user/notificacoes/${id}/lida`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificacoes(prev => prev.filter(n => n._id !== id));
    } catch {}
  };

  const loadTreinoHoje = async () => {
    try {
      const response = await workoutAPI.getToday();
      if (!response.data.descansando) {
        setTreinoHoje(response.data.treinoDoDia);
      }
    } catch (error) {
      console.log('Sem treino ainda');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-container">
          <div className="loading">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Bem-vindo, {user?.nome}! 💪</h1>
          <p className="dashboard-subtitle">Seu painel de treinos e progresso</p>
        </header>

        {notificacoes.length > 0 && (
          <div className="notificacoes-lista">
            {notificacoes.map(n => (
              <div key={n._id} className="notificacao-banner">
                <div className="notificacao-conteudo">
                  <span className="notificacao-icone">📋</span>
                  <div>
                    <strong>{n.de}</strong>
                    <p>{n.mensagem}</p>
                  </div>
                </div>
                <div className="notificacao-acoes">
                  <button
                    className="notificacao-btn-acao"
                    onClick={() => { dispensarNotificacao(n._id); navigate('/minha-anamnese'); }}
                  >
                    Preencher Ficha
                  </button>
                  <button className="notificacao-btn-dispensar" onClick={() => dispensarNotificacao(n._id)}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="dashboard-grid">
          {/* Card de Treino de Hoje */}
          <div className="card card-primary">
            <h2>🏋️ Treino de Hoje</h2>
            {treinoHoje ? (
              <div>
                <h3>{treinoHoje.nome}</h3>
                <p>{treinoHoje.exercicios?.length || 0} exercícios</p>
                <p>~{treinoHoje.duracaoEstimada} minutos</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/treino-hoje')}
                >
                  Ver Treino Completo
                </button>
              </div>
            ) : (
              <div>
                {user?.anamnese ? (
                  <p>Ficha preenchida! Aguardando seu profissional montar seu treino.</p>
                ) : (
                  <>
                    <p>Seu profissional irá montar seu treino. Preencha sua ficha para que ele possa começar!</p>
                    <button
                      className="btn btn-outline"
                      onClick={() => navigate('/minha-anamnese')}
                    >
                      Preencher Ficha de Saúde
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Card de Ações Rápidas */}
          <div className="card">
            <h2>⚡ Ações Rápidas</h2>
            <div className="quick-actions">
              <button
                className="btn btn-outline"
                onClick={() => navigate('/meu-treino')}
              >
                💪 Ver Meu Treino
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/profissionais')}
              >
                🩺 Buscar Profissional
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/minha-anamnese')}
              >
                📋 Minha Ficha de Saúde
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/perfil')}
              >
                ⚙️ Meu Perfil
              </button>
            </div>
          </div>

          {/* Card Motivacional */}
          <div className="card card-motivation">
            <h2>💡 Frase do Dia</h2>
            <blockquote>
              "O objetivo não é ser perfeito. O objetivo é ser melhor do que você era ontem."
            </blockquote>
            <p className="motivation-author">- Anônimo</p>
          </div>

          {/* Card de Estatísticas */}
          <div className="card">
            <h2>📊 Suas Estatísticas</h2>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-label">Peso Atual:</span>
                <div className="stat-peso-right">
                  <button
                    className="btn-peso-olho"
                    onClick={() => setOcultarPeso(!ocultarPeso)}
                    title={ocultarPeso ? 'Mostrar peso' : 'Ocultar peso'}
                  >
                    <EyeIcon visivel={!ocultarPeso} />
                  </button>
                  <span className={`stat-value ${ocultarPeso ? 'dado-oculto' : ''}`}>
                    {ocultarPeso ? '•••' : `${user?.peso} kg`}
                  </span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-label">Altura:</span>
                <span className="stat-value">{user?.altura} cm</span>
              </div>
            </div>
          </div>

          {/* Card Anamnese - aparece para alunos que ainda não preencheram ou precisam atualizar */}
          <div className="card card-anamnese-cta">
            <h2>{user?.anamnese ? '📋 Sua Ficha de Saúde' : '📋 Preencha sua Ficha'}</h2>
            {user?.anamnese ? (
              <div>
                <p>Ficha preenchida! Seu profissional pode ver suas informações e montar seu treino.</p>
                <button className="btn btn-outline" onClick={() => navigate('/minha-anamnese')}>
                  Atualizar Ficha
                </button>
              </div>
            ) : (
              <div>
                <p>Preencha sua ficha de saúde para que seu profissional possa montar um treino personalizado para você.</p>
                <button className="btn btn-primary" onClick={() => navigate('/minha-anamnese')}>
                  Preencher Agora
                </button>
              </div>
            )}
          </div>

          {/* Card de Dicas */}
          <div className="card">
            <h2>💡 Dicas para Hoje</h2>
            <ul className="tips-list">
              <li>Beba pelo menos 2 litros de água hoje</li>
              <li>Faça um aquecimento de 5-10 minutos antes do treino</li>
              <li>Durma pelo menos 7-8 horas para recuperação muscular</li>
              <li>Não precisa de dieta extrema - equilíbrio é a chave!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
