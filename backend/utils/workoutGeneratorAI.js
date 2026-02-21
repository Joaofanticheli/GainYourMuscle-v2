// ============================================================================
// GERADOR DE TREINO COM IA — Groq (Llama 3.3 70B) — Especializado
// ============================================================================

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Labels legíveis para o prompt ────────────────────────────────────────────
const LABELS = {
  objetivo: {
    hipertrofia:    'Ganhar massa muscular (hipertrofia)',
    forca:          'Ganhar força máxima',
    emagrecimento:  'Emagrecer e queimar gordura',
    condicionamento:'Melhorar condicionamento físico geral',
    saude_geral:    'Saúde geral e qualidade de vida',
  },
  experiencia: {
    nunca:        'Iniciante absoluto — nunca treinou musculação',
    novato:       'Novato — menos de 1 ano de treino consistente',
    intermediaria:'Intermediário — 1 a 3 anos de treino consistente',
    avancada:     'Avançado — mais de 3 anos de treino consistente',
  },
  ambiente: {
    casa:    'Em casa — sem equipamentos, apenas peso corporal e faixas',
    pequena: 'Academia pequena — halteres até 30kg, barras, máquinas básicas',
    grande:  'Academia completa — todos os equipamentos disponíveis',
  },
  duracao: {
    curto:  'Sessões curtas de até 45 minutos',
    normal: 'Sessões de aproximadamente 1 hora',
    longo:  'Sessões longas de até 2 horas',
  },
  disciplina: {
    frequentemente: 'Falta com frequência — difícil manter consistência (treinos devem ser mais curtos e prazerosos)',
    intermediario:  'Falta às vezes — consistência moderada',
    raramente:      'Raramente falta — altamente consistente e disciplinado',
  },
  variedade: {
    gosto:        'Adora exercícios variados — rotacionar movimentos a cada ciclo',
    nao:          'Prefere dominar os mesmos movimentos (consistência e maestria)',
    intermediario:'Aprecia variação moderada',
  },
  muscular: {
    atrapalharia: 'DOMS intenso atrapalha muito a rotina — reduzir volume e excêntrico',
    pouco:        'DOMS moderado é aceitável',
    nao:          'Tolera DOMS alto — pode receber volume e excêntrico elevados',
  },
  fadiga: {
    evito:   'Prefere intensidade moderada — não gosta de se esgotar (evita falha muscular)',
    consigo: 'Treina com boa intensidade respeitando os limites (1-2 RIR)',
    nao:     'Treina no limite — alta intensidade, próximo ou até a falha muscular',
  },
  lesao: {
    nenhuma: 'Sem limitações físicas',
    leve:    'Leve desconforto — adaptar movimentos',
    pequena: 'Lesão pequena — evitar a região afetada',
  },
  localLesao: {
    ombro:          'Ombro (glenoumeral)',
    cotovelo_punho: 'Cotovelo ou Punho',
    coluna_lombar:  'Coluna Lombar — evitar cargas axiais e flexão lombares pesadas',
    coluna_cervical:'Pescoço / Coluna Cervical — evitar carga sobre a cabeça',
    quadril:        'Quadril / Virilha — evitar abdução e rotação forçada',
    joelho:         'Joelho — evitar leg press 90°+, cadeira extensora pesada, agachamento profundo',
    tornozelo:      'Tornozelo ou Pé — evitar exercícios com impacto ou instabilidade',
  },
};

