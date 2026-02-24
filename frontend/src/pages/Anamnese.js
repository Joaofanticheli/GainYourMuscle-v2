// ============================================================================
// PÁGINA ANAMNESE - Ficha de saúde e perfil físico do aluno
// Acessível SEM precisar de profissional — aluno preenche antes de buscar um
// O profissional usa esses dados para montar treino e plano nutricional
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Anamnese.css';

// ── Perguntas do PAR-Q ────────────────────────────────────────────────────────
const PARQ_PERGUNTAS = [
  'Algum médico já disse que você tem algum problema cardíaco e que só deveria praticar atividade física com supervisão médica?',
  'Você sente dor no peito quando pratica atividade física?',
  'No último mês, você teve dor no peito quando não estava praticando atividade física?',
  'Você perde o equilíbrio por causa de tontura ou já perdeu a consciência?',
  'Você tem algum problema ósseo ou articular que poderia piorar com a prática de atividade física?',
  'Algum médico já prescreveu medicamentos para sua pressão arterial ou problema cardíaco?',
  'Você conhece alguma outra razão pela qual não deveria praticar atividade física?',
];

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

const LESAO_LOCAIS = [
  { value: 'ombro',           label: 'Ombro' },
  { value: 'cotovelo_punho',  label: 'Cotovelo ou Punho' },
  { value: 'coluna_lombar',   label: 'Coluna Lombar' },
  { value: 'coluna_cervical', label: 'Pescoço / Coluna Cervical' },
  { value: 'quadril',         label: 'Quadril / Virilha' },
  { value: 'joelho',          label: 'Joelho' },
  { value: 'tornozelo',       label: 'Tornozelo ou Pé' },
];

// ── Estado inicial do formulário ──────────────────────────────────────────────
const FORM_INICIAL = {
  objetivo:          '',
  diasSelecionados:  [],
  duracao:           '',
  ambiente:          '',
  fadiga:            '',
  muscular:          '',
  disciplina:        '',
  testeFlexoes:      '',
  testeAgachamentos: '',
  testePrancha:      '',
  testeCardio:       '',
  parqRespostas:     Array(7).fill('nao'),
  doencaCronica:     'nao',
  doencaDescricao:   '',
  medicamento:       'nao',
  medicamentoDescricao: '',
  lesao:             '',
  localLesao:        '',
  lesaoDescricao:    '',
};

