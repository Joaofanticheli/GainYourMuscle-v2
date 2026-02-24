import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/Profissional.css';
import '../styles/DashboardProf.css';

const API = process.env.REACT_APP_API_URL || 'https://gainyourmuscle-v2.onrender.com';

const tipoLabel = { personal: 'Personal Trainer', nutricionista: 'Nutricionista', psicologo: 'Psicólogo' };

const DashboardProfissional = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [pendentes, setPendentes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('clientes');
  const [loading, setLoading] = useState(true);

  // Nova consulta
  const [novaConsulta, setNovaConsulta] = useState({ clienteId: '', data: '', hora: '', notas: '' });
  const [salvando, setSalvando] = useState(false);

  const prof = user?.profissional || {};
  const isPsicologo = prof.tipo === 'psicologo';
  const headers = { Authorization: `Bearer ${token}` };

  const carregar = useCallback(async () => {
    try {
      const [resClientes, resPendentes] = await Promise.all([
        fetch(`${API}/api/profissional/meus-clientes`, { headers }),
        fetch(`${API}/api/profissional/vinculos/pendentes`, { headers }),
      ]);
      const dc = await resClientes.json();
      const dp = await resPendentes.json();
      if (dc.success) setClientes(dc.clientes);
      if (dp.success) setPendentes(dp.pendentes);

      if (isPsicologo) {
        const rc = await fetch(`${API}/api/consultas`, { headers });
        const drc = await rc.json();
        if (drc.success) setConsultas(drc.consultas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isPsicologo]);

  useEffect(() => { carregar(); }, [carregar]);

  const responder = async (id, acao) => {
    await fetch(`${API}/api/profissional/vinculos/${id}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao }),
    });
    carregar();
  };

  const abrirWhatsApp = (cliente) => {
    const numero = cliente.contato?.replace(/\D/g, '');
    if (!numero) return alert('Cliente não tem WhatsApp cadastrado.');
    window.open(`https://wa.me/55${numero}`, '_blank');
  };

  const criarConsulta = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await fetch(`${API}/api/consultas`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(novaConsulta),
      });
      const data = await res.json();
      if (data.success) {
        setNovaConsulta({ clienteId: '', data: '', hora: '', notas: '' });
        carregar();
      } else {
        alert(data.message);
      }
    } finally {
      setSalvando(false);
    }
  };

  const atualizarStatusConsulta = async (id, status) => {
    await fetch(`${API}/api/consultas/${id}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    carregar();
  };

  const deletarConsulta = async (id) => {
    if (!window.confirm('Remover esta consulta?')) return;
    await fetch(`${API}/api/consultas/${id}`, { method: 'DELETE', headers });
    carregar();
  };

  const formatarData = (date) => date ? new Date(date).toLocaleDateString('pt-BR') : '—';

  const abas = [
    { id: 'clientes', label: 'Meus Clientes' },
    { id: 'pendentes', label: `Solicitações (${pendentes.length})` },
    ...(isPsicologo ? [{ id: 'agenda', label: 'Agenda' }] : []),
  ];

  return (
    <>
      <Navbar />
      <div className="dash-prof-container">
        {/* Header */}
        <div className="dash-prof-header">
          <h1>Olá, {user?.nome}!</h1>
          <p>{tipoLabel[prof.tipo] || 'Profissional'}</p>
          <span className="badge-status badge-ativo">Ativo</span>
        </div>

        {/* Abas */}
        <div className="prof-abas">
          {abas.map(a => (
            <button
              key={a.id}
              className={`prof-aba-btn ${abaAtiva === a.id ? 'ativa' : ''}`}
              onClick={() => setAbaAtiva(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">Carregando...</div>
        ) : (
          <>
            {/* ── Clientes ── */}
            {abaAtiva === 'clientes' && (
              <div className="dash-prof-section">
                {clientes.length === 0 ? (
                  <p className="empty-state">Você ainda não tem clientes vinculados.</p>
                ) : (
                  clientes.map(c => (
                    <div key={c._id} className="cliente-card">
                      <div className="cliente-card-info">
                        <h3>{c.nome}</h3>
                        <p>
                          {c.peso ? `${c.peso}kg` : ''}
                          {c.altura ? ` · ${c.altura}cm` : ''}
                          {c.frequencia !== undefined ? ` · ${c.frequencia}x/sem` : ''}
                        </p>
                        <p>Último acesso: {formatarData(c.lastLogin)}</p>
                      </div>
                      <div className="cliente-card-acoes">
                        {prof.tipo !== 'psicologo' && (
                          <button
                            className="btn-montar-treino"
                            onClick={() => navigate(`/treino-manual?cliente=${c._id}&clienteNome=${encodeURIComponent(c.nome)}`)}
                          >
                            Montar Treino
                          </button>
                        )}
                        {c.contato && (
                          <button className="btn-whats-cliente" onClick={() => abrirWhatsApp(c)}>
                            WhatsApp
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Solicitações pendentes ── */}
            {abaAtiva === 'pendentes' && (
              <div className="dash-prof-section">
                {pendentes.length === 0 ? (
                  <p className="empty-state">Nenhuma solicitação pendente.</p>
                ) : (
                  pendentes.map(v => (
                    <div key={v._id} className="solicitacao-card">
                      <div className="cliente-card-info">
                        <h3>{v.cliente?.nome}</h3>
                        <p>{v.cliente?.email}</p>
                        <p>
                          {v.cliente?.peso ? `${v.cliente.peso}kg` : ''}
                          {v.cliente?.altura ? ` · ${v.cliente.altura}cm` : ''}
                        </p>
                      </div>
                      <div className="solicitacao-acoes">
                        <button className="btn-aceitar" onClick={() => responder(v._id, 'aceitar')}>Aceitar</button>
                        <button className="btn-recusar" onClick={() => responder(v._id, 'recusar')}>Recusar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Agenda (apenas psicólogo) ── */}
            {abaAtiva === 'agenda' && isPsicologo && (
              <div className="dash-prof-section">
                {/* Formulário nova consulta */}
                <div className="agenda-form-card">
                  <h3>Nova Consulta</h3>
                  <form onSubmit={criarConsulta} className="agenda-form">
                    <select
                      value={novaConsulta.clienteId}
                      onChange={e => setNovaConsulta(p => ({ ...p, clienteId: e.target.value }))}
                      required
                    >
                      <option value="">Selecionar cliente...</option>
                      {clientes.map(c => (
                        <option key={c._id} value={c._id}>{c.nome}</option>
                      ))}
                    </select>

                    <div className="agenda-form-row">
                      <input
                        type="date"
                        value={novaConsulta.data}
                        onChange={e => setNovaConsulta(p => ({ ...p, data: e.target.value }))}
                        required
                      />
                      <input
                        type="time"
                        value={novaConsulta.hora}
                        onChange={e => setNovaConsulta(p => ({ ...p, hora: e.target.value }))}
                        required
                      />
                    </div>

                    <textarea
                      placeholder="Observações (opcional)"
                      value={novaConsulta.notas}
                      onChange={e => setNovaConsulta(p => ({ ...p, notas: e.target.value }))}
                      rows={2}
                    />

                    <button type="submit" className="btn-aceitar" disabled={salvando}>
                      {salvando ? 'Salvando...' : 'Agendar consulta'}
                    </button>
                  </form>
                </div>

                {/* Lista de consultas */}
                <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1rem', color: '#1a1a2e' }}>
                  Próximas consultas
                </h3>

                {consultas.length === 0 ? (
                  <p className="empty-state">Nenhuma consulta agendada.</p>
                ) : (
                  consultas.map(c => (
                    <div key={c._id} className={`consulta-card status-${c.status}`}>
                      <div className="consulta-info">
                        <strong>{c.cliente?.nome}</strong>
                        <span>{formatarData(c.data)} às {c.hora}</span>
                        {c.notas && <span className="consulta-notas">{c.notas}</span>}
                      </div>
                      <div className="consulta-acoes">
                        {c.status === 'agendada' && (
                          <>
                            <button className="btn-aceitar" onClick={() => atualizarStatusConsulta(c._id, 'realizada')}>
                              Realizada
                            </button>
                            <button className="btn-recusar" onClick={() => atualizarStatusConsulta(c._id, 'cancelada')}>
                              Cancelar
                            </button>
                          </>
                        )}
                        {c.status !== 'agendada' && (
                          <span className={`badge-consulta ${c.status}`}>{c.status}</span>
                        )}
                        <button className="btn-deletar" onClick={() => deletarConsulta(c._id)}>✕</button>
                        {c.cliente?.contato && (
                          <button className="btn-whats-cliente" onClick={() => abrirWhatsApp(c.cliente)}>
                            WhatsApp
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default DashboardProfissional;
