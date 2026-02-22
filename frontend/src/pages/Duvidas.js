// ============================================================================
// PÁGINA DÚVIDAS — Chat IA especialista em fitness e nutrição
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { extrasAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Duvidas.css';

const SUGESTOES = [
  'Posso comer carboidrato antes do treino?',
  'Qual é o ideal de proteína para ganhar músculo?',
  'Por que sinto dor muscular no dia seguinte?',
  'Como saber se estou progredindo no treino?',
  'Qual a diferença entre carboidrato simples e complexo?',
  'Quantas horas devo dormir para ganhar músculo?',
  'Posso treinar com dor muscular (DOMS)?',
  'Como calcular minha ingestão de água ideal?',
];

const Duvidas = () => {
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

    const novaMensagem = { role: 'user', content: msg };
    setHistorico(prev => [...prev, novaMensagem]);
    setMensagem('');
    setCarregando(true);

    try {
      const res = await extrasAPI.chat(msg, historico);
      setHistorico(prev => [...prev, { role: 'assistant', content: res.data.resposta }]);
    } catch {
      setHistorico(prev => [...prev, {
        role: 'assistant',
        content: 'Erro ao processar sua dúvida. Verifique sua conexão e tente novamente.',
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
          <h1>💬 Tire suas Dúvidas</h1>
          <p>Especialista em fitness e nutrição disponível 24h — baseado na metodologia de Fabrício Pacholok</p>
        </header>

        {historico.length === 0 && (
          <div className="duvidas-inicio">
            <div className="duvidas-ai-card">
              <div className="duvidas-ai-avatar">🤖</div>
              <div className="duvidas-ai-info">
                <h2>Especialista em Fitness & Nutrição</h2>
                <p>Respondo com base no seu perfil e plano atual. Pergunte sobre treino, alimentação, suplementação ou recuperação.</p>
              </div>
            </div>
            <span className="duvidas-sugestoes-titulo">Sugestões de perguntas</span>
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
                <div className="chat-msg-avatar">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="chat-msg-content">
                  {msg.content.split('\n').filter(l => l.trim()).map((linha, j) => (
                    <p key={j}>{linha}</p>
                  ))}
                </div>
              </div>
            ))}
            {carregando && (
              <div className="chat-msg chat-msg-assistant">
                <div className="chat-msg-avatar">🤖</div>
                <div className="chat-msg-content chat-digitando">
                  <span></span><span></span><span></span>
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
              placeholder="Digite sua dúvida sobre treino ou nutrição..."
              rows={2}
              disabled={carregando}
            />
            <button
              className="duvidas-send-btn"
              onClick={() => enviar()}
              disabled={!mensagem.trim() || carregando}
            >
              {carregando ? '⏳' : '➤'}
            </button>
          </div>
          <p className="duvidas-hint">Enter para enviar • Shift+Enter para nova linha</p>
        </div>

      </div>
    </div>
  );
};

export default Duvidas;
