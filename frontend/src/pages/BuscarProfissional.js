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

const tipoIcone = { personal: '🏋️', nutricionista: '🥗', psicologo: '🧠', ia: '🤖' };

const BuscarProfissional = () => {
  const { token, user } = useAuth();
  const [profissionais, setProfissionais] = useState([]);
  const [meusVinculos, setMeusVinculos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [solicitando, setSolicitando] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const url = filtro
        ? `${API}/api/profissional/listar?tipo=${filtro}`
        : `${API}/api/profissional/listar`;

      const [resProf, resVinc] = await Promise.all([
        fetch(url, { headers }),
        fetch(`${API}/api/profissional/meus-vinculos`, { headers }),
      ]);

      const dataProf = await resProf.json();
      const dataVinc = await resVinc.json();

      if (dataProf.success) setProfissionais(dataProf.profissionais);
      if (dataVinc.success) setMeusVinculos(dataVinc.vinculos);
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, token]);

  useEffect(() => { carregar(); }, [carregar]);

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
        // Abre WhatsApp apenas para profissionais humanos
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
    if (status === 'ativo') return <span className="vinculo-status ativo">Vinculado ✓</span>;
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

  // Separa IA dos humanos
  const profIA = profissionais.filter(p => p.profissional?.isAI);
  const profHumanos = profissionais.filter(p => !p.profissional?.isAI);

  return (
    <>
      <Navbar />
      <div className="buscar-prof-container">
        <h1>Profissionais</h1>
        <p className="subtitulo">
          Encontre personal trainers, nutricionistas, psicólogos ou use nossa IA.
        </p>

        {/* Card destaque IA */}
        {!loading && profIA.map(prof => (
          <div key={prof._id} className="prof-card prof-card-ia">
            <div className="prof-card-avatar ia-avatar">🤖</div>
            <div className="prof-card-body">
              <h3>{prof.nome}</h3>
              <span className="prof-tipo-badge tipo-ia">Inteligência Artificial</span>
              <p className="prof-bio">{prof.profissional?.bio}</p>
              <p className="prof-registro" style={{ color: '#7c3aed', fontWeight: 600 }}>
                Treino · Nutrição · Psicólogo — tudo em um só lugar
              </p>
              <div className="prof-card-actions">
                {renderBotao(prof)}
              </div>
            </div>
          </div>
        ))}

        {/* Divisor */}
        {profHumanos.length > 0 && (
          <>
            <div className="prof-divisor">
              <span>ou escolha um profissional humano</span>
            </div>

            {/* Filtros */}
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
          </>
        )}

        {loading ? (
          <div className="loading-state">Buscando profissionais...</div>
        ) : profHumanos.length === 0 && profIA.length === 0 ? (
          <p className="empty-state">Nenhum profissional encontrado.</p>
        ) : (
          profHumanos.map(prof => (
            <div key={prof._id} className="prof-card">
              <div className="prof-card-avatar">
                {tipoIcone[prof.profissional?.tipo] || '👤'}
              </div>
              <div className="prof-card-body">
                <h3>{prof.nome}</h3>
                <span className={`prof-tipo-badge tipo-${prof.profissional?.tipo}`}>
                  {prof.profissional?.tipo === 'personal' && 'Personal Trainer'}
                  {prof.profissional?.tipo === 'nutricionista' && 'Nutricionista'}
                  {prof.profissional?.tipo === 'psicologo' && 'Psicólogo'}
                </span>
                <p className="prof-registro">Registro: {prof.profissional?.registro}</p>
                {prof.profissional?.bio && <p className="prof-bio">{prof.profissional.bio}</p>}
                <div className="prof-card-actions">
                  {renderBotao(prof)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default BuscarProfissional;
