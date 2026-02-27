// ============================================================================
// PÁGINA PERFIL + PROGRESSO - Dados do usuário e evolução (abas)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, workoutAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Perfil.css';
import '../styles/Progresso.css';

const EyeIcon = ({ visivel }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const ImcDisplay = ({ peso, altura, oculto }) => {
  if (!peso || !altura) return <p>Dados insuficientes para calcular o IMC.</p>;

  if (oculto) {
    return (
      <div className="imc-display">
        <div className="imc-valor dado-oculto" style={{ color: 'var(--muted)' }}>•••</div>
        <div className="imc-categoria dado-oculto" style={{ color: 'var(--muted)' }}>oculto</div>
        <p className="imc-info">O IMC é apenas uma referência. Massa muscular não é gordura!</p>
      </div>
    );
  }

  const alturaM = altura / 100;
  const imc = (peso / (alturaM * alturaM)).toFixed(1);

  let categoria = '';
  let cor = '';

  if (imc < 18.5)    { categoria = 'Abaixo do peso'; cor = '#3498db'; }
  else if (imc < 25) { categoria = 'Peso normal';    cor = '#27ae60'; }
  else if (imc < 30) { categoria = 'Sobrepeso';      cor = '#f39c12'; }
  else               { categoria = 'Obesidade';      cor = '#e74c3c'; }

  return (
    <div className="imc-display">
      <div className="imc-valor" style={{ color: cor }}>{imc}</div>
      <div className="imc-categoria" style={{ color: cor }}>{categoria}</div>
      <p className="imc-info">
        O IMC é apenas uma referência. Massa muscular não é gordura!
        Foque no seu bem-estar e desempenho.
      </p>
    </div>
  );
};

const tipoLabelMap = { personal: 'Personal Trainer', nutricionista: 'Nutricionista', psicologo: 'Psicólogo' };

// ── Aba Perfil ──────────────────────────────────────────────────────────────
const PerfilConteudo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isProfissional = user?.role === 'profissional';

  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [error, setError] = useState('');
  const [ocultarPeso, setOcultarPeso] = useState(true);

  const [formData, setFormData] = useState(
    isProfissional
      ? { nome: user?.nome || '', bio: user?.profissional?.bio || '', contato: user?.contato || '' }
      : {
          nome: user?.nome || '',
          dataNascimento: user?.dataNascimento ? new Date(user.dataNascimento).toISOString().split('T')[0] : '',
          peso: user?.peso || '',
          altura: user?.altura || '',
          frequencia: user?.frequencia || 0
        }
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSucesso('');
    setLoading(true);
    try {
      await userAPI.updateProfile(formData);
      setSucesso('Perfil atualizado com sucesso!');
      setEditando(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const cancelar = () => {
    setFormData(
      isProfissional
        ? { nome: user?.nome || '', bio: user?.profissional?.bio || '', contato: user?.contato || '' }
        : {
            nome: user?.nome || '',
            dataNascimento: user?.dataNascimento ? new Date(user.dataNascimento).toISOString().split('T')[0] : '',
            peso: user?.peso || '',
            altura: user?.altura || '',
            frequencia: user?.frequencia || 0
          }
    );
    setEditando(false);
    setError('');
  };

  return (
    <div className="perfil-container">
      <header className="perfil-header">
        <h1>Meu Perfil</h1>
        <p>{isProfissional ? 'Seus dados profissionais' : 'Suas informações pessoais e físicas'}</p>
      </header>

      {sucesso && <div className="alert alert-success">{sucesso}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="perfil-grid">
        {/* Card de identificação */}
        <div className="card perfil-card">
          <div className="perfil-avatar">
            <span>{user?.nome?.charAt(0).toUpperCase()}</span>
          </div>
          <h2>{user?.nome}</h2>
          <p className="perfil-email">{user?.email}</p>
          {isProfissional && (
            <p className="perfil-email" style={{ color: '#a78bfa', fontWeight: 600 }}>
              {tipoLabelMap[user?.profissional?.tipo] || 'Profissional'}
            </p>
          )}
          <p className="perfil-membro">
            Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '—'}
          </p>
        </div>

        {/* Formulário de dados */}
        <div className="card">
          <div className="perfil-form-header">
            <h2>{isProfissional ? 'Dados Profissionais' : 'Dados Pessoais'}</h2>
            <div className="perfil-form-actions">
              {!editando && (
                <button className="btn btn-outline btn-sm" onClick={() => setEditando(true)}>
                  Editar
                </button>
              )}
            </div>
          </div>

          {!editando ? (
            <div className="perfil-dados">
              <div className="dado-item">
                <span className="dado-label">Nome</span>
                <span className="dado-valor">{user?.nome}</span>
              </div>
              <div className="dado-item">
                <span className="dado-label">Email</span>
                <span className="dado-valor">{user?.email}</span>
              </div>

              {isProfissional ? (
                <>
                  <div className="dado-item">
                    <span className="dado-label">Tipo</span>
                    <span className="dado-valor">{tipoLabelMap[user?.profissional?.tipo] || '—'}</span>
                  </div>
                  <div className="dado-item">
                    <span className="dado-label">Registro</span>
                    <span className="dado-valor">{user?.profissional?.registro || '—'}</span>
                  </div>
                  <div className="dado-item">
                    <span className="dado-label">Bio</span>
                    <span className="dado-valor" style={{ textAlign: 'right', maxWidth: '60%' }}>
                      {user?.profissional?.bio || '—'}
                    </span>
                  </div>
                  <div className="dado-item">
                    <span className="dado-label">WhatsApp / Telefone</span>
                    <span className="dado-valor">{user?.contato || '—'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="dado-item">
                    <span className="dado-label">Data de Nascimento</span>
                    <span className="dado-valor">
                      {user?.dataNascimento
                        ? new Date(user.dataNascimento).toLocaleDateString('pt-BR')
                        : user?.idade ? `${user.idade} anos` : '—'}
                    </span>
                  </div>
                  <div className="dado-item">
                    <span className="dado-label">Sexo</span>
                    <span className="dado-valor" style={{ textTransform: 'capitalize' }}>{user?.sexo}</span>
                  </div>
                  <div className="dado-item">
                    <span className="dado-label">Peso</span>
                    <div className="dado-peso-wrap">
                      <button
                        className="btn-peso-olho"
                        onClick={() => setOcultarPeso(!ocultarPeso)}
                        title={ocultarPeso ? 'Mostrar peso' : 'Ocultar peso'}
                      >
                        <EyeIcon visivel={!ocultarPeso} />
                      </button>
                      <span className={`dado-valor ${ocultarPeso ? 'dado-oculto' : ''}`}>
                        {ocultarPeso ? '•••' : `${user?.peso} kg`}
                      </span>
                    </div>
                  </div>
                  <div className="dado-item">
                    <span className="dado-label">Altura</span>
                    <span className="dado-valor">{user?.altura} cm</span>
                  </div>
                  <div className="dado-item">
                    <span className="dado-label">Ficha de Saúde</span>
                    <span className="dado-valor">
                      {user?.anamnese ? (
                        <button className="btn btn-outline btn-sm" onClick={() => navigate('/minha-anamnese')}>
                          Atualizar Ficha
                        </button>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/minha-anamnese')}>
                          Preencher Ficha
                        </button>
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <form className="perfil-edit-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {isProfissional ? (
                <>
                  <div className="form-group">
                    <label>Bio / Apresentação</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={3}
                      disabled={loading}
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp / Telefone</label>
                    <input
                      type="tel"
                      name="contato"
                      value={formData.contato}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      disabled={loading}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Data de Nascimento</label>
                      <input
                        type="date"
                        name="dataNascimento"
                        value={formData.dataNascimento}
                        onChange={handleChange}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Frequência (dias/semana)</label>
                      <input
                        type="number"
                        name="frequencia"
                        value={formData.frequencia}
                        onChange={handleChange}
                        min="0" max="7"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Peso (kg)</label>
                      <input
                        type="number"
                        name="peso"
                        value={formData.peso}
                        onChange={handleChange}
                        min="30" max="300"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Altura (cm)</label>
                      <input
                        type="number"
                        name="altura"
                        value={formData.altura}
                        onChange={handleChange}
                        min="100" max="250"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="perfil-edit-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : '✅ Salvar'}
                </button>
                <button type="button" className="btn btn-outline" onClick={cancelar} disabled={loading}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* IMC calculado — apenas para usuários comuns */}
      {!isProfissional && (
        <div className="card imc-card">
          <h2>Seu IMC</h2>
          <ImcDisplay peso={user?.peso} altura={user?.altura} oculto={ocultarPeso} />
        </div>
      )}
    </div>
  );
};

// ── Aba Progresso ────────────────────────────────────────────────────────────
const ProgressoConteudo = () => {
  const [historico, setHistorico] = useState([]);
  const [historicoTreinos, setHistoricoTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [diaDoprojeto, setDiaDoprojeto] = useState(null);
  const [ocultarPeso, setOcultarPeso] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [formData, setFormData] = useState({
    peso: '',
    notas: '',
    medidas: { braco: '', peito: '', cintura: '', quadril: '', coxa: '' }
  });

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const [progressoRes, workoutRes, historicoTreinoRes] = await Promise.allSettled([
        userAPI.getProgress(),
        workoutAPI.getCurrent(),
        workoutAPI.getHistory()
      ]);

      if (progressoRes.status === 'fulfilled') {
        setHistorico(progressoRes.value.data.progresso || []);
      }

      if (workoutRes.status === 'fulfilled' && workoutRes.value.data.workout) {
        const workout = workoutRes.value.data.workout;
        const inicio = new Date(workout.createdAt || workout.dataInicio);
        const hoje = new Date();
        const diffMs = hoje - inicio;
        setDiaDoprojeto(Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);
      }

      if (historicoTreinoRes.status === 'fulfilled') {
        const workouts = historicoTreinoRes.value.data.workouts || [];
        const checkins = [];
        workouts.forEach(w => {
          if (w.historico && w.historico.length > 0) {
            w.historico.forEach(h => {
              checkins.push({
                data: new Date(h.data),
                notas: h.feedback?.notas || '',
                nomeTreino: w.nome
              });
            });
          }
        });
        setHistoricoTreinos(checkins);
      }
    } catch (err) {
      console.error('Erro ao carregar progresso:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMedida = (e) => {
    setFormData({ ...formData, medidas: { ...formData.medidas, [e.target.name]: e.target.value } });
  };

  const handleDelete = async (id) => {
    try {
      await userAPI.deleteProgress(id);
      setHistorico(prev => prev.filter(r => r._id !== id));
      setConfirmDelete(null);
    } catch {
      setError('Erro ao remover registro.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSucesso('');
    setError('');

    const temAlgumDado = formData.peso || formData.notas || Object.values(formData.medidas).some(v => v);
    if (!temAlgumDado) {
      setError('Adicione pelo menos peso, uma medida ou observação antes de salvar.');
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        peso: formData.peso ? Number(formData.peso) : undefined,
        notas: formData.notas,
        medidas: {
          braco:   formData.medidas.braco   ? Number(formData.medidas.braco)   : undefined,
          peito:   formData.medidas.peito   ? Number(formData.medidas.peito)   : undefined,
          cintura: formData.medidas.cintura ? Number(formData.medidas.cintura) : undefined,
          quadril: formData.medidas.quadril ? Number(formData.medidas.quadril) : undefined,
          coxa:    formData.medidas.coxa    ? Number(formData.medidas.coxa)    : undefined
        }
      };
      await userAPI.addProgress(payload);
      setSucesso('Progresso registrado! Continue assim! 💪');
      setFormData({ peso: '', notas: '', medidas: { braco: '', peito: '', cintura: '', quadril: '', coxa: '' } });
      setMostrarForm(false);
      carregarDados();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar progresso.');
    } finally {
      setSalvando(false);
    }
  };

  const treinoDodia = (data) => {
    const dataRef = new Date(data);
    return historicoTreinos.find(t => Math.abs(t.data - dataRef) < 24 * 60 * 60 * 1000);
  };

  if (loading) {
    return <div className="progresso-container"><div className="loading">Carregando histórico...</div></div>;
  }

  return (
    <div className="progresso-container">
      <header className="progresso-header">
        <div>
          <h1>Meu Progresso</h1>
          {diaDoprojeto !== null && <div className="dia-projeto">Dia {diaDoprojeto} do projeto</div>}
          <p>Registre peso e medidas para acompanhar sua evolução</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setMostrarForm(!mostrarForm); setSucesso(''); setError(''); }}
        >
          {mostrarForm ? 'Cancelar' : '+ Registrar Hoje'}
        </button>
      </header>

      {sucesso && <div className="alert alert-success">{sucesso}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {mostrarForm && (
        <div className="card progresso-form-card">
          <h2>Novo Registro</h2>
          <form onSubmit={handleSubmit} className="progresso-form">
            <div className="form-section">
              <h3>Peso</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Peso atual (kg)</label>
                  <input
                    type="number"
                    name="peso"
                    value={formData.peso}
                    onChange={handleChange}
                    placeholder="Ex: 75.5"
                    step="0.1"
                    min="30" max="300"
                    disabled={salvando}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Medidas (cm) — opcional</h3>
              <div className="medidas-grid">
                {[
                  { name: 'braco',   label: 'Braço' },
                  { name: 'peito',   label: 'Peito' },
                  { name: 'cintura', label: 'Cintura' },
                  { name: 'quadril', label: 'Quadril' },
                  { name: 'coxa',    label: 'Coxa' }
                ].map(({ name, label }) => (
                  <div className="form-group" key={name}>
                    <label className="medida-label">{label}</label>
                    <input
                      type="number"
                      name={name}
                      value={formData.medidas[name]}
                      onChange={handleMedida}
                      placeholder="cm"
                      step="0.5"
                      min="10" max="200"
                      disabled={salvando}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3>Observações</h3>
              <div className="form-group">
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  placeholder="Olá, eu do futuro! Hoje estou começando minha jornada..."
                  rows="4"
                  disabled={salvando}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={salvando}>
              {salvando ? 'Salvando...' : '💾 Salvar Registro'}
            </button>
          </form>
        </div>
      )}

      {historico.length === 0 ? (
        <div className="card empty-state">
          <h2>Nenhum registro ainda</h2>
          <p>Clique em "Registrar Hoje" para começar a acompanhar seu progresso!</p>
        </div>
      ) : (
        <div className="historico-lista">
          <div className="historico-titulo-row">
            <h2>Histórico</h2>
          </div>

          {historico.map((registro, index) => {
            const treinoFeito = treinoDodia(registro.data);
            const isConfirmando = confirmDelete === registro._id;
            return (
              <div className="card registro-card" key={registro._id || index}>
                <div className="registro-header">
                  <span className="registro-data">
                    {new Date(registro.data).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </span>
                  <div className="registro-header-right">
                    {registro.peso && (
                      <div className="peso-registro-wrap">
                        <button
                          className="btn-peso-olho"
                          onClick={() => setOcultarPeso(!ocultarPeso)}
                          title={ocultarPeso ? 'Mostrar peso' : 'Ocultar peso'}
                        >
                          <EyeIcon visivel={!ocultarPeso} />
                        </button>
                        <span className="registro-peso">
                          {ocultarPeso ? '•••' : `${registro.peso} kg`}
                        </span>
                      </div>
                    )}
                    {!isConfirmando ? (
                      <button
                        className="btn-delete-registro"
                        onClick={() => setConfirmDelete(registro._id)}
                        title="Remover registro"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/>
                          <path d="M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    ) : (
                      <div className="registro-confirm-delete">
                        <span>Remover?</span>
                        <button className="btn-confirm-sim" onClick={() => handleDelete(registro._id)}>Sim</button>
                        <button className="btn-confirm-nao" onClick={() => setConfirmDelete(null)}>Não</button>
                      </div>
                    )}
                  </div>
                </div>

                {registro.medidas && Object.values(registro.medidas).some(v => v) && (
                  <div className="registro-medidas">
                    {registro.medidas.braco   && <span>Braço: <strong>{registro.medidas.braco}cm</strong></span>}
                    {registro.medidas.peito   && <span>Peito: <strong>{registro.medidas.peito}cm</strong></span>}
                    {registro.medidas.cintura && <span>Cintura: <strong>{registro.medidas.cintura}cm</strong></span>}
                    {registro.medidas.quadril && <span>Quadril: <strong>{registro.medidas.quadril}cm</strong></span>}
                    {registro.medidas.coxa    && <span>Coxa: <strong>{registro.medidas.coxa}cm</strong></span>}
                  </div>
                )}

                {treinoFeito && (
                  <div className="registro-treino-feito">
                    ✅ Treino concluído: <strong>{treinoFeito.nomeTreino}</strong>
                    {treinoFeito.notas && <span className="registro-treino-notas"> — {treinoFeito.notas}</span>}
                  </div>
                )}

                {registro.notas && <p className="registro-notas">"{registro.notas}"</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Componente principal com abas ─────────────────────────────────────────────
const Perfil = () => {
  const { user } = useAuth();
  const isProfissional = user?.role === 'profissional';
  const [abaAtiva, setAbaAtiva] = useState('perfil');

  return (
    <div>
      <Navbar />

      {/* Aba Progresso só aparece para usuários comuns */}
      {!isProfissional && (
        <div className="perfil-abas-nav">
          <button
            className={`perfil-aba-btn ${abaAtiva === 'perfil' ? 'ativa' : ''}`}
            onClick={() => setAbaAtiva('perfil')}
          >
            Perfil
          </button>
          <button
            className={`perfil-aba-btn ${abaAtiva === 'progresso' ? 'ativa' : ''}`}
            onClick={() => setAbaAtiva('progresso')}
          >
            Progresso
          </button>
        </div>
      )}

      {abaAtiva === 'perfil' || isProfissional
        ? <PerfilConteudo />
        : <ProgressoConteudo />}
    </div>
  );
};

export default Perfil;
