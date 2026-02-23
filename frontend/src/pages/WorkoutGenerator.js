// ============================================================================
// PÁGINA GERADOR DE TREINO - Questionário e Geração
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutAPI } from '../services/api';
import Navbar from '../components/Navbar';
import WorkoutManual from './WorkoutManual';
import '../styles/WorkoutGenerator.css';

// ── Configuração de esportes e posições ─────────────────────────────────────
const esportesConfig = {
  futebol:       { label: 'Futebol',          posicoes: ['Goleiro', 'Zagueiro', 'Lateral', 'Meio-campo', 'Atacante']                                          },
  basquete:      { label: 'Basquete',         posicoes: ['Armador', 'Ala-armador', 'Ala', 'Ala-pivô', 'Pivô']                                                 },
  volei:         { label: 'Vôlei',            posicoes: ['Levantador', 'Oposto', 'Ponteiro', 'Central', 'Libero']                                              },
  tenis:         { label: 'Tênis',            posicoes: ['Linha de Base', 'Serve-and-Volley', 'Recreativo']                                                    },
  natacao:       { label: 'Natação',          posicoes: ['Velocidade (sprint)', 'Resistência (fundo)', 'Polo Aquático']                                        },
  corrida:       { label: 'Corrida',          posicoes: ['Velocista (até 400m)', 'Meio-fundo (800m-5km)', 'Fundo/Maratona']                                    },
  luta:          { label: 'Lutas/MMA',        posicoes: ['Striking (boxe/muay thai)', 'Grappling (jiu-jitsu/luta)', 'MMA (completo)']                          },
  ciclismo:      { label: 'Ciclismo',         posicoes: ['Sprinter', 'Escalador', 'Contrarrelógio']                                                            },
  fut_americano: { label: 'Fut. Americano',   posicoes: ['Quarterback', 'Running Back', 'Wide Receiver', 'Lineman', 'Linebacker']                              },
};

// ── Locais de lesão ──────────────────────────────────────────────────────────
const lesaoLocais = [
  { value: 'ombro',          label: 'Ombro'                                  },
  { value: 'cotovelo_punho', label: 'Cotovelo ou Punho'                      },
  { value: 'coluna_lombar',  label: 'Coluna Lombar (parte baixa das costas)' },
  { value: 'coluna_cervical',label: 'Pescoço / Coluna Cervical'              },
  { value: 'quadril',        label: 'Quadril / Virilha'                      },
  { value: 'joelho',         label: 'Joelho'                                 },
  { value: 'tornozelo',      label: 'Tornozelo ou Pé'                        },
];

