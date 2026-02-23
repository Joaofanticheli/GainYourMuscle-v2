// ============================================================================
// BUSCA DE PROFISSIONAIS
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/Profissional.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TIPOS_FILTRO = [
  { value: '', label: 'Todos' },
  { value: 'personal', label: 'Personal Trainer' },
  { value: 'nutricionista', label: 'Nutricionista' },
  { value: 'psicologo', label: 'Psicólogo' },
];

const tipoIcone = {
  personal: '🏋️',
  nutricionista: '🥗',
  psicologo: '🧠',
};

const BuscarProfissional = () => {
  const { token } = useAuth();
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
      console.error('Erro ao carregar profissionais:', err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const statusVinculo = (profId) => {
    const v = meusVinculos.find(v => v.profissional?._id === profId);
    return v ? v.status : null;
  };

  const solicitar = async (profissionalId) => {
    setSolicitando(profissionalId);
    try {
      const res = await fetch(`${API}/api/profissional/vincular`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ profissionalId }),
      });
      const data = await res.json();
      if (data.success) carregar();
      else alert(data.message || 'Erro ao solicitar vínculo.');
    } catch {
      alert('Erro de conexão.');
    } finally {
      setSolicitando(null);
    }
  };

  const renderBotao = (prof) => {
    const status = statusVinculo(prof._id);
    if (status === 'ativo') return <span className="vinculo-status ativo">Vinculado</span>;
    if (status === 'pendente') return <span className="vinculo-status pendente">Aguardando resposta</span>;
    if (status === 'recusado') return <span className="vinculo-status">Recusado</span>;
    return (
      <button
        className="btn-vincular"
        onClick={() => solicitar(prof._id)}
        disabled={solicitando === prof._id}
      >
        {solicitando === prof._id ? 'Enviando...' : 'Solicitar vínculo'}
      </button>
    );
  };

  return (
    <>
      <Navbar />
      <div className="buscar-prof-container">
        <h1>Profissionais</h1>
        <p className="subtitulo">
          Encontre personal trainers, nutricionistas e psicólogos para te apoiar.
        </p>

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

        {loading ? (
          <div className="loading-state">Buscando profissionais...</div>
        ) : profissionais.length === 0 ? (
          <p className="empty-state">Nenhum profissional encontrado.</p>
        ) : (
          profissionais.map(prof => (
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

                <p className="prof-registro">
                  Registro: {prof.profissional?.registro}
                </p>

                {prof.profissional?.especialidade && (
                  <p className="prof-especialidade">
                    {prof.profissional.especialidade}
                  </p>
                )}

                {prof.profissional?.bio && (
                  <p className="prof-bio">{prof.profissional.bio}</p>
                )}

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
