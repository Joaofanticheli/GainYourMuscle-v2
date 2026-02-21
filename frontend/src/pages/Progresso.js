// ============================================================================
// PÁGINA PROGRESSO - Registrar e visualizar evolução
// ============================================================================

import React, { useState, useEffect } from 'react';
import { userAPI, workoutAPI } from '../services/api';
import Navbar from '../components/Navbar';
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

const Progresso = () => {
  const [historico, setHistorico] = useState([]);
  const [historicoTreinos, setHistoricoTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [diaDoprojeto, setDiaDoprojeto] = useState(null);
  const [ocultarDados, setOcultarDados] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // id do registro a deletar

  const [formData, setFormData] = useState({
    peso: '',
    notas: '',
    medidas: {
      braco: '',
      peito: '',
      cintura: '',
      quadril: '',
      coxa: ''
    }
  });

  useEffect(() => {
    carregarDados();
  }, []);

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
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
        setDiaDoprojeto(diffDias);
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
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMedida = (e) => {
    setFormData({
      ...formData,
      medidas: { ...formData.medidas, [e.target.name]: e.target.value }
    });
  };

  const handleDelete = async (id) => {
    try {
      await userAPI.deleteProgress(id);
      setHistorico(prev => prev.filter(r => r._id !== id));
      setConfirmDelete(null);
    } catch (err) {
      setError('Erro ao remover registro.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSucesso('');
    setError('');

    // Não salva registro completamente vazio
    const temAlgumDado = formData.peso || formData.notas ||
      Object.values(formData.medidas).some(v => v);
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
      setFormData({
        peso: '', notas: '',
        medidas: { braco: '', peito: '', cintura: '', quadril: '', coxa: '' }
      });
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
    return historicoTreinos.find(t => {
      const diff = Math.abs(t.data - dataRef);
      return diff < 24 * 60 * 60 * 1000;
    });
  };

  // Máscara de privacidade
  const mascarar = (valor, sufixo = '') =>
    ocultarDados ? '•••' : (valor ? `${valor}${sufixo}` : null);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="progresso-container">
          <div className="loading">Carregando histórico...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="progresso-container">
        <header className="progresso-header">
          <div>
            <h1>Meu Progresso</h1>
            {diaDoprojeto !== null && (
              <div className="dia-projeto">Dia {diaDoprojeto} do projeto</div>
            )}
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

        {/* Formulário de registro */}
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
                    placeholder="Olá, eu do futuro! Hoje estou começando minha jornada. Peso X kg e ainda não vejo muito resultado — mas estou aqui, dando o primeiro passo. Não desista de mim!"
                    rows="4"
                    disabled={salvando}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : '💾 Salvar Registro'}
              </button>
            </form>
          </div>
        )}

        {/* Histórico */}
        {historico.length === 0 ? (
          <div className="card empty-state">
            <h2>Nenhum registro ainda</h2>
            <p>Clique em "Registrar Hoje" para começar a acompanhar seu progresso!</p>
          </div>
        ) : (
          <div className="historico-lista">
            <div className="historico-titulo-row">
              <h2>Histórico</h2>
              <button
                className="btn-ocultar"
                onClick={() => setOcultarDados(!ocultarDados)}
                title={ocultarDados ? 'Mostrar dados' : 'Ocultar dados'}
              >
                <EyeIcon visivel={!ocultarDados} />
                {ocultarDados ? 'Mostrar' : 'Ocultar'}
              </button>
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
                        <span className={`registro-peso ${ocultarDados ? 'dado-oculto' : ''}`}>
                          {mascarar(registro.peso, ' kg')}
                        </span>
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
                      {registro.medidas.braco   && <span>Braço: <strong className={ocultarDados ? 'dado-oculto' : ''}>{mascarar(registro.medidas.braco, 'cm')}</strong></span>}
                      {registro.medidas.peito   && <span>Peito: <strong className={ocultarDados ? 'dado-oculto' : ''}>{mascarar(registro.medidas.peito, 'cm')}</strong></span>}
                      {registro.medidas.cintura && <span>Cintura: <strong className={ocultarDados ? 'dado-oculto' : ''}>{mascarar(registro.medidas.cintura, 'cm')}</strong></span>}
                      {registro.medidas.quadril && <span>Quadril: <strong className={ocultarDados ? 'dado-oculto' : ''}>{mascarar(registro.medidas.quadril, 'cm')}</strong></span>}
                      {registro.medidas.coxa    && <span>Coxa: <strong className={ocultarDados ? 'dado-oculto' : ''}>{mascarar(registro.medidas.coxa, 'cm')}</strong></span>}
                    </div>
                  )}

                  {treinoFeito && (
                    <div className="registro-treino-feito">
                      ✅ Treino concluído: <strong>{treinoFeito.nomeTreino}</strong>
                      {treinoFeito.notas && <span className="registro-treino-notas"> — {treinoFeito.notas}</span>}
                    </div>
                  )}

                  {registro.notas && (
                    <p className="registro-notas">"{registro.notas}"</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progresso;