// ── Componente principal ─────────────────────────────────────────────────────
const WorkoutGenerator = ({ embedded = false, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [celebrando, setCelebrando] = useState(false);
  const [dadosCelebracao, setDadosCelebracao] = useState({});
  const [abaAtiva, setAbaAtiva] = useState('gerar');

  const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  const PARQ_PERGUNTAS = [
    'Algum médico já disse que você tem algum problema cardíaco e que só deveria praticar atividade física com supervisão médica?',
    'Você sente dor no peito quando pratica atividade física?',
    'No último mês, você teve dor no peito quando não estava praticando atividade física?',
    'Você perde o equilíbrio por causa de tontura ou já perdeu a consciência?',
    'Você tem algum problema ósseo ou articular que poderia piorar com a prática de atividade física?',
    'Algum médico já prescreveu medicamentos para sua pressão arterial ou problema cardíaco?',
    'Você conhece alguma outra razão pela qual não deveria praticar atividade física?',
  ];

  const [formData, setFormData] = useState({
    objetivo:          '',
    esporte:           '',
    posicao:           '',
    diasSelecionados:  [],
    experiencia:       '',
    fadiga:            '',
    lesao:             '',
    localLesao:        '',
    lesaoDescricao:    '',
    duracao:           '',
    disciplina:        '',
    variedade:         '',
    ambiente:          '',
    muscular:          '',
    parqRespostas:     Array(7).fill('nao'),
    doencaCronica:     'nao',
    doencaDescricao:   '',
    medicamento:       'nao',
    medicamentoDescricao: '',
  });

  const toggleDia = (dia) => {
    setFormData(prev => {
      const atual = prev.diasSelecionados;
      const novo = atual.includes(dia)
        ? atual.filter(d => d !== dia)
        : [...atual, dia];
      return { ...prev, diasSelecionados: novo };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'objetivo') {
      setFormData(prev => ({ ...prev, objetivo: value, esporte: '', posicao: '' }));
    } else if (name === 'esporte') {
      setFormData(prev => ({ ...prev, esporte: value, posicao: '' }));
    } else if (name === 'lesao') {
      setFormData(prev => ({ ...prev, lesao: value, localLesao: '', lesaoDescricao: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleParq = (index, valor) => {
    setFormData(prev => {
      const novas = [...prev.parqRespostas];
      novas[index] = valor;
      return { ...prev, parqRespostas: novas };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações extras (além do required HTML)
    if (formData.objetivo === 'esporte' && (!formData.esporte || !formData.posicao)) {
      setError('Selecione o esporte e sua posição para continuar.');
      return;
    }
    if (formData.lesao && formData.lesao !== 'nenhuma' && !formData.localLesao) {
      setError('Por favor, informe onde está a limitação física.');
      return;
    }

    if (formData.diasSelecionados.length < 3 || formData.diasSelecionados.length > 6) {
      setError('Selecione entre 3 e 6 dias de treino.');
      return;
    }

    setLoading(true);
    try {
      const params = {
        ...formData,
        diasTreino: formData.diasSelecionados.length,
        diasSelecionados: formData.diasSelecionados,
      };
      const response = await workoutAPI.generate(params);
      if (response.data.success) {
        if (embedded && onSuccess) {
          onSuccess();
        } else {
          setDadosCelebracao({ objetivo: formData.objetivo, esporte: formData.esporte, posicao: formData.posicao });
          setCelebrando(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao gerar treino. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ── Tela de celebração ─────────────────────────────────────────────────────
  if (celebrando) {
    const isEsporte = dadosCelebracao.objetivo === 'esporte';
    const esporteLabel = isEsporte ? (esportesConfig[dadosCelebracao.esporte]?.label || '') : '';
    return (
      <div>
        <Navbar />
        <div className="workout-generator-container">
          <div className="celebracao-card">
            <div className="celebracao-icone">{isEsporte ? '🏆' : '🎉'}</div>
            <h1 className="celebracao-titulo">
              {isEsporte ? `Programa de ${esporteLabel} pronto!` : 'Treino criado!'}
            </h1>
            <p className="celebracao-subtitulo">
              {isEsporte ? (
                <>
                  Seu programa específico para <strong>{dadosCelebracao.posicao}</strong> foi criado com
                  exercícios funcionais e <strong>mobilidade integrada</strong> em todos os dias.
                  Hoje é o <strong>Dia 1</strong> — registre suas medidas iniciais!
                </>
              ) : (
                <>
                  Parabéns! Seu treino personalizado está pronto, com <strong>mobilidade ao final de
                  cada sessão</strong>. Hoje é o <strong>Dia 1 do seu projeto</strong> — registre suas
                  medidas iniciais para acompanhar sua evolução!
                </>
              )}
            </p>
            <div className="celebracao-dica">
              <p>
                Registrar seu peso e medidas hoje cria uma <strong>linha de base</strong>.
                Em semanas você verá a diferença — e isso vai te manter motivado!
              </p>
            </div>
            <div className="celebracao-acoes">
              <button className="btn btn-primary btn-large" onClick={() => navigate('/progresso')}>
                Registrar Dia 1
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/meu-treino')}>
                Ver Meu Treino
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulário ─────────────────────────────────────────────────────────────
  const formContent = (
    <>
      {/* ── ABAS ── */}
      <div className="generator-tabs">
        <button
          className={`generator-tab ${abaAtiva === 'gerar' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('gerar')}
        >
          Gerar Treino
        </button>
        <button
          className={`generator-tab ${abaAtiva === 'manual' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('manual')}
        >
          Criar Manual
        </button>
      </div>

      {abaAtiva === 'manual' ? (
        <WorkoutManual embedded />
      ) : (
        <>
          {embedded ? (
            <div className="generator-header-embedded">
              <h2>Gerar Novo Treino</h2>
              <p>Responda o questionário e a IA monta seu treino do zero</p>
            </div>
          ) : (
            <header className="generator-header">
              <h1>Gerar Treino Personalizado</h1>
              <p>Responda o questionário para criarmos seu treino ideal!</p>
            </header>
          )}

          <div className={`generator-content ${embedded ? 'generator-content-embedded' : ''}`}>
            {!embedded && (
              <div className="generator-info">
                <h2>Por que este questionário?</h2>
                <p>
                  Coletamos informações detalhadas sobre você para montar um treino
                  realmente ideal, pensado de forma individual.
                </p>
                <p>
                  O objetivo é garantir que o treino seja compatível com o seu nível
                  físico, suas preferências, sua rotina e seus objetivos.
                </p>
                <p>
                  Quando você começa a notar evolução, a motivação aumenta naturalmente,
                  tornando o treino mais prazeroso e sustentável!
                </p>
                <p className="generator-trust"><strong>Confie na gente!</strong></p>
              </div>
            )}

            <form className="generator-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            {/* ── OBJETIVO (pergunta principal) ── */}
            <fieldset className="fieldset-objetivo">
              <legend>Qual é o seu objetivo?</legend>
              <p className="fieldset-desc">Esta é a pergunta mais importante — ela define todo o seu programa.</p>

              <div className="objetivo-grid">
                {[
                  { value: 'hipertrofia',    icon: '💪', label: 'Ganhar Músculo',   desc: 'Aumentar massa muscular'     },
                  { value: 'emagrecimento',  icon: '🔥', label: 'Emagrecer',         desc: 'Reduzir gordura corporal'    },
                  { value: 'forca',          icon: '🏋️', label: 'Ganhar Força',      desc: 'Levantar cargas maiores'     },
                  { value: 'condicionamento',icon: '🏃', label: 'Condicionamento',   desc: 'Melhorar resistência'        },
                  { value: 'saude_geral',    icon: '❤️', label: 'Saúde Geral',       desc: 'Qualidade de vida'           },
                  { value: 'esporte',        icon: '🏅', label: 'Esporte Específico',desc: 'Treino para o seu esporte'   },
                ].map(({ value, icon, label, desc }) => (
                  <label
                    key={value}
                    className={`objetivo-card ${formData.objetivo === value ? 'objetivo-selecionado' : ''}`}
                  >
                    <input
                      type="radio"
                      name="objetivo"
                      value={value}
                      checked={formData.objetivo === value}
                      onChange={handleChange}
                      required
                    />
                    <span className="objetivo-icon">{icon}</span>
                    <span className="objetivo-label">{label}</span>
                    <span className="objetivo-desc">{desc}</span>
                  </label>
                ))}
              </div>

              {/* Seção de esporte (aparece quando "Esporte Específico" é selecionado) */}
              {formData.objetivo === 'esporte' && (
                <div className="esporte-section">
                  <h4>Qual esporte você pratica?</h4>
                  <div className="form-group">
                    <label htmlFor="esporte">Selecione o esporte</label>
                    <select
                      id="esporte"
                      name="esporte"
                      value={formData.esporte}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Selecione...</option>
                      {Object.entries(esportesConfig).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>

                  {formData.esporte && (
                    <div className="form-group">
                      <label htmlFor="posicao">Qual é a sua posição?</label>
                      <select
                        id="posicao"
                        name="posicao"
                        value={formData.posicao}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      >
                        <option value="">Selecione...</option>
                        {esportesConfig[formData.esporte].posicoes.map(pos => (
                          <option key={pos} value={pos.toLowerCase()}>{pos}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </fieldset>

            {/* ── AJUSTE FINO ── */}
            <fieldset>
              <legend>Ajuste fino do seu treino</legend>
              <p className="fieldset-desc">Personalizamos os detalhes para o seu dia a dia.</p>

              <div className="form-group">
                <label>Quais dias você vai treinar? <span style={{color:'var(--text-muted)', fontWeight:'normal'}}>(selecione 3 a 6 dias)</span></label>
                <div className="dias-selector">
                  {DIAS_SEMANA.map(dia => (
                    <button
                      key={dia}
                      type="button"
                      className={`dia-btn ${formData.diasSelecionados.includes(dia) ? 'dia-btn-ativo' : ''}`}
                      onClick={() => toggleDia(dia)}
                      disabled={loading}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
                {formData.diasSelecionados.length > 0 && (
                  <p className="dias-selecionados-info">
                    {formData.diasSelecionados.length} dias selecionados: {formData.diasSelecionados.join(', ')}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="experiencia">Experiência com musculação:</label>
                <select id="experiencia" name="experiencia" value={formData.experiencia} onChange={handleChange} required disabled={loading}>
                  <option value="">Selecione</option>
                  <option value="nunca">Nunca fiz</option>
                  <option value="novato">Novato (menos de 1 ano)</option>
                  <option value="intermediaria">Intermediário (1-3 anos)</option>
                  <option value="avancada">Avançado (mais de 3 anos)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fadiga">Qual é sua preferência de intensidade no treino?</label>
                <select id="fadiga" name="fadiga" value={formData.fadiga} onChange={handleChange} required disabled={loading}>
                  <option value="">Selecione</option>
                  <option value="evito">Prefiro treinar com moderação — não gosto de me esgotar</option>
                  <option value="consigo">Treino com boa intensidade, mas respeito meus limites</option>
                  <option value="nao">Gosto de me desafiar ao limite em cada treino</option>
                </select>
              </div>

              {/* Limitação física + localização + descrição */}
              <div className="form-group">
                <label htmlFor="lesao">Possui alguma limitação física atualmente?</label>
                <select id="lesao" name="lesao" value={formData.lesao} onChange={handleChange} required disabled={loading}>
                  <option value="">Selecione</option>
                  <option value="nenhuma">Não, estou bem</option>
                  <option value="leve">Sim — leve desconforto / dor ocasional</option>
                  <option value="pequena">Sim — lesão diagnosticada ou dor frequente</option>
                </select>
              </div>

              {formData.lesao && formData.lesao !== 'nenhuma' && (
                <div className="lesao-section">
                  <div className="lesao-context">
                    <strong>Por que perguntamos isso?</strong>
                    <p>
                      Sabendo onde está o desconforto e qual é o problema, adaptamos os exercícios para
                      evitar agravar a região — você treina com segurança e continua evoluindo!
                    </p>
                  </div>
                  <div className="form-group">
                    <label htmlFor="localLesao">Onde fica a limitação?</label>
                    <select id="localLesao" name="localLesao" value={formData.localLesao} onChange={handleChange} required disabled={loading}>
                      <option value="">Selecione a região</option>
                      {lesaoLocais.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="lesaoDescricao">Qual é o problema? <span style={{color:'var(--text-muted)', fontWeight:'normal'}}>(ex: tendinite, hérnia, dor após impacto…)</span></label>
                    <input
                      type="text"
                      id="lesaoDescricao"
                      name="lesaoDescricao"
                      placeholder="Descreva brevemente o problema"
                      value={formData.lesaoDescricao}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="duracao">Preferência de duração do treino:</label>
                <select id="duracao" name="duracao" value={formData.duracao} onChange={handleChange} required disabled={loading}>
                  <option value="">Selecione</option>
                  <option value="curto">45 minutos</option>
                  <option value="normal">1 hora</option>
                  <option value="longo">2 horas</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="disciplina">Quantas vezes você costuma faltar no treino?</label>
                <select id="disciplina" name="disciplina" value={formData.disciplina} onChange={handleChange} required disabled={loading}>
                  <option value="">Selecione</option>
                  <option value="frequentemente">Com frequência — é difícil manter</option>
                  <option value="intermediario">Às vezes</option>
                  <option value="raramente">Raramente — tenho boa consistência</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="variedade">Preferência por variedade nos exercícios:</label>
                <select id="variedade" name="variedade" value={formData.variedade} onChange={handleChange} required disabled={loading}>
                  <option value="">Selecione</option>
                  <option value="gosto">Gosto de variar muito</option>
                  <option value="nao">Prefiro sempre os mesmos</option>
                  <option value="intermediario">Gosto que varie um pouco</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ambiente">Ambiente principal de treino:</label>
                <select id="ambiente" name="ambiente" value={formData.ambiente} onChange={handleChange} required disabled={loading}>
                  <option value="">Selecione</option>
                  <option value="casa">Em casa</option>
                  <option value="pequena">Academia pequena</option>
                  <option value="grande">Academia grande</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="muscular">Tolerância a dor muscular no dia seguinte (DOMS):</label>
                <select id="muscular" name="muscular" value={formData.muscular} onChange={handleChange} required disabled={loading}>
                  <option value="">Selecione</option>
                  <option value="atrapalharia">Atrapalharia muito minha rotina</option>
                  <option value="pouco">Atrapalharia um pouco</option>
                  <option value="nao">Não atrapalharia nada</option>
                </select>
              </div>

              {/* Doenças crônicas */}
              <div className="form-group">
                <label htmlFor="doencaCronica">Possui alguma doença crônica? <span style={{color:'var(--accent)', fontWeight:'normal'}}>(obrigatório)</span></label>
                <select id="doencaCronica" name="doencaCronica" value={formData.doencaCronica} onChange={handleChange} required disabled={loading}>
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
              </div>

              {formData.doencaCronica === 'sim' && (
                <div className="form-group">
                  <label htmlFor="doencaDescricao">Qual(is) doença(s)? <span style={{color:'var(--text-muted)', fontWeight:'normal'}}>(ex: hipertensão, diabetes, cardiopatia…)</span></label>
                  <input
                    type="text"
                    id="doencaDescricao"
                    name="doencaDescricao"
                    placeholder="Descreva as doenças crônicas"
                    value={formData.doencaDescricao}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {/* Medicamentos de uso contínuo */}
              <div className="form-group">
                <label htmlFor="medicamento">Faz uso de medicamento contínuo? <span style={{color:'var(--accent)', fontWeight:'normal'}}>(obrigatório)</span></label>
                <select id="medicamento" name="medicamento" value={formData.medicamento} onChange={handleChange} required disabled={loading}>
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
              </div>

              {formData.medicamento === 'sim' && (
                <div className="form-group">
                  <label htmlFor="medicamentoDescricao">Qual(is) medicamento(s)?</label>
                  <input
                    type="text"
                    id="medicamentoDescricao"
                    name="medicamentoDescricao"
                    placeholder="Ex: losartana, metformina, ritalina…"
                    value={formData.medicamentoDescricao}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block btn-large"
                disabled={loading}
              >
                {loading ? '⏳ Gerando seu treino...' : '🚀 Gerar Meu Treino'}
              </button>
            </fieldset>

            {/* ── PAR-Q ── */}
            <fieldset className="fieldset-parq">
              <legend>PAR-Q — Prontidão para Atividade Física</legend>
              <p className="fieldset-desc">
                O PAR-Q é um questionário padrão internacional de segurança. Responda com honestidade —
                suas respostas ajudam a montar um treino compatível com sua saúde.
              </p>

              {formData.parqRespostas.some(r => r === 'sim') && (
                <div className="parq-aviso">
                  <strong>Atenção:</strong> Você respondeu "Sim" a uma ou mais perguntas do PAR-Q.
                  Recomendamos que consulte um médico antes de iniciar ou intensificar atividade física.
                  Você ainda pode gerar o treino, mas leve esta informação ao seu profissional de saúde.
                </div>
              )}

              <div className="parq-lista">
                {PARQ_PERGUNTAS.map((pergunta, idx) => (
                  <div key={idx} className="parq-item">
                    <p className="parq-pergunta"><strong>{idx + 1}.</strong> {pergunta}</p>
                    <div className="parq-opcoes">
                      <label className={`parq-opcao ${formData.parqRespostas[idx] === 'nao' ? 'parq-selecionado' : ''}`}>
                        <input
                          type="radio"
                          name={`parq_${idx}`}
                          value="nao"
                          checked={formData.parqRespostas[idx] === 'nao'}
                          onChange={() => handleParq(idx, 'nao')}
                          disabled={loading}
                        />
                        Não
                      </label>
                      <label className={`parq-opcao parq-sim ${formData.parqRespostas[idx] === 'sim' ? 'parq-selecionado parq-sim-selecionado' : ''}`}>
                        <input
                          type="radio"
                          name={`parq_${idx}`}
                          value="sim"
                          checked={formData.parqRespostas[idx] === 'sim'}
                          onChange={() => handleParq(idx, 'sim')}
                          disabled={loading}
                        />
                        Sim
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
            </form>
          </div>
        </>
      )}
    </>
  );

  if (embedded) {
    return <div className="workout-generator-container">{formContent}</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="workout-generator-container">
        {formContent}
      </div>
    </div>
  );
};

export default WorkoutGenerator;
