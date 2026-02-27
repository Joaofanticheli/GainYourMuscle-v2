import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfissional } from '../hooks/useProfissional';
import Navbar from './Navbar';
import '../styles/ProfissionalGate.css';

// Texto exibido em cada tipo de gate
const tipoLabel = {
  treino:    'treino',
  nutricao:  'plano nutricional',
  psicologo: 'acompanhamento psicológico',
};

// Mapeia tipo do gate → tipo do profissional necessário
// treino   → personal trainer
// nutricao → nutricionista
const TIPO_PROF_NECESSARIO = {
  treino:    'personal',
  nutricao:  'nutricionista',
  psicologo: 'psicologo',
};

// Emoji e nome amigável para cada tipo de profissional
const TIPO_PROF_LABEL = {
  personal:      { label: 'Personal Trainer', emoji: '🏋️' },
  nutricionista: { label: 'Nutricionista',    emoji: '🥗' },
  psicologo:     { label: 'Psicólogo',        emoji: '🧠' },
};

const ProfissionalGate = ({ tipo, children }) => {
  const { token, user } = useAuth();
  // ativos = lista de vínculos ativos, cada um tem tipoProfissional e profissional (dados do prof)
  const { ativos, temIA, loading } = useProfissional(token);

  // ── Profissionais acessam tudo diretamente ──────────────────────────────────
  if (user?.role === 'profissional') return children;

  if (loading) return <div className="gate-loading">Carregando...</div>;

  // ── IA vinculada → libera todas as abas ────────────────────────────────────
  if (temIA) return children;

  // ── Verifica se tem profissional HUMANO do tipo correto para esta aba ───────
  const tipoNecessario = TIPO_PROF_NECESSARIO[tipo];
  const vinculoDoTipo  = ativos.find(v => v.tipoProfissional === tipoNecessario);

  if (vinculoDoTipo?.profissional) {
    // Tem o profissional certo → mostra card com link para WhatsApp
    const p      = vinculoDoTipo.profissional;
    const numero = p.contato?.replace(/\D/g, '');
    const msg    = encodeURIComponent(
      `Olá ${p.nome}! Sou ${user?.nome}, aluno do GainYourMuscle. Gostaria de solicitar meu ${tipoLabel[tipo] || 'serviço'}.`
    );
    const whatsLink = numero ? `https://wa.me/55${numero}?text=${msg}` : null;

    return (
      <>
      <Navbar />
      <div className="gate-humano">
        <div className="gate-humano-card">
          <div className="gate-humano-avatar">👨‍⚕️</div>
          <h2>Seu profissional cuida disso</h2>
          <p>
            <strong>{p.nome}</strong> é responsável pelo seu {tipoLabel[tipo] || 'serviço'}.
            Entre em contato para que ele crie e gerencie para você.
          </p>
          {whatsLink ? (
            <a href={whatsLink} target="_blank" rel="noopener noreferrer" className="gate-btn-whats">
              Falar com {p.nome} no WhatsApp
            </a>
          ) : (
            <p className="gate-sem-contato">Profissional não cadastrou contato.</p>
          )}
        </div>
      </div>
      </>
    );
  }

  // ── Sem profissional do tipo necessário → mostra prompt para contratar ──────
  const profInfo = TIPO_PROF_LABEL[tipoNecessario] || { label: 'Profissional', emoji: '🔒' };

  // Se tem OUTRO tipo de profissional, personaliza a mensagem
  const temOutroProfissional = ativos.length > 0;

  return (
    <>
    <Navbar />
    <div className="gate-sem-prof">
      <div className="gate-sem-prof-card">
        <div className="gate-icone">{profInfo.emoji}</div>
        <h2>Você precisa de um {profInfo.label}</h2>
        <p>
          {temOutroProfissional
            ? `Você já tem um profissional vinculado, mas para acessar seu ${tipoLabel[tipo] || 'conteúdo'} você precisa de um ${profInfo.label}.`
            : `Para acessar seu ${tipoLabel[tipo] || 'conteúdo'}, selecione a `
          }
          {!temOutroProfissional && <><strong>IA GainYourMuscle</strong> ou um <strong>{profInfo.label}</strong> na aba Profissionais.</>}
        </p>
        <Link to="/profissionais" className="gate-btn-primary">
          {temOutroProfissional ? `Buscar ${profInfo.label}` : 'Encontrar profissional'}
        </Link>
      </div>
    </div>
    </>
  );
};

export default ProfissionalGate;
