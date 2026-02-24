import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfissional } from '../hooks/useProfissional';
import '../styles/ProfissionalGate.css';

const tipoLabel = {
  treino: 'treino',
  nutricao: 'plano nutricional',
  psicologo: 'acompanhamento psicológico',
};

const ProfissionalGate = ({ tipo, children }) => {
  const { token, user } = useAuth();
  const { temIA, temProfissional, profissionalHumano, loading } = useProfissional(token);

  // Profissionais acessam tudo diretamente
  if (user?.role === 'profissional') return children;

  if (loading) return <div className="gate-loading">Carregando...</div>;

  // Tem IA vinculada → mostra o conteúdo normal
  if (temIA) return children;

  // Tem profissional humano → mostra card do profissional
  if (temProfissional && profissionalHumano) {
    const numero = profissionalHumano.contato?.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá ${profissionalHumano.nome}! Sou ${user?.nome}, aluno do GainYourMuscle. Gostaria de solicitar meu ${tipoLabel[tipo] || 'serviço'}.`
    );
    const whatsLink = numero ? `https://wa.me/55${numero}?text=${msg}` : null;

    return (
      <div className="gate-humano">
        <div className="gate-humano-card">
          <div className="gate-humano-avatar">👨‍⚕️</div>
          <h2>Seu profissional cuida disso</h2>
          <p>
            <strong>{profissionalHumano.nome}</strong> é responsável pelo seu {tipoLabel[tipo] || 'serviço'}.
            Entre em contato para que ele crie e gerencie para você.
          </p>
          {whatsLink ? (
            <a href={whatsLink} target="_blank" rel="noopener noreferrer" className="gate-btn-whats">
              Falar com {profissionalHumano.nome} no WhatsApp
            </a>
          ) : (
            <p className="gate-sem-contato">Profissional não cadastrou contato.</p>
          )}
        </div>
      </div>
    );
  }

  // Sem profissional → prompt para contratar
  return (
    <div className="gate-sem-prof">
      <div className="gate-sem-prof-card">
        <div className="gate-icone">🔒</div>
        <h2>Você precisa de um profissional</h2>
        <p>
          Para acessar seu {tipoLabel[tipo] || 'conteúdo'}, selecione a <strong>IA GainYourMuscle</strong> ou
          um profissional humano na aba Profissionais.
        </p>
        <Link to="/profissionais" className="gate-btn-primary">
          Encontrar profissional
        </Link>
      </div>
    </div>
  );
};

export default ProfissionalGate;
