// ============================================================================
// PÁGINA TREINO MANUAL - Criar treino personalizado do zero
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/WorkoutManual.css';

const GRUPOS = [
  { value: 'peito',    label: 'Peito'    },
  { value: 'costas',   label: 'Costas'   },
  { value: 'ombro',    label: 'Ombro'    },
  { value: 'biceps',   label: 'Bíceps'   },
  { value: 'triceps',  label: 'Tríceps'  },
  { value: 'pernas',   label: 'Pernas'   },
  { value: 'abdomen',  label: 'Abdômen'  },
  { value: 'mobilidade', label: 'Mobilidade' },
];

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const exercicioVazio = () => ({
  nome: '', grupoMuscular: 'peito',
  series: 3, repeticoes: '8-12', descanso: 60, observacoes: '',
  _key: Math.random()
});

const diaVazio = (dia) => ({
  dia,
  nome: '',
  focoPrincipal: [],
  duracaoEstimada: 60,
  dificuldade: 'moderado',
  exercicios: [exercicioVazio()],
});

const WorkoutManual = () => {
  const navigate = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const [info, setInfo] = useState({
    nome: '',
    descricao: '',
    tipo: 'hipertrofia',
    nivel: 'intermediario',
    diasPorSemana: 4,
  });

  // Dias inicializados com base no diasPorSemana
  const [dias, setDias] = useState(() =>
    DIAS_SEMANA.slice(0, 4).map(diaVazio)
  );

  // ── Alterar número de dias ────────────────────────────────────────────────
  const handleDiasPorSemana = (n) => {
    const num = Number(n);
    setInfo(prev => ({ ...prev, diasPorSemana: num }));
    setDias(prev => {
      if (num > prev.length) {
        const extras = DIAS_SEMANA.slice(prev.length, num).map(diaVazio);
        return [...prev, ...extras];
      }
      return prev.slice(0, num);
    });
  };

  // ── Alterar campo de dia ──────────────────────────────────────────────────
  const handleDia = (diaIdx, campo, valor) => {
    setDias(prev => prev.map((d, i) =>
      i === diaIdx ? { ...d, [campo]: valor } : d
    ));
  };

  // ── Alterar campo de exercício ────────────────────────────────────────────
  const handleEx = (diaIdx, exIdx, campo, valor) => {
    setDias(prev => prev.map((d, i) => {
      if (i !== diaIdx) return d;
      const exercicios = d.exercicios.map((ex, j) =>
        j === exIdx ? { ...ex, [campo]: valor } : ex
      );
      return { ...d, exercicios };
    }));
  };

  // ── Adicionar exercício ───────────────────────────────────────────────────
  const addExercicio = (diaIdx) => {
    setDias(prev => prev.map((d, i) =>
      i === diaIdx
        ? { ...d, exercicios: [...d.exercicios, exercicioVazio()] }
        : d
    ));
  };

  // ── Remover exercício ─────────────────────────────────────────────────────
  const removeExercicio = (diaIdx, exIdx) => {
    setDias(prev => prev.map((d, i) => {
      if (i !== diaIdx) return d;
      const exercicios = d.exercicios.filter((_, j) => j !== exIdx);
      return { ...d, exercicios: exercicios.length ? exercicios : [exercicioVazio()] };
    }));
  };

  // ── Mover exercício para cima/baixo ──────────────────────────────────────
  const moverEx = (diaIdx, exIdx, dir) => {
    setDias(prev => prev.map((d, i) => {
      if (i !== diaIdx) return d;
      const arr = [...d.exercicios];
      const novo = exIdx + dir;
      if (novo < 0 || novo >= arr.length) return d;
      [arr[exIdx], arr[novo]] = [arr[novo], arr[exIdx]];
      return { ...d, exercicios: arr };
    }));
  };

  // ── Submeter ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!info.nome.trim()) {
      setErro('Dê um nome ao seu treino.');
      return;
    }

    for (const dia of dias) {
      if (!dia.nome.trim()) {
        setErro(`Preencha o nome do dia "${dia.dia}".`);
        return;
      }
      for (const ex of dia.exercicios) {
        if (!ex.nome.trim()) {
          setErro(`Preencha o nome de todos os exercícios do dia "${dia.nome}".`);
          return;
        }
      }
    }

    setSalvando(true);
    try {
      await workoutAPI.saveManual({
        ...info,
        diasPorSemana: Number(info.diasPorSemana),
        dias,
      });
      setSucesso(true);
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao salvar treino.');
    } finally {
      setSalvando(false);
    }
  };

  // ── Tela de sucesso ───────────────────────────────────────────────────────
  if (sucesso) {
    return (
      <div>
        <Navbar />
        <div className="manual-container">
          <div className="manual-sucesso">
            <div className="manual-sucesso-icon">💪</div>
            <h1>Treino salvo!</h1>
            <p>Seu treino personalizado foi criado com sucesso.</p>
            <div className="manual-sucesso-acoes">
              <button className="btn btn-primary btn-large" onClick={() => navigate('/meu-treino')}>
                Ver Meu Treino
              </button>
              <button className="btn btn-outline" onClick={() => { setSucesso(false); }}>
                Criar Outro
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="manual-container">
        <header className="manual-header">
          <h1>Criar Treino Manual</h1>
          <p>Monte seu programa do zero — exercício por exercício</p>
        </header>

        <form onSubmit={handleSubmit}>
          {erro && <div className="alert alert-error">{erro}</div>}

          {/* ── INFORMAÇÕES GERAIS ── */}
          <div className="card manual-section">
            <h2 className="manual-section-title">Informações Gerais</h2>

            <div className="form-group">
              <label>Nome do treino *</label>
              <input
                type="text"
                placeholder="Ex: Meu Treino Push Pull Legs"
                value={info.nome}
                onChange={e => setInfo(p => ({ ...p, nome: e.target.value }))}
                disabled={salvando}
              />
            </div>

            <div className="form-group">
              <label>Descrição (opcional)</label>
              <textarea
                placeholder="Descreva o objetivo e a lógica do treino..."
                value={info.descricao}
                onChange={e => setInfo(p => ({ ...p, descricao: e.target.value }))}
                rows={2}
                disabled={salvando}
              />
            </div>

            <div className="manual-row-3">
              <div className="form-group">
                <label>Objetivo</label>
                <select value={info.tipo} onChange={e => setInfo(p => ({ ...p, tipo: e.target.value }))} disabled={salvando}>
                  <option value="hipertrofia">Hipertrofia</option>
                  <option value="forca">Força</option>
                  <option value="resistencia">Resistência</option>
                  <option value="emagrecimento">Emagrecimento</option>
                  <option value="funcional">Funcional</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nível</label>
                <select value={info.nivel} onChange={e => setInfo(p => ({ ...p, nivel: e.target.value }))} disabled={salvando}>
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>

              <div className="form-group">
                <label>Dias por semana</label>
                <select value={info.diasPorSemana} onChange={e => handleDiasPorSemana(e.target.value)} disabled={salvando}>
                  <option value={3}>3 dias</option>
                  <option value={4}>4 dias</option>
                  <option value={5}>5 dias</option>
                  <option value={6}>6 dias</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── DIAS DE TREINO ── */}
          {dias.map((dia, diaIdx) => (
            <div className="card manual-dia" key={dia.dia}>
              <div className="manual-dia-header">
                <span className="manual-dia-badge">{dia.dia}</span>
                <input
                  className="manual-dia-nome"
                  type="text"
                  placeholder={`Nome do dia (ex: Peito e Tríceps)`}
                  value={dia.nome}
                  onChange={e => handleDia(diaIdx, 'nome', e.target.value)}
                  disabled={salvando}
                />
                <select
                  className="manual-dia-dificuldade"
                  value={dia.dificuldade}
                  onChange={e => handleDia(diaIdx, 'dificuldade', e.target.value)}
                  disabled={salvando}
                >
                  <option value="facil">Fácil</option>
                  <option value="moderado">Moderado</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>

              {/* Lista de exercícios */}
              <div className="manual-exercicios">
                {dia.exercicios.map((ex, exIdx) => (
                  <div className="manual-ex-row" key={ex._key}>
                    <div className="manual-ex-ordem">{exIdx + 1}</div>

                    <div className="manual-ex-fields">
                      <div className="manual-ex-top">
                        <div className="form-group manual-ex-nome">
                          <input
                            type="text"
                            placeholder="Nome do exercício"
                            value={ex.nome}
                            onChange={e => handleEx(diaIdx, exIdx, 'nome', e.target.value)}
                            disabled={salvando}
                          />
                        </div>
                        <div className="form-group">
                          <select
                            value={ex.grupoMuscular}
                            onChange={e => handleEx(diaIdx, exIdx, 'grupoMuscular', e.target.value)}
                            disabled={salvando}
                          >
                            {GRUPOS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="manual-ex-numeros">
                        <div className="form-group">
                          <label>Séries</label>
                          <input
                            type="number" min="1" max="10"
                            value={ex.series}
                            onChange={e => handleEx(diaIdx, exIdx, 'series', Number(e.target.value))}
                            disabled={salvando}
                          />
                        </div>
                        <div className="form-group">
                          <label>Repetições</label>
                          <input
                            type="text" placeholder="8-12"
                            value={ex.repeticoes}
                            onChange={e => handleEx(diaIdx, exIdx, 'repeticoes', e.target.value)}
                            disabled={salvando}
                          />
                        </div>
                        <div className="form-group">
                          <label>Descanso (s)</label>
                          <input
                            type="number" min="10" max="300"
                            value={ex.descanso}
                            onChange={e => handleEx(diaIdx, exIdx, 'descanso', Number(e.target.value))}
                            disabled={salvando}
                          />
                        </div>
                        <div className="form-group manual-ex-obs">
                          <label>Observação</label>
                          <input
                            type="text" placeholder="Dica ou observação..."
                            value={ex.observacoes}
                            onChange={e => handleEx(diaIdx, exIdx, 'observacoes', e.target.value)}
                            disabled={salvando}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Controles do exercício */}
                    <div className="manual-ex-controles">
                      <button type="button" className="btn-ex-ctrl" onClick={() => moverEx(diaIdx, exIdx, -1)} disabled={exIdx === 0}>↑</button>
                      <button type="button" className="btn-ex-ctrl" onClick={() => moverEx(diaIdx, exIdx, 1)} disabled={exIdx === dia.exercicios.length - 1}>↓</button>
                      <button type="button" className="btn-ex-ctrl btn-ex-del" onClick={() => removeExercicio(diaIdx, exIdx)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-add-exercicio"
                onClick={() => addExercicio(diaIdx)}
                disabled={salvando}
              >
                + Adicionar Exercício
              </button>
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-large"
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : '💾 Salvar Treino'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkoutManual;
