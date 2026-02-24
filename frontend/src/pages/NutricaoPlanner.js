// ============================================================================
// PÁGINA NUTRIÇÃO — Questionário + Plano gerado pela IA
// ============================================================================

import React, { useState, useEffect } from 'react';
import { nutritionAPI } from '../services/api';
import Navbar from '../components/Navbar';
import ProfissionalGate from '../components/ProfissionalGate';
import '../styles/NutricaoPlanner.css';

// ── Ícones ────────────────────────────────────────────────────────────────────
const MacroBar = ({ label, valor, total, cor }) => {
  const pct = total > 0 ? Math.round((valor * 4 / total) * 100) : 0;
  return (
    <div className="macro-bar-item">
      <div className="macro-bar-header">
        <span className="macro-bar-label">{label}</span>
        <span className="macro-bar-valor">{valor}g</span>
      </div>
      <div className="macro-bar-track">
        <div className="macro-bar-fill" style={{ width: `${pct}%`, background: cor }} />
      </div>
      <span className="macro-bar-pct">{pct}%</span>
    </div>
  );
};

// ── Objetivo cards ────────────────────────────────────────────────────────────
const OBJETIVOS = [
  { value: 'emagrecimento', icon: '🔥', label: 'Emagrecer',       desc: 'Perder gordura corporal'          },
  { value: 'ganho_massa',   icon: '💪', label: 'Ganhar Massa',     desc: 'Aumentar músculo e peso'          },
  { value: 'recomposicao',  icon: '🔄', label: 'Recomposição',     desc: 'Perder gordura e ganhar músculo'  },
  { value: 'manutencao',    icon: '⚖️', label: 'Manutenção',       desc: 'Manter peso e composição'         },
  { value: 'saude_geral',   icon: '❤️', label: 'Saúde Geral',      desc: 'Qualidade de vida e longevidade'  },
  { value: 'performance',   icon: '🏅', label: 'Performance',       desc: 'Combustível para treino/esporte'  },
];

