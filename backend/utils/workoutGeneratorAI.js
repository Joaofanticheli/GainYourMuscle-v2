// ============================================================================
// GERADOR DE TREINO COM IA — Groq (Llama 3.3 70B)
// ============================================================================

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Labels legíveis para o prompt ────────────────────────────────────────────
const LABELS = {
  objetivo: {
    hipertrofia:    'Ganhar massa muscular (hipertrofia)',
    forca:          'Ganhar força máxima',
    emagrecimento:  'Emagrecer e queimar gordura',
    condicionamento:'Melhorar condicionamento físico',
    saude_geral:    'Saúde geral e qualidade de vida',
  },
  experiencia: {
    nunca:          'Nunca treinou musculação (iniciante absoluto)',
    novato:         'Novato (menos de 1 ano de treino)',
    intermediaria:  'Intermediário (1-3 anos de treino)',
    avancada:       'Avançado (mais de 3 anos de treino)',
  },
  ambiente: {
    casa:    'Em casa — sem equipamentos, apenas peso corporal',
    pequena: 'Academia pequena — halteres, barras e máquinas básicas',
    grande:  'Academia completa — todos os equipamentos disponíveis',
  },
  duracao: {
    curto:  '45 minutos (treino rápido)',
    normal: '1 hora',
    longo:  'até 2 horas (treino longo)',
  },
  disciplina: {
    frequentemente: 'Falta com frequência — difícil manter consistência',
    intermediario:  'Falta às vezes',
    raramente:      'Raramente falta — muito consistente e disciplinado',
  },
  variedade: {
    gosto:        'Adora variedade — quer exercícios diferentes a cada semana',
    nao:          'Prefere sempre os mesmos exercícios (consistência e domínio)',
    intermediario:'Prefere um pouco de variedade',
  },
  muscular: {
    atrapalharia: 'Dor muscular pós-treino (DOMS) atrapalha muito a rotina',
    pouco:        'DOMS atrapalha um pouco',
    nao:          'DOMS não atrapalha nada — aguenta volume alto',
  },
  fadiga: {
    evito:   'Prefere treinar com moderação — não gosta de se esgotar',
    consigo: 'Treina com boa intensidade mas respeita os limites',
    nao:     'Gosta de se desafiar ao limite — alta intensidade',
  },
  lesao: {
    nenhuma: 'Nenhuma limitação física',
    leve:    'Leve desconforto',
    pequena: 'Lesão pequena',
  },
  localLesao: {
    ombro:          'Ombro',
    cotovelo_punho: 'Cotovelo ou Punho',
    coluna_lombar:  'Coluna Lombar (parte baixa das costas)',
    coluna_cervical:'Pescoço / Coluna Cervical',
    quadril:        'Quadril / Virilha',
    joelho:         'Joelho',
    tornozelo:      'Tornozelo ou Pé',
  },
};

// ── Monta o prompt do usuário ─────────────────────────────────────────────────
function buildPrompt(params) {
  const {
    objetivo, diasTreino, experiencia, fadiga, lesao, localLesao,
    duracao, disciplina, variedade, ambiente, muscular, esporte, posicao,
  } = params;

  const isEsporte = objetivo === 'esporte' && esporte && posicao;

  const linhaObjetivo = isEsporte
    ? `Esporte específico: ${esporte} — posição: ${posicao}`
    : (LABELS.objetivo[objetivo] || objetivo);

  const linhaLesao = lesao && lesao !== 'nenhuma'
    ? `${LABELS.lesao[lesao]}${localLesao ? ` — localizada no(a) ${LABELS.localLesao[localLesao] || localLesao}` : ''}`
    : 'Nenhuma limitação física';

  const divisaoSugerida = { 3: 'ABC', 4: 'ABCD', 5: 'ABCDE', 6: 'ABCDEF' }[diasTreino] || 'ABCD';
  const diasSemana      = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].slice(0, diasTreino);

  return `Você é um personal trainer expert especializado em musculação e esportes. Gere um plano de treino semanal personalizado.

PERFIL DO USUÁRIO:
- Objetivo: ${linhaObjetivo}
- Dias de treino por semana: ${diasTreino} (usar divisão ${divisaoSugerida})
- Dias: ${diasSemana.join(', ')}
- Experiência: ${LABELS.experiencia[experiencia] || experiencia}
- Intensidade preferida: ${LABELS.fadiga[fadiga] || fadiga}
- Limitação física: ${linhaLesao}
- Duração preferida por sessão: ${LABELS.duracao[duracao] || duracao}
- Consistência / assiduidade: ${LABELS.disciplina[disciplina] || disciplina}
- Preferência de variedade: ${LABELS.variedade[variedade] || variedade}
- Ambiente de treino: ${LABELS.ambiente[ambiente] || ambiente}
- Tolerância a dor muscular (DOMS): ${LABELS.muscular[muscular] || muscular}

REGRAS OBRIGATÓRIAS:
1. Gere EXATAMENTE ${diasTreino} dias usando os dias: ${diasSemana.join(', ')}
2. Sempre adicione 2-3 exercícios de mobilidade (grupoMuscular: "mobilidade") ao FINAL de cada dia
3. Adapte os exercícios ao ambiente: ${LABELS.ambiente[ambiente] || ambiente}
4. Se houver lesão, EVITE exercícios que agravem a região afetada e adicione observação
5. Séries: número inteiro entre 2 e 6
6. Repetições: string como "8-12", "15-20", "3-5", "AMRAP", "30s"
7. Descanso: número inteiro em segundos (ex: 60, 90, 120)
8. Ordem: número sequencial dentro do dia começando em 1
9. Todo texto em português brasileiro
10. grupoMuscular deve ser exatamente um de: peito, costas, ombro, biceps, triceps, pernas, abdomen, mobilidade
11. tipo deve ser: hipertrofia, forca, resistencia, emagrecimento ou funcional
12. nivel deve ser: iniciante, intermediario ou avancado
13. dificuldade deve ser: facil, moderado ou dificil`;
}

