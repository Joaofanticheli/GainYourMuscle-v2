import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { workoutAPI } from '../services/api';
import Navbar from '../components/Navbar';
import ProfissionalGate from '../components/ProfissionalGate';
import '../styles/WorkoutManual.css';

const GRUPOS = [
  { value: 'peito', label: 'Peito' },
  { value: 'costas', label: 'Costas' },
  { value: 'ombro', label: 'Ombro' },
  { value: 'biceps', label: 'Bíceps' },
  { value: 'triceps', label: 'Tríceps' },
  { value: 'pernas', label: 'Pernas' },
  { value: 'abdomen', label: 'Abdômen' },
  { value: 'mobilidade', label: 'Mobilidade' },
];

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F'];

const exercicioVazio = (series = 3, repeticoes = '8-12', descanso = 60) => ({
  nome: '', grupoMuscular: 'peito',
  series, repeticoes, descanso,
  intensidade: 'moderado', carga: '', observacoes: '',
  _key: Math.random()
});

const diaVazio = (letra, series = 3, repeticoes = '8-12', descanso = 60) => ({
  dia: letra,
  nome: '',
  focoPrincipal: [],
  duracaoEstimada: 60,
  dificuldade: 'moderado',
  observacaoGeral: '',
  exercicios: [exercicioVazio(series, repeticoes, descanso)],
});

