import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/Profissional.css';

const API = process.env.REACT_APP_API_URL || 'https://gainyourmuscle-v2.onrender.com';

const TIPOS_FILTRO = [
  { value: '', label: 'Todos' },
  { value: 'personal', label: 'Personal Trainer' },
  { value: 'nutricionista', label: 'Nutricionista' },
  { value: 'psicologo', label: 'Psicólogo' },
];

const tipoLabel = { personal: 'Personal Trainer', nutricionista: 'Nutricionista', psicologo: 'Psicólogo' };
const tipoIcone = { personal: '🏋️', nutricionista: '🥗', psicologo: '🧠', ia: '🤖' };

const BuscarProfissional = () => {
  const { token, user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [meusVinculos, setMeusVinculos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [solicitando, setSolicitando] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [resProf, resVinc] = await Promise.all([
        fetch(`${API}/api/profissional/listar`, { headers }),
        fetch(`${API}/api/profissional/meus-vinculos`, { headers }),
      ]);
      const dataProf = await resProf.json();
      const dataVinc = await resVinc.json();
      if (dataProf.success) setTodos(dataProf.profissionais);
      if (dataVinc.success) setMeusVinculos(dataVinc.vinculos);
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { carregar(); }, [carregar]);

  // Filtragem client-side
  const profIA = todos.filter(p => p.profissional?.isAI);
  const profHumanos = todos
    .filter(p => !p.profissional?.isAI)
    .filter(p => !filtro || p.profissional?.tipo === filtro);

  const statusVinculo = (profId) => {
    const v = meusVinculos.find(v => v.profissional?._id === profId);
    return v ? v.status : null;
  };

  const abrirWhatsApp = (prof) => {
    const numero = prof.contato?.replace(/\D/g, '');
    if (!numero) return;
    const msg = encodeURIComponent(
      `Olá ${prof.nome}! Me chamo ${user?.nome} e acabei de solicitar um vínculo com você no GainYourMuscle.\n\n` +
      `📊 Peso: ${user?.peso || '?'}kg | Altura: ${user?.altura || '?'}cm\n` +
      `🏃 Frequência: ${user?.frequencia || '?'}x por semana\n` +
      `📱 Meu WhatsApp: ${user?.contato || 'não informado'}\n\n` +
      `Aguardo seu contato!`
    );
    window.open(`https://wa.me/55${numero}?text=${msg}`, '_blank');
  };

  const solicitar = async (prof) => {
    setSolicitando(prof._id);
    try {
      const res = await fetch(`${API}/api/profissional/vincular`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ profissionalId: prof._id }),
      });
      const data = await res.json();
      if (data.success) {
        carregar();
        if (!prof.profissional?.isAI) abrirWhatsApp(prof);
      } else {
        alert(data.message || 'Erro ao solicitar vínculo.');
      }
    } catch {
      alert('Erro de conexão.');
    } finally {
      setSolicitando(null);
    }
  };

  const renderBotao = (prof) => {
    const status = statusVinculo(prof._id);
    if (status === 'ativo')    return <span className="vinculo-status ativo">Vinculado ✓</span>;
    if (status === 'pendente') return <span className="vinculo-status pendente">Aguardando resposta</span>;
    if (status === 'recusado') return <span className="vinculo-status">Recusado</span>;

    const label = prof.profissional?.isAI ? 'Usar IA' : 'Solicitar vínculo';
    return (
      <button
        className={`btn-vincular ${prof.profissional?.isAI ? 'btn-vincular-ia' : ''}`}
        onClick={() => solicitar(prof)}
        disabled={solicitando === prof._id}
      >
        {solicitando === prof._id ? 'Enviando...' : label}
      </button>
    );
  };

  return (
    <>
      <Navbar />
      <div className="buscar-prof-container">
        <header className="buscar-prof-header">
          <h1>Profissionais</h1>
          <p>Encontre personal trainers, nutricionistas, psicólogos ou use nossa IA.</p>
        </header>

        {loading ? (
          <div className="loading-state">Buscando profissionais...</div>
        ) : (
          <>
            {/* Card destaque IA */}
            {profIA.map(prof => (
              <div key={prof._id} className="prof-card prof-card-ia">
                <div className="prof-card-avatar ia-avatar">🤖</div>
                <div className="prof-card-body">
                  <h3>{prof.nome}</h3>
                  <span className="prof-tipo-badge tipo-ia">Inteligência Artificial</span>
                  <p className="prof-bio">{prof.profissional?.bio}</p>
                  <p className="prof-registro-ia">Treino · Nutrição · Psicólogo — tudo em um só lugar</p>
                  <div className="prof-card-actions">{renderBotao(prof)}</div>
                </div>
              </div>
            ))}

            {/* Divisor */}
            <div className="prof-divisor"><span>ou escolha um profissional humano</span></div>

            {/* Filtros — sempre visíveis */}
            <div className="filtro-tipo">
              {TIPOS_FILTRO.map(t => (
                <button
                  key={t.value}
                  className={`filtro-btn ${filtro === t.value ? 'ativo' : ''}`}
                  onClick={() => setFiltro(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Lista de profissionais humanos */}
            {profHumanos.length === 0 ? (
              <p className="empty-state">Nenhum profissional encontrado para este filtro.</p>
            ) : (
              profHumanos.map(prof => (
                <div key={prof._id} className="prof-card">
                  <div className="prof-card-avatar">
                    {tipoIcone[prof.profissional?.tipo] || '👤'}
                  </div>
                  <div className="prof-card-body">
                    <h3>{prof.nome}</h3>
                    <span className={`prof-tipo-badge tipo-${prof.profissional?.tipo}`}>
                      {tipoLabel[prof.profissional?.tipo] || prof.profissional?.tipo}
                    </span>
                    <p className="prof-registro">Registro: {prof.profissional?.registro}</p>
                    {prof.profissional?.bio && <p className="prof-bio">{prof.profissional.bio}</p>}
                    <div className="prof-card-actions">{renderBotao(prof)}</div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </>
  );
};

export default BuscarProfissional;