// ── Schema de exemplo para o JSON ─────────────────────────────────────────────
const JSON_SCHEMA = `{
  "nome": "string",
  "descricao": "string",
  "tipo": "hipertrofia|forca|resistencia|emagrecimento|funcional",
  "nivel": "iniciante|intermediario|avancado",
  "divisao": "string",
  "diasPorSemana": number,
  "dias": [
    {
      "dia": "Seg|Ter|Qua|Qui|Sex|Sab",
      "nome": "string",
      "focoPrincipal": ["string"],
      "duracaoEstimada": number,
      "dificuldade": "facil|moderado|dificil",
      "exercicios": [
        {
          "nome": "string",
          "grupoMuscular": "peito|costas|ombro|biceps|triceps|pernas|abdomen|mobilidade",
          "series": number,
          "repeticoes": "string",
          "descanso": number,
          "observacoes": "string",
          "ordem": number
        }
      ]
    }
  ]
}`;

// ── Validação básica do treino gerado ─────────────────────────────────────────
function validarTreino(treino, diasEsperados) {
  if (!treino || typeof treino !== 'object') throw new Error('Resposta não é um objeto');
  if (!Array.isArray(treino.dias)) throw new Error('Campo "dias" ausente ou inválido');
  if (treino.dias.length !== diasEsperados) throw new Error(`Esperava ${diasEsperados} dias, recebeu ${treino.dias.length}`);

  const gruposValidos = ['peito','costas','ombro','biceps','triceps','pernas','abdomen','mobilidade'];
  for (const dia of treino.dias) {
    if (!dia.exercicios || dia.exercicios.length === 0) throw new Error(`Dia ${dia.dia} sem exercícios`);
    for (const ex of dia.exercicios) {
      if (!gruposValidos.includes(ex.grupoMuscular)) {
        ex.grupoMuscular = 'abdomen'; // fallback seguro
      }
      if (typeof ex.series !== 'number') ex.series = 3;
      if (typeof ex.descanso !== 'number') ex.descanso = 60;
      if (!ex.ordem) ex.ordem = dia.exercicios.indexOf(ex) + 1;
    }
  }

  // Garante campos obrigatórios do schema
  if (!treino.nome) treino.nome = 'Treino Personalizado';
  if (!treino.descricao) treino.descricao = 'Treino gerado por IA.';
  if (!['hipertrofia','forca','resistencia','emagrecimento','funcional'].includes(treino.tipo)) treino.tipo = 'hipertrofia';
  if (!['iniciante','intermediario','avancado'].includes(treino.nivel)) treino.nivel = 'intermediario';
  if (!treino.divisao) treino.divisao = 'ABCD';

  return treino;
}

// ── Função principal exportada ────────────────────────────────────────────────
async function gerarTreinoComIA(params) {
  const { diasTreino = 4 } = params;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Você é um personal trainer expert. Responda APENAS com um objeto JSON válido seguindo exatamente o schema fornecido. Não use markdown, não use ```json, apenas o objeto JSON puro.',
      },
      {
        role: 'user',
        content: `${buildPrompt(params)}\n\nRetorne APENAS o JSON seguindo este schema:\n${JSON_SCHEMA}`,
      },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 6000,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Resposta vazia do Groq');

  let treino;
  try {
    treino = JSON.parse(content);
  } catch {
    // Tenta extrair JSON caso venha com markdown
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON inválido na resposta da IA');
    treino = JSON.parse(match[0]);
  }

  return validarTreino(treino, Number(diasTreino));
}

module.exports = { gerarTreinoComIA };
