// ============================================================================
// PÁGINA VISUALIZAR TREINO - Duas abas: Treino de Hoje / Meu Plano
// ============================================================================

import React, { useState, useEffect } from 'react';
import { workoutAPI, extrasAPI } from '../services/api';
import Navbar from '../components/Navbar';
import WorkoutGenerator from './WorkoutGenerator';
import ProfissionalGate from '../components/ProfissionalGate';
import '../styles/WorkoutView.css';

// ── Modal de GIF de exercício ─────────────────────────────────────────────────
const GifModal = ({ exercicio, onClose }) => {
  const [gifUrl, setGifUrl] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    extrasAPI.getGif(exercicio.nome)
      .then(r => setGifUrl(r.data.gifUrl || null))
      .catch(() => setGifUrl(null))
      .finally(() => setCarregando(false));
  }, [exercicio.nome]);

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal" onClick={e => e.stopPropagation()}>
        <div className="video-modal-header">
          <h3>{exercicio.nome}</h3>
          <button className="video-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="video-modal-body">
          {carregando ? (
            <div className="video-loading">Buscando demonstração...</div>
          ) : gifUrl ? (
            <img
              src={gifUrl}
              alt={`Demonstração: ${exercicio.nome}`}
              className="exercise-gif"
            />
          ) : (
            <div className="video-not-found">
              <p>GIF não encontrado automaticamente.</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercicio.nome + ' execução correta')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  Ver no YouTube
                </a>
                <a
                  href={`https://giphy.com/search/${encodeURIComponent(exercicio.nome + ' exercise')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  Ver no Giphy
                </a>
              </div>
            </div>
          )}
        </div>
        {exercicio.educacao && (
          <div className="video-educacao">
            {exercicio.educacao.musculosAtivados && (
              <div className="edu-item">
                <strong>💪 Músculos ativados</strong>
                <p>{exercicio.educacao.musculosAtivados}</p>
              </div>
            )}
            {exercicio.educacao.execucaoCorreta && (
              <div className="edu-item">
                <strong>✅ Execução correta</strong>
                <p>{exercicio.educacao.execucaoCorreta}</p>
              </div>
            )}
            {exercicio.educacao.errosComuns && (
              <div className="edu-item">
                <strong>⚠️ Erros comuns</strong>
                <p>{exercicio.educacao.errosComuns}</p>
              </div>
            )}
            {exercicio.educacao.dicaExtra && (
              <div className="edu-item edu-dica">
                <strong>💡 Dica do Pacholok</strong>
                <p>{exercicio.educacao.dicaExtra}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const WorkoutView = () => {
  const [workout, setWorkout] = useState(null);
  const [treinoHoje, setTreinoHoje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('hoje');

  // Estado por exercício: { [ordem]: { concluido, peso, obs } }
  const [exercStatus, setExercStatus] = useState({});
  const [gifExercicio, setGifExercicio] = useState(null);

  // Check-in (conclusão do dia)
  const [humor, setHumor] = useState('');
  const [concluido, setConcluido] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [currentRes, todayRes] = await Promise.allSettled([
        workoutAPI.getCurrent(),
        workoutAPI.getToday()
      ]);

      if (currentRes.status === 'fulfilled') {
        setWorkout(currentRes.value.data.workout);
      }
      if (todayRes.status === 'fulfilled') {
        const data = todayRes.value.data;
        if (!data.descansando) {
          setTreinoHoje(data.treinoDoDia);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar treino:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExercicio = (ordem) => {
    setExercStatus(prev => ({
      ...prev,
      [ordem]: { ...prev[ordem], concluido: !prev[ordem]?.concluido }
    }));
  };

  const handlePeso = (ordem, valor) => {
    setExercStatus(prev => ({
      ...prev,
      [ordem]: { ...prev[ordem], peso: valor }
    }));
  };

  const handleObs = (ordem, valor) => {
    setExercStatus(prev => ({
      ...prev,
      [ordem]: { ...prev[ordem], obs: valor }
    }));
  };

  const handleConcluir = async () => {
    if (!workout) return;
    setSalvando(true);
    try {
      await workoutAPI.complete(workout._id, {
        diaRealizado: treinoHoje?.nome,
        feedback: { notas: humor }
      });
      setConcluido(true);
    } catch (error) {
      console.error('Erro ao concluir treino:', error);
      setConcluido(true);
    } finally {
      setSalvando(false);
    }
  };

  const exerciciosConcluidos = treinoHoje
    ? treinoHoje.exercicios.filter(ex => exercStatus[ex.ordem]?.concluido).length
    : 0;
  const totalExercicios = treinoHoje?.exercicios?.length || 0;

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="workout-view-container">
          <div className="loading">Carregando seu treino...</div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div>
        <Navbar />
        <div className="workout-view-container">
          <div className="empty-state">
            <h2>Você ainda não tem um treino</h2>
            <p>Gere um treino personalizado para começar!</p>
            <a href="/gerar-treino" className="btn btn-primary">
              Gerar Treino Agora
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="workout-view-container">

        {/* Header do programa */}
        <header className="workout-header">
          <div className="workout-header-top">
            <div>
              <h1>{workout.nome}</h1>
              <p className="workout-description">{workout.descricao}</p>
            </div>
            <button className="btn btn-outline btn-sm workout-novo-btn" onClick={() => setAbaAtiva('gerar')}>
              + Novo Treino
            </button>
          </div>
          <div className="workout-badges">
            <span className="badge">📅 {workout.diasPorSemana} dias/semana</span>
            <span className="badge">📊 {workout.divisao}</span>
            <span className="badge">🎯 {workout.tipo}</span>
            <span className="badge">💪 {workout.nivel}</span>
          </div>
        </header>

        {/* Abas */}
        <div className="workout-tabs">
          <button
            className={`workout-tab ${abaAtiva === 'hoje' ? 'tab-ativa' : ''}`}
            onClick={() => setAbaAtiva('hoje')}
          >
            Treino de Hoje
          </button>
          <button
            className={`workout-tab ${abaAtiva === 'plano' ? 'tab-ativa' : ''}`}
            onClick={() => setAbaAtiva('plano')}
          >
            Meu Plano
          </button>
          <button
            className={`workout-tab ${abaAtiva === 'gerar' ? 'tab-ativa' : ''}`}
            onClick={() => setAbaAtiva('gerar')}
          >
            Gerar Novo
          </button>
        </div>

        {/* ── ABA: TREINO DE HOJE ── */}
        {abaAtiva === 'hoje' && (
          <div className="aba-hoje">
            {!treinoHoje ? (
              <div className="card descanso-card">
                <div className="descanso-icon">😴</div>
                <h2>Hoje é dia de descanso!</h2>
                <p>Recuperação também faz parte do treino. Descanse bem.</p>
              </div>
            ) : (
              <>
                <div className="hoje-header">
                  <div>
                    <h2 className="hoje-titulo">{treinoHoje.nome}</h2>
                    <span className="hoje-progresso">
                      {exerciciosConcluidos}/{totalExercicios} exercícios concluídos
                    </span>
                  </div>
                  <div className="hoje-info">
                    <span>⏱️ ~{treinoHoje.duracaoEstimada} min</span>
                    <span className={`difficulty difficulty-${treinoHoje.dificuldade}`}>
                      {treinoHoje.dificuldade}
                    </span>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="progresso-bar">
                  <div
                    className="progresso-fill"
                    style={{ width: totalExercicios > 0 ? `${(exerciciosConcluidos / totalExercicios) * 100}%` : '0%' }}
                  />
                </div>

                {/* Lista de exercícios com tracking */}
                <div className="exercises-list">
                  {treinoHoje.exercicios.map((exercicio) => {
                    const status = exercStatus[exercicio.ordem] || {};
                    return (
                      <div
                        key={exercicio.ordem}
                        className={`exercise-track-card ${status.concluido ? 'exercise-feito' : ''}`}
                      >
                        <div className="exercise-track-top">
                          <div className="exercise-track-info">
                            <div className="exercise-number">{exercicio.ordem}</div>
                            <div className="exercise-content">
                              <div className="exercise-nome-row">
                                <h3>{exercicio.nome}</h3>
                                <button
                                  className="btn-video"
                                  onClick={() => setGifExercicio(exercicio)}
                                  title="Ver demonstração GIF"
                                >
                                  🎬 GIF
                                </button>
                              </div>
                              {exercicio.motivacao && (
                                <div className="exercise-motivacao">
                                  <span>🎯 {exercicio.motivacao}</span>
                                </div>
                              )}
                              <div className="exercise-details">
                                <span className="muscle-group">{exercicio.grupoMuscular}</span>
                                <span className="sets-reps">
                                  {exercicio.series} séries × {exercicio.repeticoes} reps
                                </span>
                                <span className="rest">⏸️ {exercicio.descanso}s</span>
                              </div>
                            </div>
                          </div>
                          <button
                            className={`btn-check ${status.concluido ? 'btn-check-feito' : ''}`}
                            onClick={() => toggleExercicio(exercicio.ordem)}
                            title={status.concluido ? 'Desmarcar' : 'Marcar como feito'}
                          >
                            {status.concluido ? '✓' : '○'}
                          </button>
                        </div>

                        {/* Inputs de carga e observação */}
                        <div className="exercise-track-inputs">
                          <div className="track-input-group">
                            <label>Carga utilizada</label>
                            <input
                              type="number"
                              placeholder="kg"
                              value={status.peso || ''}
                              onChange={(e) => handlePeso(exercicio.ordem, e.target.value)}
                              min="0"
                              step="0.5"
                            />
                          </div>
                          <div className="track-input-group track-obs">
                            <label>Como foi?</label>
                            <input
                              type="text"
                              placeholder="Ex: Aumentei 2.5kg, senti bem..."
                              value={status.obs || ''}
                              onChange={(e) => handleObs(exercicio.ordem, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Check-in de conclusão */}
                <div className="checkin-card">
                  {concluido ? (
                    <div className="checkin-sucesso">
                      <div className="checkin-sucesso-icon">✅</div>
                      <h3>Treino concluído!</h3>
                      <p>Parabéns! Cada treino é uma vitória. 💪</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="checkin-titulo">Finalizar Treino</h3>
                      <div className="form-group">
                        <label>Como você está se sentindo hoje?</label>
                        <textarea
                          value={humor}
                          onChange={(e) => setHumor(e.target.value)}
                          placeholder="Ex: Me senti com bastante energia, aumentei a carga no supino..."
                          rows="3"
                          disabled={salvando}
                        />
                      </div>
                      <button
                        className="btn btn-primary btn-block"
                        onClick={handleConcluir}
                        disabled={salvando}
                      >
                        {salvando ? 'Salvando...' : '✅ Marcar Treino como Concluído'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ABA: MEU PLANO ── */}
        {abaAtiva === 'plano' && (
          <>
            <div className="workout-days">
              {workout.dias && workout.dias.map((dia, index) => (
                <div key={index} className="day-card">
                  <div className="day-header">
                    <h2>
                      <span className="day-label">{dia.dia}</span>
                      {dia.nome}
                    </h2>
                    <div className="day-info">
                      <span>⏱️ ~{dia.duracaoEstimada} min</span>
                      <span className={`difficulty difficulty-${dia.dificuldade}`}>
                        {dia.dificuldade}
                      </span>
                    </div>
                  </div>

                  <div className="exercises-list">
                    {dia.exercicios && dia.exercicios.map((exercicio, exIndex) => (
                      <div key={exIndex} className="exercise-card">
                        <div className="exercise-number">{exercicio.ordem}</div>
                        <div className="exercise-content">
                          <div className="exercise-nome-row">
                            <h3>{exercicio.nome}</h3>
                            <button
                              className="btn-video"
                              onClick={() => setGifExercicio(exercicio)}
                              title="Ver vídeo e dicas — Fabrício Pacholok"
                            >
                              ▶ Vídeo
                            </button>
                          </div>
                          {exercicio.motivacao && (
                            <div className="exercise-motivacao">
                              <span>🎯 {exercicio.motivacao}</span>
                            </div>
                          )}
                          <div className="exercise-details">
                            <span className="muscle-group">{exercicio.grupoMuscular}</span>
                            <span className="sets-reps">
                              {exercicio.series} séries × {exercicio.repeticoes} reps
                            </span>
                            <span className="rest">⏸️ {exercicio.descanso}s</span>
                          </div>
                          {exercicio.observacoes && (
                            <p className="exercise-notes">💡 {exercicio.observacoes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="workout-tips">
              <h3>💡 Dicas Importantes:</h3>
              <ul>
                <li>Faça um aquecimento de 5-10 minutos antes de começar</li>
                <li>Mantenha boa forma nos exercícios - qualidade &gt; quantidade</li>
                <li>Hidrate-se bem durante o treino</li>
                <li>Respeite os dias de descanso para recuperação muscular</li>
                <li>Aumente a carga progressivamente quando sentir facilidade</li>
              </ul>
            </div>
          </>
        )}

        {/* ── ABA: GERAR NOVO TREINO ── */}
        {abaAtiva === 'gerar' && (
          <WorkoutGenerator
            embedded
            onSuccess={() => { loadData(); setAbaAtiva('hoje'); }}
          />
        )}

      </div>

      {gifExercicio && (
        <GifModal exercicio={gifExercicio} onClose={() => setGifExercicio(null)} />
      )}
    </div>
  );
};

const WorkoutViewGated = () => (
  <ProfissionalGate tipo="treino">
    <WorkoutView />
  </ProfissionalGate>
);

export default WorkoutViewGated;
