// ============================================================================
// PÁGINA GERADOR DE TREINO - Questionário e Geração
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { workoutAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { WorkoutManual } from './WorkoutManual';
import ProfissionalGate from '../components/ProfissionalGate';
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
  const [searchParams] = useSearchParams();
  const clienteId   = searchParams.get('cliente');
  const clienteNome = searchParams.get('clienteNome');
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [celebrando, setCelebrando] = useState(false);
  const [dadosCelebracao, setDadosCelebracao] = useState({});
  const [abaAtiva, setAbaAtiva] = useState('gerar');
  const [anamnesePreenchida, setAnamnesePreenchida] = useState(false);

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
    testeFlexoes:      '',
    testeAgachamentos: '',
    testePrancha:      '',
    testeCardio:       '',
    fadiga:            '',
    lesao:             '',
    localLesao:        '',
    lesaoDescricao:    '',
    duracao:           '',
    disciplina:        '',
    ambiente:          '',
    muscular:          '',
    parqRespostas:     Array(7).fill('nao'),
    doencaCronica:     'nao',
    doencaDescricao:   '',
    medicamento:       'nao',
    medicamentoDescricao: '',
  });

  // Pré-preenche campos de anamnese se o aluno já tiver a ficha salva
  useEffect(() => {
    if (user?.anamnese && typeof user.anamnese === 'object') {
      const a = user.anamnese;
      setFormData(prev => ({
        ...prev,
        parqRespostas:        a.parqRespostas        || Array(7).fill('nao'),
        doencaCronica:        a.doencaCronica        || 'nao',
        doencaDescricao:      a.doencaDescricao      || '',
        medicamento:          a.medicamento          || 'nao',
        medicamentoDescricao: a.medicamentoDescricao || '',
        lesao:                a.lesao                || '',
        localLesao:           a.localLesao           || '',
        lesaoDescricao:       a.lesaoDescricao       || '',
      }));
      setAnamnesePreenchida(true);
    }
  }, [user]);

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

  const calcularNivel = (flexoes, agachamentos, prancha, cardio) => {
    const ptsFlex = { '0a10': 0, '11a20': 1, '21a30': 2, '31a40': 3, '41mais': 4 };
    const ptsAq   = { '0a15': 0, '16a25': 1, '26a35': 2, '36a50': 3, '51mais': 4 };
    const ptsPr   = { 'menos30s': 0, '30a60s': 1, '1a2min': 2, 'mais2min': 3 };
    const ptsCa   = { 'menos5min': 0, '5a15min': 1, '15a30min': 2, 'mais30min': 3 };
    const total = (ptsFlex[flexoes] ?? 0) + (ptsAq[agachamentos] ?? 0) + (ptsPr[prancha] ?? 0) + (ptsCa[cardio] ?? 0);
    if (total >= 11) return 'avancada';
    if (total >= 6)  return 'intermediaria';
    if (total >= 2)  return 'novato';
    return 'nunca';
  };

  const NIVEL_LABELS = {
    nunca:        '🟡 Iniciante',
    novato:       '🟢 Novato',
    intermediaria:'🔵 Intermediário',
    avancada:     '🔴 Avançado',
  };

  const nivelCalculado =
    formData.testeFlexoes && formData.testeAgachamentos && formData.testePrancha && formData.testeCardio
      ? calcularNivel(formData.testeFlexoes, formData.testeAgachamentos, formData.testePrancha, formData.testeCardio)
      : null;

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
      const experiencia = calcularNivel(
        formData.testeFlexoes, formData.testeAgachamentos,
        formData.testePrancha, formData.testeCardio
      );
      const params = {
        ...formData,
        experiencia,
        diasTreino: formData.diasSelecionados.length,
        diasSelecionados: formData.diasSelecionados,
        ...(clienteId ? { clienteId } : {}),
      };
      const response = await workoutAPI.generate(params);
      if (response.data.success) {
        if (clienteId) {
          navigate('/dashboard-profissional');
        } else if (embedded && onSuccess) {
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
    const celebracaoContent = (
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
            <button className="btn btn-primary btn-large" onClick={() => navigate('/perfil')}>
              Registrar Dia 1
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/meu-treino')}>
              Ver Meu Treino
            </button>
          </div>
        </div>
      </div>
    );
    if (embedded) return celebracaoContent;
    return <div><Navbar />{celebracaoContent}</div>;
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

      {clienteNome && (
        <div className="banner-cliente-prof">
          👤 Montando treino para <strong>{clienteNome}</strong>
        </div>
      )}

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

            {/* ── 1. ANAMNESE DE SAÚDE ── */}
            {anamnesePreenchida ? (
              <div className="anamnese-ja-preenchida">
                <span className="anamnese-check">✅</span>
                <div>
                  <strong>Ficha de saúde já preenchida</strong>
                  <p>Seus dados de saúde estão salvos e serão usados na geração do treino.</p>
                </div>
                <button
                  type="button"
                  className="btn-atualizar-anamnese"
                  onClick={() => setAnamnesePreenchida(false)}
                >
                  Atualizar ficha
                </button>
              </div>
            ) : (
            <fieldset className="fieldset-parq">
              <legend>🏥 Anamnese de Saúde</legend>
              <p className="fieldset-desc">
                Preencha com honestidade. Estas informações são essenciais para garantir sua segurança
                e montar um treino adequado à sua condição de saúde.
              </p>

              {/* PAR-Q */}
              <div className="parq-secao-titulo">PAR-Q — Questionário de Prontidão para Atividade Física</div>
              <p className="parq-secao-desc">Obrigatório por lei em academias do estado de SP e recomendado em todo o Brasil.</p>

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

              {/* Doenças crônicas */}
              <div className="parq-secao-titulo" style={{marginTop:'20px'}}>Doenças e Condições de Saúde</div>

              <div className="form-group">
                <label htmlFor="doencaCronica">Possui alguma doença crônica?</label>
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

              {/* Medicamentos */}
              <div className="form-group">
                <label htmlFor="medicamento">Faz uso de medicamento contínuo?</label>
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
                    placeholder="Ex: losartana, metformina, clonazepam…"
                    value={formData.medicamentoDescricao}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {/* Limitação física */}
              <div className="parq-secao-titulo" style={{marginTop:'20px'}}>Limitações Físicas e Ortopédicas</div>

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
                    <label htmlFor="lesaoDescricao">Qual é o problema? <span style={{color:'var(--text-muted)', fontWeight:'normal'}}>(ex: LCA rompido, tendinite, hérnia…)</span></label>
                    <input
                      type="text"
                      id="lesaoDescricao"
                      name="lesaoDescricao"
                      placeholder="Descreva brevemente o problema ortopédico"
                      value={formData.lesaoDescricao}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
            </fieldset>
            )}

            {/* ── 2. OBJETIVO ── */}
            <fieldset className="fieldset-objetivo">
              <legend>Qual é o seu objetivo?</legend>
              <p className="fieldset-desc">Esta escolha define toda a estrutura do seu programa.</p>

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

              {formData.objetivo === 'esporte' && (
                <div className="esporte-section">
                  <h4>Qual esporte você pratica?</h4>
                  <div className="form-group">
                    <label htmlFor="esporte">Selecione o esporte</label>
                    <select id="esporte" name="esporte" value={formData.esporte} onChange={handleChange} required disabled={loading}>
                      <option value="">Selecione...</option>
                      {Object.entries(esportesConfig).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                  {formData.esporte && (
                    <div className="form-group">
                      <label htmlFor="posicao">Qual é a sua posição?</label>
                      <select id="posicao" name="posicao" value={formData.posicao} onChange={handleChange} required disabled={loading}>
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

            {/* ── 3. AJUSTE DO TREINO ── */}
            <fieldset>
              <legend>Detalhes do Treino</legend>
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

              {/* ── AVALIAÇÃO DE CONDICIONAMENTO (testes científicos ACSM) ── */}
              <div className="avaliacao-bloco">
                <div className="avaliacao-header">
                  <span className="avaliacao-titulo-icone">📊</span>
                  <div>
                    <strong>Avaliação de Condicionamento Físico</strong>
                    <p className="avaliacao-subtitulo">
                      Testes validados cientificamente (ACSM) para medir seu nível real.
                      Resultados objetivos geram um treino muito mais preciso.
                    </p>
                  </div>
                </div>
                <div className="avaliacao-dica">
                  Faça cada teste antes de responder, ou estime com honestidade. Pare assim que a execução ficar incorreta.
                </div>
                <div className="form-group">
                  <label htmlFor="testeFlexoes">
                    💪 Flexões até a falha
                    <span className="avaliacao-instrucao">Homens: apoio nas palmas e pés | Mulheres: apoio nos joelhos é válido</span>
                  </label>
                  <select id="testeFlexoes" name="testeFlexoes" value={formData.testeFlexoes} onChange={handleChange} required disabled={loading}>
                    <option value="">Selecione</option>
                    <option value="0a10">0 a 10 repetições</option>
                    <option value="11a20">11 a 20 repetições</option>
                    <option value="21a30">21 a 30 repetições</option>
                    <option value="31a40">31 a 40 repetições</option>
                    <option value="41mais">41 ou mais repetições</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="testeAgachamentos">
                    🦵 Agachamentos livres até a falha
                    <span className="avaliacao-instrucao">Pés na largura dos ombros, descer até coxa paralela ao chão, costas retas</span>
                  </label>
                  <select id="testeAgachamentos" name="testeAgachamentos" value={formData.testeAgachamentos} onChange={handleChange} required disabled={loading}>
                    <option value="">Selecione</option>
                    <option value="0a15">0 a 15 repetições</option>
                    <option value="16a25">16 a 25 repetições</option>
                    <option value="26a35">26 a 35 repetições</option>
                    <option value="36a50">36 a 50 repetições</option>
                    <option value="51mais">51 ou mais repetições</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="testePrancha">
                    🧱 Prancha isométrica (core)
                    <span className="avaliacao-instrucao">Apoio nos antebraços e pontas dos pés, corpo reto — pare quando a postura ceder</span>
                  </label>
                  <select id="testePrancha" name="testePrancha" value={formData.testePrancha} onChange={handleChange} required disabled={loading}>
                    <option value="">Selecione</option>
                    <option value="menos30s">Menos de 30 segundos</option>
                    <option value="30a60s">30 a 60 segundos</option>
                    <option value="1a2min">1 a 2 minutos</option>
                    <option value="mais2min">Mais de 2 minutos</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="testeCardio">
                    🏃 Resistência cardiovascular
                    <span className="avaliacao-instrucao">Quanto tempo você consegue correr ou caminhar rápido sem parar?</span>
                  </label>
                  <select id="testeCardio" name="testeCardio" value={formData.testeCardio} onChange={handleChange} required disabled={loading}>
                    <option value="">Selecione</option>
                    <option value="menos5min">Menos de 5 minutos</option>
                    <option value="5a15min">5 a 15 minutos</option>
                    <option value="15a30min">15 a 30 minutos</option>
                    <option value="mais30min">Mais de 30 minutos</option>
                  </select>
                </div>
                {nivelCalculado && (
                  <div className="nivel-calculado">
                    <span>Seu nível estimado:</span>
                    <strong>{NIVEL_LABELS[nivelCalculado]}</strong>
                  </div>
                )}
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

              <button
                type="submit"
                className="btn btn-primary btn-block btn-large"
                disabled={loading}
              >
                {loading ? '⏳ Gerando seu treino...' : '🚀 Gerar Meu Treino'}
              </button>
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

const WorkoutGeneratorGated = ({ embedded, onSuccess }) => (
  <ProfissionalGate tipo="treino" embedded={embedded}>
    <WorkoutGenerator embedded={embedded} onSuccess={onSuccess} />
  </ProfissionalGate>
);

export default WorkoutGeneratorGated;