// ── Componente principal ──────────────────────────────────────────────────────
const NutricaoPlanner = () => {
  const [etapa, setEtapa] = useState('questionario'); // 'questionario' | 'gerando' | 'plano'
  const [planoSalvo, setPlanoSalvo] = useState(null);
  const [plano, setPlano] = useState(null);
  const [loadingPlano, setLoadingPlano] = useState(true);
  const [error, setError] = useState('');
  const [refeicaoAberta, setRefeicaoAberta] = useState(0);

  // Chat IA
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [form, setForm] = useState({
    objetivo:      '',
    restricao:     'nenhuma',
    atividade:     'moderado',
    refeicoes:     '4_5',
    tempoCozinhar: 'medio',
    foraLar:       'raramente',
    saude:         'nenhuma',
    suplementos:   'nenhum',
    orcamento:     'moderado',
    dietaAnterior: 'nunca',
  });

  // Carrega plano salvo ao montar — se existir, mostra direto
  useEffect(() => {
    nutritionAPI.getPlan()
      .then(r => {
        if (r.data.plano) {
          setPlanoSalvo(r.data.plano);
          setPlano(r.data.plano);
          setEtapa('plano');
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPlano(false));
  }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.objetivo) { setError('Selecione seu objetivo principal.'); return; }
    setError('');
    setEtapa('gerando');
    try {
      const res = await nutritionAPI.generate(form);
      setPlano(res.data.plano);
      setPlanoSalvo(res.data.plano);
      setEtapa('plano');
      setRefeicaoAberta(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao gerar plano. Tente novamente.');
      setEtapa('questionario');
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    const novasMsgs = [...chatMsgs, { role: 'user', content: msg }];
    setChatMsgs(novasMsgs);
    setChatLoading(true);
    try {
      const res = await nutritionAPI.modify(plano, msg);
      setPlano(res.data.plano);
      setPlanoSalvo(res.data.plano);
      setChatMsgs([...novasMsgs, { role: 'assistant', content: res.data.mensagem }]);
    } catch {
      setChatMsgs([...novasMsgs, { role: 'assistant', content: 'Erro ao modificar plano. Tente novamente.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Loading inicial ────────────────────────────────────────────────────────
  if (loadingPlano) {
    return (
      <div>
        <Navbar />
        <div className="nutricao-container">
          <div className="loading">Carregando seu plano nutricional...</div>
        </div>
      </div>
    );
  }

  // ── Tela gerando ──────────────────────────────────────────────────────────
  if (etapa === 'gerando') {
    return (
      <div>
        <Navbar />
        <div className="nutricao-container">
          <div className="nutricao-gerando">
            <div className="nutricao-gerando-icon">🥗</div>
            <h2>Calculando seu plano nutricional...</h2>
            <p>Nossa IA especialista em nutrição esportiva está montando um plano personalizado para você.</p>
            <div className="nutricao-gerando-steps">
              <span>Calculando necessidades calóricas</span>
              <span>Distribuindo macronutrientes</span>
              <span>Montando refeições</span>
              <span>Verificando micronutrientes</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Tela do plano ─────────────────────────────────────────────────────────
  if (etapa === 'plano' && plano) {
    const gorduraCal = plano.macros.gordura * 9;
    const totalCal = (plano.macros.proteina * 4) + (plano.macros.carboidrato * 4) + gorduraCal;

    return (
      <div>
        <Navbar />
        <div className="nutricao-container">

          {/* Header */}
          <div className="nutricao-plano-header">
            <div>
              <h1>{plano.titulo}</h1>
              <p className="nutricao-plano-desc">{plano.descricao}</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setEtapa('questionario')}>
              Gerar Novo Plano
            </button>
          </div>

          {/* Cálculo de água */}
          {plano.aguaDiaria && (
            <div className="card nutricao-agua-card">
              <div className="nutricao-agua-icon">💧</div>
              <div className="nutricao-agua-info">
                <strong>{plano.aguaDiaria}ml</strong>
                <span>de água por dia</span>
                <p>{plano.aguaDicaContexto || `Baseado no seu peso corporal (35ml/kg). Aumente em dias de treino intenso.`}</p>
              </div>
            </div>
          )}

          {/* Resumo calórico */}
          <div className="card nutricao-resumo-card">
            <div className="nutricao-calorias-total">
              <span className="nutricao-cal-numero">{plano.calorias}</span>
              <span className="nutricao-cal-label">kcal / dia</span>
            </div>
            <div className="nutricao-macros-bars">
              <MacroBar label="Proteína" valor={plano.macros.proteina} total={totalCal} cor="var(--primary)" />
              <MacroBar label="Carboidrato" valor={plano.macros.carboidrato} total={totalCal} cor="var(--secondary)" />
              <MacroBar
                label="Gordura"
                valor={plano.macros.gordura}
                total={totalCal}
                cor="#f59e0b"
              />
            </div>
            {plano.macros.fibraMinima && (
              <p className="nutricao-fibra-info">Fibra mínima diária: <strong>{plano.macros.fibraMinima}g</strong></p>
            )}
          </div>

          {/* Refeições */}
          <div className="nutricao-section-title">
            <h2>Refeições do Dia</h2>
          </div>

          {plano.refeicoes.map((ref, i) => (
            <div className="card nutricao-refeicao-card" key={i}>
              <button
                className="nutricao-refeicao-toggle"
                onClick={() => setRefeicaoAberta(refeicaoAberta === i ? -1 : i)}
              >
                <div className="nutricao-ref-header-left">
                  <span className="nutricao-ref-num">{i + 1}</span>
                  <div>
                    <strong>{ref.nome}</strong>
                    {ref.horario && <span className="nutricao-ref-hora">{ref.horario}</span>}
                  </div>
                </div>
                <div className="nutricao-ref-header-right">
                  <span className="nutricao-ref-cal">{ref.calorias} kcal</span>
                  <span className="nutricao-ref-arrow">{refeicaoAberta === i ? '▲' : '▼'}</span>
                </div>
              </button>

              {refeicaoAberta === i && (
                <div className="nutricao-refeicao-body">
                  {ref.macros && (
                    <div className="nutricao-ref-macros">
                      <span>P: <strong>{ref.macros.proteina}g</strong></span>
                      <span>C: <strong>{ref.macros.carbo}g</strong></span>
                      <span>G: <strong>{ref.macros.gordura}g</strong></span>
                    </div>
                  )}

                  <div className="nutricao-alimentos-lista">
                    {ref.alimentos.map((al, j) => (
                      <div className="nutricao-alimento-row" key={j}>
                        <div className="nutricao-alimento-info">
                          <span className="nutricao-alimento-nome">{al.item}</span>
                          <span className="nutricao-alimento-qtd">{al.quantidade}</span>
                        </div>
                        <div className="nutricao-alimento-right">
                          {al.proteina > 0 && <span className="nutricao-alimento-prot">{al.proteina}g prot.</span>}
                          <span className="nutricao-alimento-cal">{al.calorias} kcal</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {ref.opcaoSubstituta && (
                    <div className="nutricao-substituta">
                      <span className="nutricao-substituta-label">Substituto:</span>
                      <span>{ref.opcaoSubstituta}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Suplementação */}
          {plano.suplementacao && plano.suplementacao.length > 0 && (
            <>
              <div className="nutricao-section-title"><h2>Suplementação Recomendada</h2></div>
              <div className="card">
                {plano.suplementacao.map((sup, i) => (
                  <div className="nutricao-sup-item" key={i}>
                    <div className="nutricao-sup-nome">{typeof sup === 'string' ? sup : sup.nome}</div>
                    {typeof sup === 'object' && (
                      <div className="nutricao-sup-detalhe">
                        {sup.dose && <span className="nutricao-sup-badge">{sup.dose}</span>}
                        {sup.horario && <span>{sup.horario}</span>}
                        {sup.motivo && <p className="nutricao-sup-motivo">{sup.motivo}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Dicas */}
          {plano.dicas && plano.dicas.length > 0 && (
            <>
              <div className="nutricao-section-title"><h2>Dicas Importantes</h2></div>
              <div className="card">
                <ul className="nutricao-dicas-lista">
                  {plano.dicas.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            </>
          )}

          {/* Micronutrientes */}
          {plano.micronutrientesDestaque && plano.micronutrientesDestaque.length > 0 && (
            <>
              <div className="nutricao-section-title"><h2>Micronutrientes em Destaque</h2></div>
              <div className="card">
                <div className="nutricao-micro-grid">
                  {plano.micronutrientesDestaque.map((m, i) => (
                    <div className="nutricao-micro-item" key={i}>
                      <strong>{m.nutriente}</strong>
                      <span>{m.fonte}</span>
                      <p>{m.importancia}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Guia fora de casa */}
          {plano.guiaForaDeCasa && (
            <>
              <div className="nutricao-section-title"><h2>Guia para Comer Fora</h2></div>
              <div className="card nutricao-fora-card">
                <p>{plano.guiaForaDeCasa}</p>
              </div>
            </>
          )}

          {/* Aviso médico */}
          <div className="nutricao-aviso-medico">
            <span>⚕️</span>
            <p>{plano.avisoMedico}</p>
          </div>

          {/* Chat IA — ajuste de dieta */}
          <div className="nutricao-chat-section">
            <div className="nutricao-chat-header">
              <h3>💬 Ajustar minha dieta</h3>
              <p>Peça ao seu nutricionista IA para fazer mudanças no plano</p>
            </div>

            {chatMsgs.length > 0 && (
              <div className="nutricao-chat-msgs">
                {chatMsgs.map((msg, i) => (
                  <div key={i} className={`nutricao-chat-msg nutricao-chat-msg-${msg.role}`}>
                    <div className="nutricao-chat-bubble">{msg.content}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="nutricao-chat-msg nutricao-chat-msg-assistant">
                    <div className="nutricao-chat-bubble nutricao-chat-typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <form className="nutricao-chat-form" onSubmit={handleChatSubmit}>
              <div className="nutricao-chat-sugestoes">
                {['Substituir frango por ovo', 'Opção vegetariana para o almoço', 'Mais calorias no pré-treino', 'Remover laticínios'].map(s => (
                  <button key={s} type="button" className="nutricao-chat-sugestao"
                    onClick={() => setChatInput(s)}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="nutricao-chat-input-row">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ex: Quero trocar o arroz por batata-doce..."
                  disabled={chatLoading}
                />
                <button type="submit" className="btn btn-primary" disabled={chatLoading || !chatInput.trim()}>
                  {chatLoading ? '...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Questionário ──────────────────────────────────────────────────────────
  return (
    <div>
      <Navbar />
      <div className="nutricao-container">
        <header className="nutricao-header">
          <h1>Plano Nutricional Personalizado</h1>
          <p>Responda o questionário e nossa IA especialista em nutrição esportiva monta seu plano</p>
        </header>

        {planoSalvo && (
          <div className="nutricao-plano-existente">
            <span>Você já tem um plano gerado em {new Date(planoSalvo.geradoEm).toLocaleDateString('pt-BR')}.</span>
            <button className="btn btn-outline btn-sm" onClick={() => { setPlano(planoSalvo); setEtapa('plano'); }}>
              Ver Plano Atual
            </button>
          </div>
        )}

        <div className="nutricao-content">
          {/* Painel lateral */}
          <div className="nutricao-info">
            <h2>Por que este questionário?</h2>
            <p>
              Nossa IA nutricionista usa ciência de ponta para calcular suas necessidades
              calóricas exatas, distribuir macronutrientes de forma ideal e montar refeições
              práticas para o seu estilo de vida.
            </p>
            <p>
              O plano considera seu objetivo, restrições alimentares, tempo disponível
              e condições de saúde — sem nenhum achismo.
            </p>
            <p>
              Você receberá calorias, macros, refeições detalhadas com quantidades,
              suplementação baseada em evidências e dicas de micronutrientes.
            </p>
            <p className="nutricao-trust"><strong>Nutrição séria, resultado real.</strong></p>
          </div>

          <form className="nutricao-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            {/* ── OBJETIVO PRINCIPAL ── */}
            <fieldset className="fieldset-objetivo-nutri">
              <legend>Qual é o seu objetivo nutricional?</legend>
              <p className="fieldset-desc">Esta resposta define toda a estrutura calórica e de macros do seu plano.</p>
              <div className="objetivo-grid">
                {OBJETIVOS.map(({ value, icon, label, desc }) => (
                  <label
                    key={value}
                    className={`objetivo-card ${form.objetivo === value ? 'objetivo-selecionado' : ''}`}
                  >
                    <input
                      type="radio"
                      name="objetivo"
                      value={value}
                      checked={form.objetivo === value}
                      onChange={handleChange}
                    />
                    <span className="objetivo-icon">{icon}</span>
                    <span className="objetivo-label">{label}</span>
                    <span className="objetivo-desc">{desc}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* ── REFINAMENTO ── */}
            <fieldset>
              <legend>Ajuste fino do seu plano</legend>
              <p className="fieldset-desc">Quanto mais detalhado, mais preciso e personalizado será o resultado.</p>

              <div className="form-group">
                <label htmlFor="restricao">Restrições alimentares:</label>
                <select id="restricao" name="restricao" value={form.restricao} onChange={handleChange}>
                  <option value="nenhuma">Nenhuma — como de tudo</option>
                  <option value="vegetariano">Vegetariano (sem carnes, mas com ovos e laticínios)</option>
                  <option value="vegano">Vegano (nada de origem animal)</option>
                  <option value="sem_gluten">Sem glúten (doença celíaca ou sensibilidade)</option>
                  <option value="sem_lactose">Sem lactose (intolerância à lactose)</option>
                  <option value="multipla">Múltiplas restrições</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="atividade">Nível de atividade física atual:</label>
                <select id="atividade" name="atividade" value={form.atividade} onChange={handleChange}>
                  <option value="sedentario">Sedentário — trabalho sentado, sem exercícios regulares</option>
                  <option value="leve">Levemente ativo — exercício 1-3x por semana</option>
                  <option value="moderado">Moderadamente ativo — exercício 4-5x por semana</option>
                  <option value="muito_ativo">Muito ativo — treino intenso diário ou 2x ao dia</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="refeicoes">Quantas refeições por dia você prefere?</label>
                <select id="refeicoes" name="refeicoes" value={form.refeicoes} onChange={handleChange}>
                  <option value="2_3">2 a 3 refeições (estilo mais prático)</option>
                  <option value="4_5">4 a 5 refeições (padrão equilibrado)</option>
                  <option value="6_mais">6 ou mais refeições (protocolo clássico)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tempoCozinhar">Tempo disponível para cozinhar:</label>
                <select id="tempoCozinhar" name="tempoCozinhar" value={form.tempoCozinhar} onChange={handleChange}>
                  <option value="pouco">Pouco tempo — refeições rápidas (até 20 min)</option>
                  <option value="medio">Tempo médio — consigo cozinhar quando necessário</option>
                  <option value="bastante">Bastante tempo — gosto de cozinhar</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="foraLar">Com que frequência você come fora de casa?</label>
                <select id="foraLar" name="foraLar" value={form.foraLar} onChange={handleChange}>
                  <option value="raramente">Raramente — como quase sempre em casa</option>
                  <option value="as_vezes">Às vezes — 1 a 3 refeições por semana fora</option>
                  <option value="frequentemente">Frequentemente — a maioria das refeições é fora</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="saude">Condições de saúde relevantes:</label>
                <select id="saude" name="saude" value={form.saude} onChange={handleChange}>
                  <option value="nenhuma">Nenhuma — estou saudável</option>
                  <option value="diabetes">Diabetes tipo 2 ou pré-diabetes</option>
                  <option value="hipertensao">Hipertensão arterial (pressão alta)</option>
                  <option value="colesterol">Colesterol elevado</option>
                  <option value="tireoide">Hipotireoidismo</option>
                  <option value="intestino">Síndrome do intestino irritável</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="suplementos">Suplementação que você já usa:</label>
                <select id="suplementos" name="suplementos" value={form.suplementos} onChange={handleChange}>
                  <option value="nenhum">Não uso suplementos</option>
                  <option value="whey">Whey protein</option>
                  <option value="creatina">Creatina</option>
                  <option value="multi">Multivitamínico</option>
                  <option value="combo">Proteína em pó + creatina</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="orcamento">Orçamento alimentar:</label>
                <select id="orcamento" name="orcamento" value={form.orcamento} onChange={handleChange}>
                  <option value="economico">Econômico — prefiro alimentos mais acessíveis</option>
                  <option value="moderado">Moderado — balanço entre custo e variedade</option>
                  <option value="livre">Sem restrição — priorizo qualidade máxima</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dietaAnterior">Experiência anterior com dieta:</label>
                <select id="dietaAnterior" name="dietaAnterior" value={form.dietaAnterior} onChange={handleChange}>
                  <option value="nunca">Nunca segui uma dieta estruturada</option>
                  <option value="low_carb">Já tentei low carb</option>
                  <option value="cetogenica">Já tentei cetogênica (keto)</option>
                  <option value="jejum">Já pratiquei jejum intermitente</option>
                  <option value="contagem">Já fiz contagem de calorias e macros</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-large">
                🥗 Gerar Meu Plano Nutricional
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

const NutricaoPlannerGated = () => (
  <ProfissionalGate tipo="nutricao">
    <NutricaoPlanner />
  </ProfissionalGate>
);

export default NutricaoPlannerGated;