// ── Componente principal ──────────────────────────────────────────────────────
const Anamnese = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso]   = useState(false);
  const [erro, setErro]         = useState('');

  // Pré-preenche se o aluno já preencheu antes
  useEffect(() => {
    if (user?.anamnese) {
      setForm(prev => ({ ...prev, ...user.anamnese }));
    }
  }, [user]);

  const handle = (campo, valor) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const toggleDia = (dia) =>
    setForm(prev => {
      const atual = prev.diasSelecionados;
      return {
        ...prev,
        diasSelecionados: atual.includes(dia)
          ? atual.filter(d => d !== dia)
          : [...atual, dia],
      };
    });

  const handleParq = (idx, valor) =>
    setForm(prev => {
      const parqRespostas = [...prev.parqRespostas];
      parqRespostas[idx] = valor;
      return { ...prev, parqRespostas };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!form.objetivo) {
      setErro('Selecione seu objetivo principal.');
      return;
    }
    if (form.diasSelecionados.length === 0) {
      setErro('Selecione pelo menos um dia disponível para treino.');
      return;
    }

    setSalvando(true);
    try {
      await userAPI.saveAnamnese(form);
      setSucesso(true);
    } catch (err) {
      setErro('Erro ao salvar ficha. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  // ── Tela de sucesso ─────────────────────────────────────────────────────────
  if (sucesso) return (
    <div>
      <Navbar />
      <div className="anamnese-container">
        <div className="anamnese-sucesso">
          <div className="anamnese-sucesso-icon">📋</div>
          <h1>Ficha salva!</h1>
          <p>
            Seu profissional terá acesso a essas informações assim que aceitar
            o seu pedido de vínculo. Ele usará esses dados para montar um treino
            e plano nutricional personalizado para você.
          </p>
          <div className="anamnese-sucesso-acoes">
            <button className="btn btn-primary btn-large" onClick={() => navigate('/profissionais')}>
              Buscar Profissional
            </button>
            <button className="btn btn-outline" onClick={() => setSucesso(false)}>
              Editar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Formulário ──────────────────────────────────────────────────────────────
  return (
    <div>
      <Navbar />
      <div className="anamnese-container">
        <header className="anamnese-header">
          <h1>Minha Ficha de Saúde</h1>
          <p>Preencha com honestidade — seu profissional usará esses dados para montar seu treino</p>
        </header>

        {user?.anamnese && (
          <div className="anamnese-ja-preenchida">
            ✅ Você já preencheu sua ficha. Pode atualizar sempre que precisar.
          </div>
        )}

        <form onSubmit={handleSubmit} className="anamnese-form">
          {erro && <div className="alert alert-error">{erro}</div>}

          {/* ── SEÇÃO 1: PAR-Q ── */}
          <section className="anamnese-secao">
            <h2 className="anamnese-secao-titulo">🏥 Questionário de Saúde (PAR-Q)</h2>
            <p className="anamnese-secao-desc">
              Obrigatório por lei em academias do estado de SP. Responda com honestidade.
            </p>

            {form.parqRespostas.some(r => r === 'sim') && (
              <div className="parq-aviso">
                <strong>Atenção:</strong> Você respondeu "Sim" a uma ou mais perguntas.
                Recomendamos consultar um médico antes de iniciar atividade física intensa.
              </div>
            )}

            <div className="parq-lista">
              {PARQ_PERGUNTAS.map((pergunta, idx) => (
                <div key={idx} className="parq-item">
                  <p className="parq-pergunta"><strong>{idx + 1}.</strong> {pergunta}</p>
                  <div className="parq-opcoes">
                    {['nao', 'sim'].map(opcao => (
                      <label
                        key={opcao}
                        className={`parq-opcao ${opcao === 'sim' ? 'parq-sim' : ''} ${form.parqRespostas[idx] === opcao ? 'parq-selecionado' + (opcao === 'sim' ? ' parq-sim-selecionado' : '') : ''}`}
                      >
                        <input
                          type="radio"
                          name={`parq_${idx}`}
                          value={opcao}
                          checked={form.parqRespostas[idx] === opcao}
                          onChange={() => handleParq(idx, opcao)}
                        />
                        {opcao === 'sim' ? 'Sim' : 'Não'}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── SEÇÃO 2: Doenças e medicamentos ── */}
          <section className="anamnese-secao">
            <h2 className="anamnese-secao-titulo">💊 Doenças e Medicamentos</h2>

            <div className="form-group">
              <label>Possui alguma doença crônica?</label>
              <select value={form.doencaCronica} onChange={e => handle('doencaCronica', e.target.value)}>
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>
            {form.doencaCronica === 'sim' && (
              <div className="form-group">
                <label>Qual(is) doença(s)?</label>
                <input
                  type="text"
                  placeholder="Ex: hipertensão, diabetes, cardiopatia..."
                  value={form.doencaDescricao}
                  onChange={e => handle('doencaDescricao', e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label>Faz uso de medicamento contínuo?</label>
              <select value={form.medicamento} onChange={e => handle('medicamento', e.target.value)}>
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>
            {form.medicamento === 'sim' && (
              <div className="form-group">
                <label>Qual(is) medicamento(s)?</label>
                <input
                  type="text"
                  placeholder="Ex: losartana, metformina, clonazepam..."
                  value={form.medicamentoDescricao}
                  onChange={e => handle('medicamentoDescricao', e.target.value)}
                />
              </div>
            )}
          </section>

          {/* ── SEÇÃO 3: Limitações físicas ── */}
          <section className="anamnese-secao">
            <h2 className="anamnese-secao-titulo">🦴 Limitações Físicas</h2>

            <div className="form-group">
              <label>Possui alguma limitação física atualmente?</label>
              <select
                value={form.lesao}
                onChange={e => handle('lesao', e.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="nenhuma">Não, estou bem</option>
                <option value="leve">Sim — leve desconforto / dor ocasional</option>
                <option value="pequena">Sim — lesão diagnosticada ou dor frequente</option>
              </select>
            </div>

            {form.lesao && form.lesao !== 'nenhuma' && (
              <>
                <div className="form-group">
                  <label>Onde fica a limitação?</label>
                  <select value={form.localLesao} onChange={e => handle('localLesao', e.target.value)} required>
                    <option value="">Selecione a região</option>
                    {LESAO_LOCAIS.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Qual é o problema?</label>
                  <input
                    type="text"
                    placeholder="Ex: LCA rompido, tendinite, hérnia..."
                    value={form.lesaoDescricao}
                    onChange={e => handle('lesaoDescricao', e.target.value)}
                  />
                </div>
              </>
            )}
          </section>

          {/* ── SEÇÃO 4: Objetivo ── */}
          <section className="anamnese-secao">
            <h2 className="anamnese-secao-titulo">🎯 Objetivo Principal</h2>

            <div className="anamnese-objetivo-grid">
              {[
                { value: 'hipertrofia',    icon: '💪', label: 'Ganhar Músculo'     },
                { value: 'emagrecimento',  icon: '🔥', label: 'Emagrecer'          },
                { value: 'forca',          icon: '🏋️', label: 'Ganhar Força'       },
                { value: 'condicionamento',icon: '🏃', label: 'Condicionamento'    },
                { value: 'saude_geral',    icon: '❤️', label: 'Saúde Geral'        },
                { value: 'esporte',        icon: '🏅', label: 'Esporte Específico' },
              ].map(({ value, icon, label }) => (
                <label
                  key={value}
                  className={`anamnese-objetivo-card ${form.objetivo === value ? 'selecionado' : ''}`}
                >
                  <input
                    type="radio"
                    name="objetivo"
                    value={value}
                    checked={form.objetivo === value}
                    onChange={() => handle('objetivo', value)}
                  />
                  <span className="obj-icon">{icon}</span>
                  <span className="obj-label">{label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* ── SEÇÃO 5: Disponibilidade ── */}
          <section className="anamnese-secao">
            <h2 className="anamnese-secao-titulo">📅 Disponibilidade e Rotina</h2>

            <div className="form-group">
              <label>Quais dias você pode treinar?</label>
              <div className="dias-selector">
                {DIAS_SEMANA.map(dia => (
                  <button
                    key={dia}
                    type="button"
                    className={`dia-btn ${form.diasSelecionados.includes(dia) ? 'dia-btn-ativo' : ''}`}
                    onClick={() => toggleDia(dia)}
                  >
                    {dia}
                  </button>
                ))}
              </div>
              {form.diasSelecionados.length > 0 && (
                <p className="dias-selecionados-info">
                  {form.diasSelecionados.length} dias: {form.diasSelecionados.join(', ')}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Duração preferida do treino</label>
              <select value={form.duracao} onChange={e => handle('duracao', e.target.value)}>
                <option value="">Selecione</option>
                <option value="curto">45 minutos</option>
                <option value="normal">1 hora</option>
                <option value="longo">2 horas</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ambiente de treino</label>
              <select value={form.ambiente} onChange={e => handle('ambiente', e.target.value)}>
                <option value="">Selecione</option>
                <option value="casa">Em casa</option>
                <option value="pequena">Academia pequena</option>
                <option value="grande">Academia grande</option>
              </select>
            </div>

            <div className="form-group">
              <label>Preferência de intensidade</label>
              <select value={form.fadiga} onChange={e => handle('fadiga', e.target.value)}>
                <option value="">Selecione</option>
                <option value="evito">Prefiro treinar com moderação</option>
                <option value="consigo">Boa intensidade, mas respeito meus limites</option>
                <option value="nao">Gosto de me desafiar ao limite</option>
              </select>
            </div>

            <div className="form-group">
              <label>Com que frequência você costuma faltar?</label>
              <select value={form.disciplina} onChange={e => handle('disciplina', e.target.value)}>
                <option value="">Selecione</option>
                <option value="frequentemente">Com frequência</option>
                <option value="intermediario">Às vezes</option>
                <option value="raramente">Raramente — sou consistente</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tolerância a dor muscular no dia seguinte (DOMS)</label>
              <select value={form.muscular} onChange={e => handle('muscular', e.target.value)}>
                <option value="">Selecione</option>
                <option value="atrapalharia">Atrapalharia muito minha rotina</option>
                <option value="pouco">Atrapalharia um pouco</option>
                <option value="nao">Não atrapalharia nada</option>
              </select>
            </div>
          </section>

          {/* ── SEÇÃO 6: Testes físicos ── */}
          <section className="anamnese-secao">
            <h2 className="anamnese-secao-titulo">📊 Avaliação de Condicionamento</h2>
            <p className="anamnese-secao-desc">
              Testes validados pelo ACSM. Faça ou estime com honestidade — ajudam o profissional a entender seu nível real.
            </p>

            <div className="form-group">
              <label>💪 Flexões até a falha</label>
              <select value={form.testeFlexoes} onChange={e => handle('testeFlexoes', e.target.value)}>
                <option value="">Selecione</option>
                <option value="0a10">0 a 10 repetições</option>
                <option value="11a20">11 a 20 repetições</option>
                <option value="21a30">21 a 30 repetições</option>
                <option value="31a40">31 a 40 repetições</option>
                <option value="41mais">41 ou mais repetições</option>
              </select>
            </div>

            <div className="form-group">
              <label>🦵 Agachamentos livres até a falha</label>
              <select value={form.testeAgachamentos} onChange={e => handle('testeAgachamentos', e.target.value)}>
                <option value="">Selecione</option>
                <option value="0a15">0 a 15 repetições</option>
                <option value="16a25">16 a 25 repetições</option>
                <option value="26a35">26 a 35 repetições</option>
                <option value="36a50">36 a 50 repetições</option>
                <option value="51mais">51 ou mais repetições</option>
              </select>
            </div>

            <div className="form-group">
              <label>🧱 Prancha isométrica</label>
              <select value={form.testePrancha} onChange={e => handle('testePrancha', e.target.value)}>
                <option value="">Selecione</option>
                <option value="menos30s">Menos de 30 segundos</option>
                <option value="30a60s">30 a 60 segundos</option>
                <option value="1a2min">1 a 2 minutos</option>
                <option value="mais2min">Mais de 2 minutos</option>
              </select>
            </div>

            <div className="form-group">
              <label>🏃 Resistência cardiovascular</label>
              <select value={form.testeCardio} onChange={e => handle('testeCardio', e.target.value)}>
                <option value="">Selecione</option>
                <option value="menos5min">Menos de 5 minutos correndo sem parar</option>
                <option value="5a15min">5 a 15 minutos</option>
                <option value="15a30min">15 a 30 minutos</option>
                <option value="mais30min">Mais de 30 minutos</option>
              </select>
            </div>
          </section>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-large"
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : '💾 Salvar Minha Ficha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Anamnese;