// ── Regras biomecânicas e científicas por grupo muscular ─────────────────────
const BIOMECANICA = `
BIOMECÂNICA E ATIVAÇÃO MUSCULAR (use para selecionar os melhores exercícios):

PEITO (Pectoralis major):
- Porção clavicular (superior): supino inclinado 30-45°, crucifixo inclinado, flexão inclinada
- Porção esternocostal (média): supino reto, crossover neutro, flexão normal
- Porção costal (inferior): supino declinado, crossover de cima para baixo, flexão declinada
- Pré-ativar com alongamento: supino com halteres permite maior amplitude (>barra)
- NUNCA substituir supino com barra por supino com halteres sem razão técnica para iniciantes

COSTAS (Latissimus dorsi + Trapézio + Romboides + Eretores):
- Dorsal superior (puxada): barra fixa, puxada frontal, pull-over
- Dorsal inferior (remadas): remada curvada, remada unilateral — cotovelo ao lado do tronco
- Trapézio médio/romboides: remada com pegada aberta, face pull, remada alta
- Eretores espinhais: levantamento terra, hiperextensão, good morning (avançados)
- Ângulo da puxada importa: puxada/barra com cotovelo à frente → porção superior; remada → porção inferior

OMBRO (Deltoides):
- Anterior: desenvolvimento com barra/halteres, elevação frontal (sobresolicitado em supinos)
- Medial (cappuccino): elevação lateral com halteres — cotovelo levemente flexionado, não acima da cabeça
- Posterior: crucifixo inverso, face pull (essencial para saúde glenoumeral), remada alta
- Manguito rotador: rotação externa com elástico, face pull (inserir em QUALQUER treino com ombro)

BÍCEPS (Biceps brachii + Braquial + Braquiorradial):
- Cabeça longa (externa/pico): rosca alternada com supinação, rosca inclinada, rosca concentrada
- Cabeça curta (interna/espessura): rosca com barra (pegada próxima), rosca scott
- Braquial (embaixo do bíceps): rosca martelo, rosca inversa
- NUNCA treinar bíceps antes de costas (pré-exaustão inadequada reduz desempenho nas costas)

TRÍCEPS (Tríceps brachii — 3 porções):
- Cabeça longa (maior): tríceps francês, tríceps testa, overhead extension — cotovelo acima da cabeça ATIVA a longa
- Cabeça lateral + medial: pulley, corda, dips — cotovelo ao lado do tronco
- NUNCA treinar tríceps antes de peito/ombro (mesmo motivo do bíceps/costas)

PERNAS (Quadríceps + Isquiotibiais + Glúteos + Panturrilhas):
- Quadríceps: agachamento (ênfase VMO no agachamento estreito), leg press (pé alto = glúteo, pé baixo = quad)
- Reto femoral (único biarticular do quad): agachamento com tronco ereto, leg extension
- Isquiotibiais: leg curl (flexão de joelho), levantamento terra romeno/stiff (extensão de quadril)
- Glúteos: hip thrust, agachamento profundo, levantamento terra, afundo
- Panturrilha: panturrilha sentado (solear) + em pé (gastrocnêmio) — ambas necessárias
- Não confundir exercícios de JOELHO (quad/isqui) com exercícios de QUADRIL (glúteo/isqui)

ABDÔMEN (Core — Reto + Oblíquos + Transverso):
- Reto abdominal: crunch, abdominal supra, hollow body hold
- Oblíquos: russian twist, prancha lateral, abdominal oblíquo
- Transverso (estabilizador profundo): prancha isométrica, dead bug, bird dog — ESSENCIAL para saúde lombar
- Core antirotação: Pallof press (fundamental para atletas)

MOBILIDADE (Fascial + Articular):
- Quadril/coluna: world greatest stretch, rotação torácica, cat-cow, 90/90
- Ombro/torácica: rotação de ombro, abertura de peito, thread the needle
- Sempre ao FINAL do treino — mobilidade estática pós-treino melhora amplitude sem reduzir força`;

// ── Princípios de ciência do exercício ───────────────────────────────────────
const CIENCIA = `
PRINCÍPIOS CIENTÍFICOS OBRIGATÓRIOS:

VOLUME E FREQUÊNCIA:
- Iniciante: 10-12 séries/semana por grupo muscular | Frequência: 2-3x/semana por grupo
- Intermediário: 12-18 séries/semana | Frequência: 2x/semana por grupo (ideal)
- Avançado: 18-25 séries/semana com periodização | Frequência: 2-3x/semana por grupo
- Regra de ouro: Núcleo (peito, costas, pernas) → mais volume | Isoladores (braços) → menos volume

SEQUÊNCIA DE EXERCÍCIOS (ordem SEMPRE respeitada):
1. Exercícios multiarticulares PESADOS primeiro (máximo recrutamento neural)
2. Exercícios multiarticulares secundários
3. Exercícios isoladores
4. Mobilidade ao final (NUNCA no início antes de carga pesada)
Exemplos corretos: Supino → Crucifixo → Tríceps Pulley → Mobilidade
Exemplos errados: Crucifixo antes de Supino | Rosca antes de Remada | Mobilidade entre séries pesadas

INTENSIDADE E PROXIMIDADE À FALHA:
- RIR (Reps in Reserve) — quantas reps sobraram antes da falha:
  * Iniciante: 3-4 RIR (muito longe da falha — foco na técnica)
  * Intermediário: 1-2 RIR (perto da falha sem atingir)
  * Avançado: 0-1 RIR (na falha ou muito perto)
- Fadiga PREFERIDA: "prefiro moderação" → sempre 3+ RIR | "gosto do limite" → 0-1 RIR

RECUPERAÇÃO E FADIGA (CRÍTICO):
- Janelas de recuperação muscular mínimas entre estímulos:
  * Pernas (grandes): 72 horas — nunca 2 dias seguidos
  * Peito / Costas: 48 horas
  * Ombro / Braços: 24-48 horas
- Fadiga exagerada pode indicar:
  1. Volume excessivo acima do MRV (Maximum Recoverable Volume)
  2. Depleção de glicogênio (carboidrato insuficiente pré/pós-treino)
  3. Sleep debt — dívida de sono reduz síntese proteica em até 30%
  4. Início de overtraining — resolução: deload imediato (50% volume por 1 semana)
  5. Hidratação inadequada — perda de 2% do peso em suor reduz força em 10-20%
- DOMS (dor muscular tardia) NÃO é indicador de eficácia do treino
- Se cliente reporta DOMS excessivo: reduzir volume excêntrico, evitar dropsets e negativas

EXERCÍCIOS CONTRAINDICADOS POR LESÃO:
- Ombro: EVITAR desenvolvimento por trás da cabeça, elevações com rotação interna, supino pegada muito aberta
- Joelho: EVITAR leg press 90°+, cadeira extensora pesada em ponto final, agachamento muito profundo com dor
- Coluna lombar: EVITAR good morning com carga, hiperextensão com barga, levantamento terra com coluna arredondada
- Coluna cervical: EVITAR carga diretamente sobre a cabeça, trações bruscas
- Quadril/virilha: EVITAR adução forçada, abdução súbita, afundo com carga excessiva
- Cotovelo/punho: EVITAR rosca inversa pesada, tríceps testa com barra reta

PERIODIZAÇÃO RECOMENDADA:
- Iniciante: progressão linear simples (adicionar carga toda semana)
- Intermediário: periodização ondulante diária (alternar volume/intensidade)
- Avançado: periodização por blocos (acumulação → intensificação → pico)`;

