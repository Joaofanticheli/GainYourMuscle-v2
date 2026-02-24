import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/Duvidas.css';

const API = process.env.REACT_APP_API_URL || 'https://gainyourmuscle-v2.onrender.com';

const SUGESTOES = [
  'Como lidar com a falta de motivação para treinar?',
  'Estou me sentindo ansioso, o exercício pode ajudar?',
  'Como manter a disciplina nos meus hábitos saudáveis?',
  'Sinto culpa quando não treino. É normal?',
  'Como equilibrar treino, trabalho e vida pessoal?',
  'Tenho dificuldade em manter uma rotina. O que fazer?',
  'Como lidar com a pressão estética que sinto?',
  'Como a alimentação afeta meu humor e bem-estar?',
];

const PsicologoChat = () => {
  const { token } = useAuth();
  const [mensagem, setMensagem] = useState('');
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historico, carregando]);

  const enviar = async (texto) => {
    const msg = texto || mensagem.trim();
    if (!msg || carregando) return;

    setHistorico(prev => [...prev, { role: 'user', content: msg }]);
    setMensagem('');
    setCarregando(true);

    try {
      const res = await fetch(`${API}/api/chat/psicologo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ mensagem: msg, historico }),
      });
      const data = await res.json();
      setHistorico(prev => [...prev, {
        role: 'assistant',
        content: data.resposta || 'Não consegui processar sua mensagem.'
      }]);
    } catch {
      setHistorico(prev => [...prev, {
        role: 'assistant',
        content: 'Erro de conexão. Tente novamente.',
      }]);
    } finally {
      setCarregando(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <div className="duvidas-page">
      <Navbar />
      <div className="duvidas-container">
        <header className="duvidas-header">
          <h1>🧠 Psicólogo IA</h1>
          <p>Apoio emocional e bem-estar mental — disponível 24h para você</p>
        </header>

        {historico.length === 0 && (
          <div className="duvidas-inicio">
            <div className="duvidas-ai-card">
              <div className="duvidas-ai-avatar">🧠</div>
              <div className="duvidas-ai-info">
                <h2>Bem-estar Mental & Motivação</h2>
                <p>
                  Aqui você pode falar sobre ansiedade, motivação, disciplina, autoestima e equilíbrio
                  emocional. Tudo no contexto de um estilo de vida mais saudável.
                </p>
              </div>
            </div>
            <span className="duvidas-sugestoes-titulo">Sugestões de temas</span>
            <div className="sugestoes-grid">
              {SUGESTOES.map((s, i) => (
                <button key={i} className="sugestao-btn" onClick={() => enviar(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {historico.length > 0 && (
          <div className="duvidas-chat">
            {historico.map((msg, i) => (
              <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
                <div className="chat-msg-avatar">{msg.role === 'user' ? '👤' : '🧠'}</div>
                <div className="chat-msg-content">
                  {msg.content.split('\n').filter(l => l.trim()).map((linha, j) => (
                    <p key={j}>{linha}</p>
                  ))}
                </div>
              </div>
            ))}
            {carregando && (
              <div className="chat-msg chat-msg-assistant">
                <div className="chat-msg-avatar">🧠</div>
                <div className="chat-msg-content chat-digitando">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        <div className="duvidas-input-area">
          {historico.length > 0 && (
            <div className="sugestoes-rapidas">
              {SUGESTOES.slice(0, 3).map((s, i) => (
                <button key={i} className="sugestao-rapida-btn" onClick={() => enviar(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="duvidas-input-row">
            <textarea
              ref={inputRef}
              className="duvidas-input"
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Como você está se sentindo hoje?"
              rows={2}
              disabled={carregando}
            />
            <button
              className="duvidas-send-btn"
              onClick={() => enviar()}
              disabled={!mensagem.trim() || carregando}
            >
              {carregando ? '...' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Psicologo = () => <PsicologoChat />;

export default Psicologo;