const WorkoutManual = ({ embedded = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clienteId   = searchParams.get('cliente');
  const clienteNome = searchParams.get('clienteNome');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  // Config global para aplicar em lote
  const [configGlobal, setConfigGlobal] = useState({ series: 3, repeticoes: '8-12', descanso: 60 });

  const [info, setInfo] = useState({
    nome: '', descricao: '', tipo: 'hipertrofia', nivel: 'intermediario', diasPorSemana: 4,
  });

  const [dias, setDias] = useState(() =>
    LETRAS.slice(0, 4).map(l => diaVazio(l, 3, '8-12', 60))
  );

  const handleDiasPorSemana = (n) => {
    const num = Number(n);
    setInfo(prev => ({ ...prev, diasPorSemana: num }));
    setDias(prev => {
      if (num > prev.length) {
        const extras = LETRAS.slice(prev.length, num).map(l =>
          diaVazio(l, configGlobal.series, configGlobal.repeticoes, configGlobal.descanso)
        );
        return [...prev, ...extras];
      }
      return prev.slice(0, num);
    });
  };

  // Aplicar config global a todos os exercícios de todos os dias
  const aplicarConfigGlobal = () => {
    setDias(prev => prev.map(d => ({
      ...d,
      exercicios: d.exercicios.map(ex => ({
        ...ex,
        series: configGlobal.series,
        repeticoes: configGlobal.repeticoes,
        descanso: configGlobal.descanso,
      }))
    })));
  };

  const handleDia = (diaIdx, campo, valor) => {
    setDias(prev => prev.map((d, i) => i === diaIdx ? { ...d, [campo]: valor } : d));
  };

  const handleEx = (diaIdx, exIdx, campo, valor) => {
    setDias(prev => prev.map((d, i) => {
      if (i !== diaIdx) return d;
      const exercicios = d.exercicios.map((ex, j) => j === exIdx ? { ...ex, [campo]: valor } : ex);
      return { ...d, exercicios };
    }));
  };

  const addExercicio = (diaIdx) => {
    setDias(prev => prev.map((d, i) =>
      i === diaIdx
        ? { ...d, exercicios: [...d.exercicios, exercicioVazio(configGlobal.series, configGlobal.repeticoes, configGlobal.descanso)] }
        : d
    ));
  };

  const removeExercicio = (diaIdx, exIdx) => {
    setDias(prev => prev.map((d, i) => {
      if (i !== diaIdx) return d;
      const exercicios = d.exercicios.filter((_, j) => j !== exIdx);
      return { ...d, exercicios: exercicios.length ? exercicios : [exercicioVazio()] };
    }));
  };

  const copiarExercicio = (diaIdx, exIdx) => {
    setDias(prev => prev.map((d, i) => {
      if (i !== diaIdx) return d;
      const copia = { ...d.exercicios[exIdx], _key: Math.random() };
      const exercicios = [...d.exercicios];
      exercicios.splice(exIdx + 1, 0, copia);
      return { ...d, exercicios };
    }));
  };

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

  const copiarDia = (diaIdx) => {
    setDias(prev => {
      if (prev.length >= 6) return prev;
      const origem = prev[diaIdx];
      const novaLetra = LETRAS[prev.length];
      const copia = {
        ...origem,
        dia: novaLetra,
        exercicios: origem.exercicios.map(ex => ({ ...ex, _key: Math.random() })),
      };
      const novoDias = [...prev, copia];
      setInfo(p => ({ ...p, diasPorSemana: novoDias.length }));
      return novoDias;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!info.nome.trim()) { setErro('Dê um nome ao treino.'); return; }
    for (const dia of dias) {
      if (!dia.nome.trim()) { setErro(`Preencha o nome do Treino ${dia.dia}.`); return; }
      for (const ex of dia.exercicios) {
        if (!ex.nome.trim()) { setErro(`Preencha o nome de todos os exercícios do Treino ${dia.nome || dia.dia}.`); return; }
      }
    }
    setSalvando(true);
    try {
      await workoutAPI.saveManual({ ...info, diasPorSemana: Number(info.diasPorSemana), dias, ...(clienteId ? { clienteId } : {}) });
      setSucesso(true);
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao salvar treino.');
    } finally {
      setSalvando(false);
    }
  };

  if (sucesso) {
    const content = (
      <div className="manual-sucesso">
        <div className="manual-sucesso-icon">💪</div>
        <h1>Treino salvo!</h1>
        <p>{clienteNome ? `Treino de ${clienteNome} criado com sucesso!` : 'Seu treino personalizado foi criado!'}</p>
        <div className="manual-sucesso-acoes">
          {clienteId ? (
            <button className="btn btn-primary btn-large" onClick={() => navigate('/dashboard-profissional')}>Voltar ao Painel</button>
          ) : (
            <button className="btn btn-primary btn-large" onClick={() => navigate('/meu-treino')}>Ver Meu Treino</button>
          )}
          <button className="btn btn-outline" onClick={() => setSucesso(false)}>Criar Outro</button>
        </div>
      </div>
    );
    if (embedded) return content;
    return <div><Navbar /><div className="manual-container">{content}</div></div>;
  }

  const formContent = (
    <>
      <header className="manual-header">
        <h1>Criar Treino Manual</h1>
        <p>Monte seu programa do zero — exercício por exercício</p>
      </header>

      {clienteNome && (
        <div className="banner-cliente-prof">
          👤 Montando treino para <strong>{clienteNome}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {erro && <div className="alert alert-error">{erro}</div>}

        {/* INFORMAÇÕES GERAIS */}
        <div className="card manual-section">
          <h2 className="manual-section-title">Informações Gerais</h2>
          <div className="form-group">
            <label>Nome do treino *</label>
            <input type="text" placeholder="Ex: Treino ABC — Hipertrofia" value={info.nome}
              onChange={e => setInfo(p => ({ ...p, nome: e.target.value }))} disabled={salvando} />
          </div>
          <div className="form-group">
            <label>Descrição (opcional)</label>
            <textarea placeholder="Objetivo e lógica do treino..." value={info.descricao}
              onChange={e => setInfo(p => ({ ...p, descricao: e.target.value }))} rows={2} disabled={salvando} />
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
              <label>Qtd. de treinos</label>
              <select value={info.diasPorSemana} onChange={e => handleDiasPorSemana(e.target.value)} disabled={salvando}>
                <option value={1}>1 treino</option>
                <option value={2}>2 treinos</option>
                <option value={3}>3 treinos</option>
                <option value={4}>4 treinos</option>
                <option value={5}>5 treinos</option>
                <option value={6}>6 treinos</option>
              </select>
            </div>
          </div>
        </div>

        {/* CONFIGURAÇÃO GLOBAL EM LOTE */}
        <div className="card manual-section manual-config-global">
          <h2 className="manual-section-title">Configuração Geral (aplicar a todos)</h2>
          <div className="config-global-row">
            <div className="form-group">
              <label>Séries padrão</label>
              <input type="number" min="1" max="10" value={configGlobal.series}
                onChange={e => setConfigGlobal(p => ({ ...p, series: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>Repetições padrão</label>
              <input type="text" placeholder="8-12" value={configGlobal.repeticoes}
                onChange={e => setConfigGlobal(p => ({ ...p, repeticoes: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Descanso padrão (s)</label>
              <input type="number" min="10" max="300" value={configGlobal.descanso}
                onChange={e => setConfigGlobal(p => ({ ...p, descanso: Number(e.target.value) }))} />
            </div>
            <button type="button" className="btn-aplicar-global" onClick={aplicarConfigGlobal}>
              ↺ Aplicar a todos
            </button>
          </div>
          <p className="config-global-hint">Novos exercícios adicionados já usarão esses valores.</p>
        </div>

        {/* TREINOS A, B, C... */}
        {dias.map((dia, diaIdx) => (
          <div className="card manual-dia" key={dia.dia + diaIdx}>
            <div className="manual-dia-header">
              <span className="manual-dia-badge">Treino {dia.dia}</span>
              <input className="manual-dia-nome" type="text"
                placeholder={`Nome (ex: Peitoral e Tríceps)`}
                value={dia.nome}
                onChange={e => handleDia(diaIdx, 'nome', e.target.value)}
                disabled={salvando} />
              <select className="manual-dia-dificuldade"
                value={dia.dificuldade}
                onChange={e => handleDia(diaIdx, 'dificuldade', e.target.value)}
                disabled={salvando}>
                <option value="facil">Fácil</option>
                <option value="moderado">Moderado</option>
                <option value="dificil">Difícil</option>
              </select>
              <button type="button" className="btn-copiar-dia" onClick={() => copiarDia(diaIdx)}
                disabled={salvando || dias.length >= 6} title="Copiar este treino">
                ⧉ Copiar treino
              </button>
            </div>

            <div className="form-group manual-obs-geral">
              <input type="text" placeholder="Observação geral do treino (opcional)..."
                value={dia.observacaoGeral}
                onChange={e => handleDia(diaIdx, 'observacaoGeral', e.target.value)}
                disabled={salvando} />
            </div>

            {/* Exercícios */}
            <div className="manual-exercicios">
              {dia.exercicios.map((ex, exIdx) => (
                <div className="manual-ex-row" key={ex._key}>
                  <div className="manual-ex-ordem">{exIdx + 1}</div>
                  <div className="manual-ex-fields">
                    <div className="manual-ex-top">
                      <div className="form-group manual-ex-nome">
                        <input type="text" placeholder="Nome do exercício"
                          value={ex.nome}
                          onChange={e => handleEx(diaIdx, exIdx, 'nome', e.target.value)}
                          disabled={salvando} />
                      </div>
                      <div className="form-group">
                        <select value={ex.grupoMuscular}
                          onChange={e => handleEx(diaIdx, exIdx, 'grupoMuscular', e.target.value)}
                          disabled={salvando}>
                          {GRUPOS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="manual-ex-numeros">
                      <div className="form-group">
                        <label>Séries</label>
                        <input type="number" min="1" max="10" value={ex.series}
                          onChange={e => handleEx(diaIdx, exIdx, 'series', Number(e.target.value))}
                          disabled={salvando} />
                      </div>
                      <div className="form-group">
                        <label>Repetições</label>
                        <input type="text" placeholder="8-12" value={ex.repeticoes}
                          onChange={e => handleEx(diaIdx, exIdx, 'repeticoes', e.target.value)}
                          disabled={salvando} />
                      </div>
                      <div className="form-group">
                        <label>Descanso (s)</label>
                        <input type="number" min="10" max="300" value={ex.descanso}
                          onChange={e => handleEx(diaIdx, exIdx, 'descanso', Number(e.target.value))}
                          disabled={salvando} />
                      </div>
                      <div className="form-group">
                        <label>Intensidade</label>
                        <select value={ex.intensidade}
                          onChange={e => handleEx(diaIdx, exIdx, 'intensidade', e.target.value)}
                          disabled={salvando}>
                          <option value="leve">Leve</option>
                          <option value="moderado">Moderado</option>
                          <option value="intenso">Intenso</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Carga</label>
                        <input type="text" placeholder="Ex: 20kg, 80% 1RM"
                          value={ex.carga}
                          onChange={e => handleEx(diaIdx, exIdx, 'carga', e.target.value)}
                          disabled={salvando} />
                      </div>
                      <div className="form-group manual-ex-obs">
                        <label>Observação</label>
                        <input type="text" placeholder="Dica ou observação..."
                          value={ex.observacoes}
                          onChange={e => handleEx(diaIdx, exIdx, 'observacoes', e.target.value)}
                          disabled={salvando} />
                      </div>
                    </div>
                  </div>
                  <div className="manual-ex-controles">
                    <button type="button" className="btn-ex-ctrl" onClick={() => moverEx(diaIdx, exIdx, -1)} disabled={exIdx === 0}>↑</button>
                    <button type="button" className="btn-ex-ctrl" onClick={() => moverEx(diaIdx, exIdx, 1)} disabled={exIdx === dia.exercicios.length - 1}>↓</button>
                    <button type="button" className="btn-ex-ctrl btn-ex-copy" onClick={() => copiarExercicio(diaIdx, exIdx)} title="Copiar exercício">⧉</button>
                    <button type="button" className="btn-ex-ctrl btn-ex-del" onClick={() => removeExercicio(diaIdx, exIdx)}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="btn-add-exercicio" onClick={() => addExercicio(diaIdx)} disabled={salvando}>
              + Adicionar Exercício
            </button>
          </div>
        ))}

        <button type="submit" className="btn btn-primary btn-block btn-large" disabled={salvando}>
          {salvando ? 'Salvando...' : '💾 Salvar Treino'}
        </button>
      </form>
    </>
  );

  if (embedded) return formContent;
  return <div><Navbar /><div className="manual-container">{formContent}</div></div>;
};

export { WorkoutManual };

const WorkoutManualGated = () => (
  <ProfissionalGate tipo="treino">
    <WorkoutManual />
  </ProfissionalGate>
);

export default WorkoutManualGated;