// ── Monta o prompt completo ───────────────────────────────────────────────────
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
    ? `${LABELS.lesao[lesao]} — localizada no(a) ${LABELS.localLesao[localLesao] || localLesao || 'região não especificada'}`
    : 'Sem limitações físicas';

  const divisaoSugerida = { 3: 'ABC', 4: 'ABCD', 5: 'ABCDE', 6: 'ABCDEF' }[diasTreino] || 'ABCD';
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].slice(0, diasTreino);

  return `PERFIL COMPLETO DO ALUNO:
- Objetivo: ${linhaObjetivo}
- Dias de treino/semana: ${diasTreino} → divisão ${divisaoSugerida} | Dias: ${diasSemana.join(', ')}
- Nível de experiência: ${LABELS.experiencia[experiencia] || experiencia}
- Intensidade preferida: ${LABELS.fadiga[fadiga] || fadiga}
- Limitação física: ${linhaLesao}
- Duração das sessões: ${LABELS.duracao[duracao] || duracao}
- Disciplina/consistência: ${LABELS.disciplina[disciplina] || disciplina}
- Preferência de variedade: ${LABELS.variedade[variedade] || variedade}
- Ambiente de treino: ${LABELS.ambiente[ambiente] || ambiente}
- Tolerância a DOMS: ${LABELS.muscular[muscular] || muscular}

${BIOMECANICA}

${CIENCIA}

INSTRUÇÕES PARA GERAÇÃO DO TREINO:
1. Gere EXATAMENTE ${diasTreino} dias usando: ${diasSemana.join(', ')}
2. Aplique a divisão ${divisaoSugerida} de forma inteligente — distribua grupos musculares respeitando as janelas de recuperação
3. Sempre termine cada dia com 2-3 exercícios de mobilidade (grupoMuscular: "mobilidade")
4. Respeite a sequência: compostos pesados → compostos leves → isoladores → mobilidade
5. Adapte tudo ao ambiente: ${LABELS.ambiente[ambiente] || ambiente}
6. Para cada exercício, gere a URL do YouTube: "https://www.youtube.com/results?search_query=NOME_DO_EXERCICIO+fabricio+pacholok" (substitua NOME_DO_EXERCICIO pelo nome real do exercício com + no lugar de espaços, em português)
7. Nas observações, seja específico: mencione biomecânica, ponto de máxima contração, RIR recomendado, e dica técnica principal
8. Se houver lesão, adapte APENAS os exercícios da região afetada — o restante treina normalmente com intensidade total
9. Séries: inteiro de 2 a 6 | Repetições: string (ex: "6-10", "12-15", "3-5") | Descanso: inteiro em segundos
10. Para "prefere os mesmos exercícios": use os movimentos mais fundamentais e eficazes da ciência do exercício
11. Para "adora variedade": varie os ângulos, equipamentos e padrões de movimento ao longo dos dias`;
}

