// ============================================================================
// PÁGINA VISUALIZAR TREINO - Mostra o Treino Completo
// ============================================================================

import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/WorkoutView.css';

const WorkoutView = () => {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [humor, setHumor] = useState('');
  const [concluido, setConcluido] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, []);

  const loadWorkout = async () => {
    try {
      const response = await workoutAPI.getCurrent();
      setWorkout(response.data.workout);
    } catch (error) {
      console.error('Erro ao carregar treino:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConcluir = async () => {
    if (!workout) return;
    setSalvando(true);
    try {
      await workoutAPI.complete(workout._id, { notas: humor });
      setConcluido(true);
    } catch (error) {
      console.error('Erro ao concluir treino:', error);
      setConcluido(true); // marca mesmo assim localmente
    } finally {
      setSalvando(false);
    }
  };

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
            <h2>Você ainda não tem um treino 😢</h2>
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
        <header className="workout-header">
          <h1>{workout.nome}</h1>
          <p className="workout-description">{workout.descricao}</p>
          <div className="workout-badges">
            <span className="badge">📅 {workout.diasPorSemana} dias/semana</span>
            <span className="badge">📊 {workout.divisao}</span>
            <span className="badge">🎯 {workout.tipo}</span>
            <span className="badge">💪 {workout.nivel}</span>
          </div>
        </header>

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
                      <h3>{exercicio.nome}</h3>
                      <div className="exercise-details">
                        <span className="muscle-group">
                          {exercicio.grupoMuscular}
                        </span>
                        <span className="sets-reps">
                          {exercicio.series} séries × {exercicio.repeticoes} reps
                        </span>
                        <span className="rest">
                          ⏸️ {exercicio.descanso}s
                        </span>
                      </div>
                      {exercicio.observacoes && (
                        <p className="exercise-notes">
                          💡 {exercicio.observacoes}
                        </p>
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
            <li>Mantenha boa forma nos exercícios - qualidade > quantidade</li>
            <li>Hidrate-se bem durante o treino</li>
            <li>Respeite os dias de descanso para recuperação muscular</li>
            <li>Aumente a carga progressivamente quando sentir facilidade</li>
          </ul>
        </div>

        {/* Check-in do treino */}
        <div className="checkin-card">
          {concluido ? (
            <div className="checkin-sucesso">
              <div className="checkin-sucesso-icon">✅</div>
              <h3>Treino concluído!</h3>
              <p>Parabéns! Cada treino é uma vitória. 💪</p>
            </div>
          ) : (
            <>
              <h3 className="checkin-titulo">Check-in do Treino</h3>
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
      </div>
    </div>
  );
};

export default WorkoutView;
