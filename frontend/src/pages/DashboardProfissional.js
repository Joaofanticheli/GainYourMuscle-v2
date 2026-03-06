import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/Profissional.css';
import '../styles/DashboardProf.css';
import '../styles/Anamnese.css';

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
  const [fichaAberta, setFichaAberta] = useState(null);
  const [treinosAberto, setTreinosAberto] = useState(null); // clienteId
  const [treinosCliente, setTreinosCliente] = useState({});
  const [loadingTreinos, setLoadingTreinos] = useState(false);
  const [desvinculando, setDesvinculando] = useState(null);
  const [modalTransferir, setModalTransferir] = useState(null); // workoutId
  const [destinoTransferir, setDestinoTransferir] = useState('');

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

  const carregarTreinos = async (clienteId) => {
    if (treinosCliente[clienteId]) return; // já carregado
    setLoadingTreinos(true);
    try {
      const res = await fetch(`${API}/api/workout/cliente/${clienteId}`, { headers });
      const data = await res.json();
      if (data.success) {
        setTreinosCliente(prev => ({ ...prev, [clienteId]: data.workouts }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTreinos(false);
    }
  };

  const toggleTreinos = (clienteId) => {
    if (treinosAberto === clienteId) {
      setTreinosAberto(null);
    } else {
      setTreinosAberto(clienteId);
      carregarTreinos(clienteId);
    }
  };

  const recarregarTreinos = async (clienteId) => {
    setTreinosCliente(prev => { const n = { ...prev }; delete n[clienteId]; return n; });
    setLoadingTreinos(true);
    try {
      const res = await fetch(`${API}/api/workout/cliente/${clienteId}`, { headers });
      const data = await res.json();
      if (data.success) setTreinosCliente(prev => ({ ...prev, [clienteId]: data.workouts }));
    } finally {
      setLoadingTreinos(false);
    }
  };

  const arquivarTreino = async (workoutId, clienteId) => {
    await fetch(`${API}/api/workout/${workoutId}/arquivar`, { method: 'PUT', headers });
    recarregarTreinos(clienteId);
  };

  const deletarTreino = async (workoutId, clienteId) => {
    if (!window.confirm('Excluir este treino permanentemente?')) return;
    await fetch(`${API}/api/workout/${workoutId}`, { method: 'DELETE', headers });
    recarregarTreinos(clienteId);
  };

  const copiarTreino = async (workoutId, clienteId) => {
    await fetch(`${API}/api/workout/${workoutId}/copiar`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    recarregarTreinos(clienteId);
  };

  const transferirTreino = async () => {
    if (!destinoTransferir) return;
    await fetch(`${API}/api/workout/${modalTransferir}/copiar`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinoId: destinoTransferir })
    });
    setModalTransferir(null);
    setDestinoTransferir('');
    alert('Treino copiado para o aluno!');
  };

  const responder = async (id, acao) => {
    await fetch(`${API}/api/profissional/vinculos/${id}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao }),
    });
    carregar();
  };

  const desvincularAluno = async (cliente) => {
    if (!window.confirm(`Desvincular ${cliente.nome}?`)) return;
    setDesvinculando(cliente._id);
    try {
      const res = await fetch(`${API}/api/profissional/vinculos/${cliente.vinculoId}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.success) carregar();
      else alert(data.message || 'Erro ao desvincular.');
    } catch { alert('Erro de conexão.'); }
    finally { setDesvinculando(null); }
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
      if (data.success) { setNovaConsulta({ clienteId: '', data: '', hora: '', notas: '' }); carregar(); }
      else alert(data.message);
    } finally { setSalvando(false); }
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

  const PARQ_PERGUNTAS_CURTAS = [
    'Problema cardíaco com supervisão médica?','Dor no peito ao praticar exercício?',
    'Dor no peito em repouso (último mês)?','Tontura ou perda de consciência?',
    'Problema ósseo/articular que piora com exercício?','Remédio para pressão ou coração?',
    'Outra razão para não praticar exercício?',
  ];

  const LABELS = {
    objetivo: { hipertrofia: 'Ganhar Músculo', emagrecimento: 'Emagrecer', forca: 'Ganhar Força', condicionamento: 'Condicionamento', saude_geral: 'Saúde Geral', esporte: 'Esporte Específico' },
    duracao:  { curto: '45 minutos', normal: '1 hora', longo: '2 horas' },
    ambiente: { casa: 'Em casa', pequena: 'Academia pequena', grande: 'Academia grande' },
    fadiga:   { evito: 'Moderado', consigo: 'Intenso mas controlado', nao: 'Máximo esforço' },
    disciplina: { frequentemente: 'Falta com frequência', intermediario: 'Falta às vezes', raramente: 'Muito consistente' },
    muscular: { atrapalharia: 'Baixa tolerância', pouco: 'Tolerância média', nao: 'Alta tolerância' },
    lesao:    { nenhuma: 'Nenhuma', leve: 'Leve (dor ocasional)', pequena: 'Lesão diagnosticada' },
    testeFlexoes: { '0a10': '0–10 rep','11a20':'11–20 rep','21a30':'21–30 rep','31a40':'31–40 rep','41mais':'41+ rep' },
    testeAgachamentos: { '0a15':'0–15 rep','16a25':'16–25 rep','26a35':'26–35 rep','36a50':'36–50 rep','51mais':'51+ rep' },
    testePrancha: { 'menos30s':'<30s','30a60s':'30–60s','1a2min':'1–2 min','mais2min':'>2 min' },
    testeCardio: { 'menos5min':'<5 min','5a15min':'5–15 min','15a30min':'15–30 min','mais30min':'>30 min' },
  };
  const label = (tipo, valor) => LABELS[tipo]?.[valor] || valor || '—';

  const renderFicha = (anamnese) => {
    if (!anamnese) return <div className="ficha-aluno"><p className="ficha-vazia">Este aluno ainda não preencheu a ficha de saúde.</p></div>;
    const parqPositivos = (anamnese.parqRespostas || []).map((r, i) => ({ resp: r, pergunta: PARQ_PERGUNTAS_CURTAS[i] })).filter(p => p.resp === 'sim');
    return (
      <div className="ficha-aluno">
        {[
          ['Objetivo', label('objetivo', anamnese.objetivo)],
          ['Dias disponíveis', anamnese.diasSelecionados?.join(', ') || '—'],
          ['Duração', label('duracao', anamnese.duracao)],
          ['Ambiente', label('ambiente', anamnese.ambiente)],
          ['Intensidade', label('fadiga', anamnese.fadiga)],
          ['Consistência', label('disciplina', anamnese.disciplina)],
          ['Tolerância a DOMS', label('muscular', anamnese.muscular)],
          ['Limitação física', `${label('lesao', anamnese.lesao)}${anamnese.localLesao ? ` — ${anamnese.localLesao}` : ''}${anamnese.lesaoDescricao ? ` (${anamnese.lesaoDescricao})` : ''}`],
          ['Doença crônica', anamnese.doencaCronica === 'sim' ? anamnese.doencaDescricao || 'Sim' : 'Não'],
          ['Medicamento', anamnese.medicamento === 'sim' ? anamnese.medicamentoDescricao || 'Sim' : 'Não'],
          ['Flexões', label('testeFlexoes', anamnese.testeFlexoes)],
          ['Agachamentos', label('testeAgachamentos', anamnese.testeAgachamentos)],
          ['Prancha', label('testePrancha', anamnese.testePrancha)],
          ['Cardio', label('testeCardio', anamnese.testeCardio)],
        ].map(([k, v]) => (
          <div className="ficha-item" key={k}><span className="ficha-label">{k}</span><span className="ficha-valor">{v}</span></div>
        ))}
        {parqPositivos.length > 0 && (
          <div className="ficha-parq">
            <span className="ficha-label">⚠️ PAR-Q — Respostas SIM</span>
            <div className="ficha-parq-lista">
              {parqPositivos.map((p, i) => (
                <div key={i} className="ficha-parq-item ficha-parq-sim">• {p.pergunta}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTreinos = (clienteId) => {
    const lista = treinosCliente[clienteId];
    if (loadingTreinos && !lista) return <div className="treinos-cliente-loading">Carregando treinos...</div>;
    if (!lista) return null;
    if (lista.length === 0) return <div className="treinos-cliente-vazio">Nenhum treino cadastrado ainda.</div>;
    return (
      <div className="treinos-cliente-lista">
        {lista.map(w => (
          <div key={w._id} className={`treino-item-card ${w.arquivado ? 'arquivado' : ''}`}>
            <div className="treino-item-info">
              <span className="treino-item-nome">{w.nome}</span>
              <span className="treino-item-meta">
                {w.diasPorSemana} treino{w.diasPorSemana > 1 ? 's' : ''} · {w.tipo} · {w.nivel}
                {w.arquivado && <span className="badge-arquivado">Arquivado</span>}
              </span>
              <span className="treino-item-data">Criado em {formatarData(w.createdAt)}</span>
            </div>
            <div className="treino-item-acoes">
              <button className="btn-treino-acao btn-copiar"
                onClick={() => copiarTreino(w._id, clienteId)}
                title="Copiar treino para este aluno">⧉ Copiar</button>
              <button className="btn-treino-acao btn-transferir"
                onClick={() => { setModalTransferir(w._id); setDestinoTransferir(''); }}
                title="Copiar treino para outro aluno">↗ Transferir</button>
              <button className="btn-treino-acao btn-arquivar"
                onClick={() => arquivarTreino(w._id, clienteId)}>
                {w.arquivado ? '↩ Restaurar' : '📁 Arquivar'}
              </button>
              <button className="btn-treino-acao btn-deletar-treino"
                onClick={() => deletarTreino(w._id, clienteId)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const abas = [
    { id: 'clientes', label: 'Meus Clientes' },
    { id: 'pendentes', label: `Solicitações (${pendentes.length})` },
    ...(isPsicologo ? [{ id: 'agenda', label: 'Agenda' }] : []),
  ];

  return (
    <>
      <Navbar />
      <div className="dash-prof-container">
        <div className="dash-prof-header">
          <h1>Olá, {user?.nome}!</h1>
          <p>{tipoLabel[prof.tipo] || 'Profissional'}</p>
          <span className="badge-status badge-ativo">Ativo</span>
        </div>

        <div className="prof-abas">
          {abas.map(a => (
            <button key={a.id} className={`prof-aba-btn ${abaAtiva === a.id ? 'ativa' : ''}`} onClick={() => setAbaAtiva(a.id)}>
              {a.label}
            </button>
          ))}
        </div>

        {loading ? <div className="loading-state">Carregando...</div> : (
          <>
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
                        </p>
                        <p>Último acesso: {formatarData(c.lastLogin)}</p>
                      </div>
                      <div className="cliente-card-acoes">
                        <button className="btn-ver-ficha" onClick={() => setFichaAberta(fichaAberta === c._id ? null : c._id)}>
                          {fichaAberta === c._id ? 'Fechar Ficha' : 'Ver Ficha'}
                        </button>
                        {prof.tipo !== 'psicologo' && (
                          <>
                            <button className="btn-ver-treinos"
                              onClick={() => toggleTreinos(c._id)}>
                              {treinosAberto === c._id ? 'Fechar Treinos' : 'Ver Treinos'}
                            </button>
                            {c.anamnese ? (
                              <button className="btn-montar-treino"
                                onClick={() => navigate(`/treino-manual?cliente=${c._id}&clienteNome=${encodeURIComponent(c.nome)}`)}>
                                + Novo Treino
                              </button>
                            ) : (
                              <button className="btn-notificar-ficha"
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`${API}/api/user/notificacoes/enviar`, {
                                      method: 'POST',
                                      headers: { ...headers, 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ clienteId: c._id, mensagem: `${user?.nome} precisa que você preencha sua ficha de saúde para montar seu treino personalizado. Acesse "Minha Anamnese" no app! 💪` })
                                    });
                                    const data = await res.json();
                                    alert(data.success ? '✅ Notificação enviada ao aluno!' : data.message);
                                  } catch { alert('Erro ao enviar notificação.'); }
                                }}>
                                📋 Notificar Aluno
                              </button>
                            )}
                          </>
                        )}
                        {c.contato && (
                          <button className="btn-whats-cliente" onClick={() => abrirWhatsApp(c)}>WhatsApp</button>
                        )}
                        <button className="btn-desvincular-prof" onClick={() => desvincularAluno(c)} disabled={desvinculando === c._id}>
                          {desvinculando === c._id ? 'Removendo...' : 'Desvincular'}
                        </button>
                      </div>
                      {fichaAberta === c._id && renderFicha(c.anamnese)}
                      {treinosAberto === c._id && renderTreinos(c._id)}
                    </div>
                  ))
                )}
              </div>
            )}

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
                        <p>{v.cliente?.peso ? `${v.cliente.peso}kg` : ''}{v.cliente?.altura ? ` · ${v.cliente.altura}cm` : ''}</p>
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

            {abaAtiva === 'agenda' && isPsicologo && (
              <div className="dash-prof-section">
                <div className="agenda-form-card">
                  <h3>Nova Consulta</h3>
                  <form onSubmit={criarConsulta} className="agenda-form">
                    <select value={novaConsulta.clienteId} onChange={e => setNovaConsulta(p => ({ ...p, clienteId: e.target.value }))} required>
                      <option value="">Selecionar cliente...</option>
                      {clientes.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
                    </select>
                    <div className="agenda-form-row">
                      <input type="date" value={novaConsulta.data} onChange={e => setNovaConsulta(p => ({ ...p, data: e.target.value }))} required />
                      <input type="time" value={novaConsulta.hora} onChange={e => setNovaConsulta(p => ({ ...p, hora: e.target.value }))} required />
                    </div>
                    <textarea placeholder="Observações (opcional)" value={novaConsulta.notas}
                      onChange={e => setNovaConsulta(p => ({ ...p, notas: e.target.value }))} rows={2} />
                    <button type="submit" className="btn-aceitar" disabled={salvando}>
                      {salvando ? 'Salvando...' : 'Agendar consulta'}
                    </button>
                  </form>
                </div>
                <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1rem', color: '#1a1a2e' }}>Próximas consultas</h3>
                {consultas.length === 0 ? <p className="empty-state">Nenhuma consulta agendada.</p> : (
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
                            <button className="btn-aceitar" onClick={() => atualizarStatusConsulta(c._id, 'realizada')}>Realizada</button>
                            <button className="btn-recusar" onClick={() => atualizarStatusConsulta(c._id, 'cancelada')}>Cancelar</button>
                          </>
                        )}
                        {c.status !== 'agendada' && <span className={`badge-consulta ${c.status}`}>{c.status}</span>}
                        <button className="btn-deletar" onClick={() => deletarConsulta(c._id)}>✕</button>
                        {c.cliente?.contato && <button className="btn-whats-cliente" onClick={() => abrirWhatsApp(c.cliente)}>WhatsApp</button>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Transferir Treino */}
      {modalTransferir && (
        <div className="modal-overlay" onClick={() => setModalTransferir(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Transferir treino para outro aluno</h3>
            <p>Selecione o aluno que receberá uma cópia deste treino:</p>
            <select value={destinoTransferir} onChange={e => setDestinoTransferir(e.target.value)}>
              <option value="">Selecionar aluno...</option>
              {clientes.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
            </select>
            <div className="modal-acoes">
              <button className="btn-aceitar" onClick={transferirTreino} disabled={!destinoTransferir}>Copiar Treino</button>
              <button className="btn-recusar" onClick={() => setModalTransferir(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardProfissional;