// ── Schema JSON para o retorno ────────────────────────────────────────────────
const JSON_SCHEMA = `{
  "nome": "string criativo e personalizado",
  "descricao": "string técnica de 2-3 frases explicando a lógica do programa",
  "tipo": "hipertrofia|forca|resistencia|emagrecimento|funcional",
  "nivel": "iniciante|intermediario|avancado",
  "divisao": "ABC|ABCD|ABCDE|ABCDEF",
  "diasPorSemana": number,
  "dias": [
    {
      "dia": "Seg|Ter|Qua|Qui|Sex|Sab",
      "nome": "string (ex: Empurrar — Peito, Ombro e Tríceps)",
      "focoPrincipal": ["grupo1", "grupo2"],
      "duracaoEstimada": number,
      "dificuldade": "facil|moderado|dificil",
      "exercicios": [
        {
          "nome": "nome completo do exercício em português",
          "grupoMuscular": "peito|costas|ombro|biceps|triceps|pernas|abdomen|mobilidade",
          "series": number,
          "repeticoes": "string",
          "descanso": number,
          "observacoes": "dica biomecânica específica + RIR recomendado + ponto de atenção",
          "videoUrl": "https://www.youtube.com/results?search_query=nome+do+exercicio+fabricio+pacholok",
          "ordem": number
        }
      ]
    }
  ]
}`;

// ── Validação e sanitização do retorno da IA ──────────────────────────────────
function validarTreino(treino, diasEsperados) {
  if (!treino || typeof treino !== 'object') throw new Error('Resposta não é um objeto');
  if (!Array.isArray(treino.dias)) throw new Error('Campo "dias" ausente ou inválido');
  if (treino.dias.length !== diasEsperados) {
    throw new Error(`Esperava ${diasEsperados} dias, recebeu ${treino.dias.length}`);
  }

  const gruposValidos = ['peito','costas','ombro','biceps','triceps','pernas','abdomen','mobilidade'];
  const tiposValidos  = ['hipertrofia','forca','resistencia','emagrecimento','funcional'];
  const niveisValidos = ['iniciante','intermediario','avancado'];

  for (const dia of treino.dias) {
    if (!dia.exercicios || dia.exercicios.length === 0) throw new Error(`Dia "${dia.dia}" sem exercícios`);
    dia.exercicios.forEach((ex, i) => {
      if (!gruposValidos.includes(ex.grupoMuscular)) ex.grupoMuscular = 'abdomen';
      if (typeof ex.series !== 'number' || ex.series < 1) ex.series = 3;
      if (typeof ex.descanso !== 'number') ex.descanso = 60;
      if (!ex.repeticoes) ex.repeticoes = '8-12';
      if (!ex.ordem) ex.ordem = i + 1;
      if (!ex.videoUrl) {
        const query = encodeURIComponent((ex.nome || 'exercicio').toLowerCase());
        ex.videoUrl = `https://www.youtube.com/results?search_query=${query}+fabricio+pacholok`;
      }
      if (!ex.observacoes) ex.observacoes = '';
    });
    if (!dia.focoPrincipal) dia.focoPrincipal = [];
    if (!dia.duracaoEstimada) dia.duracaoEstimada = 60;
    if (!dia.dificuldade) dia.dificuldade = 'moderado';
  }

  if (!treino.nome) treino.nome = 'Treino Personalizado';
  if (!treino.descricao) treino.descricao = 'Programa gerado com base no seu perfil.';
  if (!tiposValidos.includes(treino.tipo)) treino.tipo = 'hipertrofia';
  if (!niveisValidos.includes(treino.nivel)) treino.nivel = 'intermediario';
  if (!treino.divisao) treino.divisao = 'ABCD';

  return treino;
}

// ── Função principal ──────────────────────────────────────────────────────────
async function gerarTreinoComIA(params) {
  const { diasTreino = 4 } = params;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Você é um personal trainer de elite com especialização em:
- Ciência do exercício e hipertrofia (Dr. Brad Schoenfeld, Mike Israetel — Renaissance Periodization)
- Biomecânica aplicada ao treinamento resistido
- Periodização e programação avançada de treinos
- Recuperação, fadiga e prevenção de overtraining
- Fisiologia do exercício e adaptações musculares

Você treina atletas de alto nível e não aceita treinos mediocres. Seu padrão é tão alto que nenhum profissional de educação física questionaria seus programas.

Responda SOMENTE com um objeto JSON válido. Sem markdown, sem \`\`\`json, sem texto antes ou depois. Apenas o JSON puro.`,
      },
      {
        role: 'user',
        content: `${buildPrompt(params)}\n\nRetorne APENAS o JSON seguindo este schema exato:\n${JSON_SCHEMA}`,
      },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.65,
    max_tokens: 8000,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Resposta vazia do Groq');

  let treino;
  try {
    treino = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON inválido na resposta da IA');
    treino = JSON.parse(match[0]);
  }

  return validarTreino(treino, Number(diasTreino));
}

module.exports = { gerarTreinoComIA };
