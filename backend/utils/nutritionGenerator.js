// ============================================================================
// GERADOR DE PLANO NUTRICIONAL COM IA — Groq (Llama 3.3 70B)
// Especializado em Nutrição Esportiva baseada em evidências científicas
// ============================================================================

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Labels legíveis ───────────────────────────────────────────────────────────
const LABELS = {
  objetivo: {
    emagrecimento:   'Emagrecimento — perda de gordura corporal com preservação de massa muscular',
    ganho_massa:     'Ganho de massa muscular — superávit calórico controlado com alta proteína',
    recomposicao:    'Recomposição corporal — perder gordura e ganhar músculo simultaneamente',
    manutencao:      'Manutenção — manter peso e composição corporal atuais',
    saude_geral:     'Saúde geral e longevidade — alimentação equilibrada e anti-inflamatória',
    performance:     'Performance esportiva — combustível otimizado para treino e recuperação',
  },
  restricao: {
    nenhuma:       'Nenhuma restrição alimentar',
    vegetariano:   'Vegetariano (sem carne vermelha/branca/peixe, mas consome ovos e laticínios)',
    vegano:        'Vegano (sem nenhum produto de origem animal)',
    sem_gluten:    'Sem glúten (doença celíaca ou sensibilidade)',
    sem_lactose:   'Sem lactose (intolerância à lactose)',
    multipla:      'Múltiplas restrições (sem carne E sem lactose)',
  },
  atividade: {
    sedentario:    'Sedentário — trabalho de escritório, sem exercícios regulares (fator: 1.2)',
    leve:          'Levemente ativo — 1-3x semana de exercício (fator: 1.375)',
    moderado:      'Moderadamente ativo — 4-5x semana de exercício (fator: 1.55)',
    muito_ativo:   'Muito ativo — treino intenso diário ou 2x ao dia (fator: 1.725)',
  },
  refeicoes: {
    '2_3': '2 a 3 refeições por dia (estilo mais relaxado)',
    '4_5': '4 a 5 refeições por dia (padrão ideal para controle glicêmico)',
    '6_mais': '6 ou mais refeições por dia (protocolo clássico de musculação)',
  },
  tempoCozinhar: {
    pouco:    'Pouco tempo disponível — refeições práticas e rápidas (até 20 min)',
    medio:    'Tempo médio — consegue cozinhar quando necessário (30-45 min)',
    bastante: 'Bastante tempo — gosta de cozinhar e preparar refeições elaboradas',
  },
  foraLar: {
    raramente:     'Come quase sempre em casa — maior controle sobre a alimentação',
    as_vezes:      'Come fora 1-3 vezes por semana — adaptar refeições externas',
    frequentemente:'Come fora na maioria das vezes — guia de escolhas em restaurantes necessário',
  },
  saude: {
    nenhuma:    'Sem condições médicas relevantes',
    diabetes:   'Diabetes tipo 2 ou pré-diabetes — controle rigoroso de carboidratos e índice glicêmico',
    hipertensao:'Hipertensão arterial — redução de sódio, aumento de potássio e magnésio',
    colesterol: 'Colesterol elevado — redução de gorduras saturadas, aumento de fibras solúveis e ômega-3',
    tireoide:   'Hipotireoidismo — atenção ao iodo, selênio e alimentos bociogênicos',
    intestino:  'Síndrome do intestino irritável — dieta low FODMAP adaptada',
  },
  suplementos: {
    nenhum:    'Não usa suplementos',
    whey:      'Usa whey protein',
    creatina:  'Usa creatina',
    multi:     'Usa multivitamínico',
    combo:     'Usa proteína em pó + creatina',
  },
  orcamento: {
    economico: 'Orçamento econômico — priorizar alimentos acessíveis e nutritivos',
    moderado:  'Orçamento moderado — balanço entre custo e variedade',
    livre:     'Sem restrição de orçamento — qualidade máxima dos alimentos',
  },
  dietaAnterior: {
    nunca:       'Nunca seguiu dieta estruturada',
    low_carb:    'Já tentou low carb — sabe como reduzir carboidratos',
    cetogenica:  'Já tentou cetogênica — tem experiência com adaptação metabólica',
    jejum:       'Já praticou jejum intermitente — conhece os protocolos 16/8, 18/6',
    contagem:    'Já fez contagem de calorias/macros — familiaridade com tracking',
  },
};

// ── Base científica de nutrição esportiva ─────────────────────────────────────
const CIENCIA_NUTRICIONAL = `
CIÊNCIA DA NUTRIÇÃO ESPORTIVA (aplique rigorosamente):

CÁLCULO CALÓRICO — EQUAÇÃO DE MIFFLIN-ST JEOR (mais precisa):
- Homem TMB = (10 × peso kg) + (6.25 × altura cm) - (5 × idade) + 5
- Mulher TMB = (10 × peso kg) + (6.25 × altura cm) - (5 × idade) - 161
- TDEE = TMB × fator de atividade
- Emagrecimento: TDEE - 300 a 500 kcal (déficit moderado preserva músculo)
- Ganho de massa: TDEE + 200 a 350 kcal (superávit limpo minimiza gordura)
- Recomposição: TDEE (manutenção calórica com alta proteína)
- NUNCA abaixo de 1200 kcal (mulheres) ou 1500 kcal (homens)

PROTEÍNA — O MACRONUTRIENTE MAIS IMPORTANTE:
- Emagrecimento: 2.0 a 2.4 g/kg de peso corporal (maior para preservar músculo em déficit)
- Ganho de massa: 1.8 a 2.2 g/kg de peso corporal
- Recomposição: 2.2 a 2.6 g/kg de peso corporal
- Manutenção/Saúde: 1.6 a 2.0 g/kg de peso corporal
- Distribuição: NUNCA mais de 40-50g de proteína por refeição (absorção limitada)
- Fontes completas: frango, ovos, carne magra, peixe, whey, atum, queijo cottage
- Fontes vegetais: tofu, tempeh, lentilha + arroz (completa), edamame, proteína de ervilha

CARBOIDRATOS — COMBUSTÍVEL PARA TREINO:
- Emagrecimento: 30-40% das calorias (foco em low-GI: aveia, batata-doce, arroz integral)
- Ganho de massa: 45-55% das calorias (pré e pós treino com carbo de alto IG)
- Performance: 5-7 g/kg antes de eventos/treinos longos
- Fibras: 25-38g/dia OBRIGATÓRIO (controle glicêmico, saciedade, saúde intestinal)
- Timing: carbo pré-treino (energia) + pós-treino (reposição de glicogênio)

GORDURAS — ESSENCIAIS PARA SAÚDE HORMONAL:
- Nunca abaixo de 20% das calorias (risco de deficiência hormonal — testosterona, cortisol)
- Fontes saudáveis: azeite extra-virgem, abacate, castanhas, amêndoas, ovo inteiro, salmão
- Ômega-3: 2-4g/dia (salmão, sardinha, linhaça, chia, suplemento se necessário)
- Evitar: gorduras trans, óleos refinados em excesso, fritura habitual

MICRONUTRIENTES CRÍTICOS PARA O PRATICANTE DE EXERCÍCIO:
- Vitamina D: 1000-4000 UI/dia (deficiência afeta força muscular e imunidade)
- Magnésio: 300-400 mg/dia (contração muscular, sono, síntese proteica)
- Zinco: 8-11 mg/dia (testosterona, imunidade, cicatrização)
- Ferro: 8-18 mg/dia (transporte de oxigênio — especialmente mulheres)
- Cálcio: 1000-1200 mg/dia (contração muscular, saúde óssea)
- B12: vegetarianos/veganos DEVEM suplementar (apenas em produtos animais)
- Potássio: 3500-4700 mg/dia (função muscular, equilíbrio de sódio)

TIMING NUTRICIONAL (quando comer importa para atletas):
- Pré-treino (1-2h antes): 20-40g proteína + 30-60g carbo complexo + baixo em gordura
- Pós-treino (até 2h): 30-50g proteína + 40-80g carbo (janela anabólica real, mas não tão estreita)
- Antes de dormir: caseína ou queijo cottage (digestão lenta mantém anabolismo noturno)
- Em jejum: NÃO treinar em jejum prolongado (>16h) — catabolismo muscular aumentado

HIDRATAÇÃO:
- Base: 35 ml/kg de peso corporal por dia
- Exercício: +500-750 ml por hora de treino de moderada intensidade
- Urina clara/amarelo-pálido = hidratação adequada
- Eletrólitos: sódio (1500-2300mg), potássio, magnésio — essenciais após treino intenso

SUPLEMENTAÇÃO COM EVIDÊNCIA CIENTÍFICA FORTE (nível A):
- Creatina Monohidratada: 3-5g/dia, qualquer horário — AUMENTA força e massa (comprovado)
- Proteína Whey/Caseína: prática e eficaz — não é superior a proteína de alimentos
- Cafeína: 3-6 mg/kg, 30-60min antes do treino — melhora performance e foco
- Beta-alanina: 3.2-6.4g/dia — tamponamento de ácido lático, benefício em exercícios 1-4 min
- Ômega-3: 2-4g EPA+DHA/dia — anti-inflamatório, saúde cardiovascular
- Vitamina D: 1000-4000 UI/dia — especialmente em climas ou profissões com pouco sol

EVITAR ou SEM EVIDÊNCIA FORTE: BCAAs (inúteis com proteína suficiente), glutamina,
queimadores de gordura termogênicos, ZMA, testosterona boosters, HMB (exceto idosos)`;

// ── Tabela TACO — valores por 100g ───────────────────────────────────────────
const TACO_REFERENCIA = `
TABELA TACO — VALORES POR 100g (use como referência OBRIGATÓRIA para macros individuais):
Arroz branco cozido: 2.5g P | 28.1g C | 0.1g G | 128kcal
Feijão carioca cozido: 4.8g P | 13.6g C | 0.5g G | 76kcal
Frango peito s/pele cozido: 31.5g P | 0g C | 3.7g G | 163kcal
Ovo inteiro cozido: 13.3g P | 0.5g C | 9.6g G | 146kcal
Clara de ovo cozida: 9.7g P | 0g C | 0g G | 39kcal
Aveia em flocos: 13.9g P | 67.2g C | 8.5g G | 394kcal
Batata-doce cozida: 1.4g P | 18.4g C | 0.1g G | 77kcal
Banana nanica (1 unidade ≈ 100g): 1.3g P | 23.8g C | 0.1g G | 92kcal
Carne bovina patinho cozido: 32.0g P | 0g C | 9.7g G | 219kcal
Atum em água escorrido: 26.0g P | 0g C | 1.3g G | 119kcal
Pão francês (1 unid ≈ 50g): 8.0g P | 58.6g C | 3.1g G | 300kcal
Macarrão cozido: 4.8g P | 27.9g C | 0.5g G | 133kcal
Batata inglesa cozida: 1.2g P | 11.9g C | 0.1g G | 52kcal
Mandioca cozida: 0.6g P | 30.1g C | 0.3g G | 125kcal
Salmão grelhado: 26.8g P | 0g C | 11.5g G | 210kcal
Sardinha em óleo escorrida: 24.9g P | 0g C | 13.9g G | 224kcal
Azeite de oliva: 0g P | 0g C | 100g G | 884kcal
Leite desnatado (200ml): 3.2g P | 4.9g C | 0.1g G | 35kcal
Iogurte natural desnatado: 3.7g P | 5.3g C | 0.1g G | 40kcal
Queijo mussarela: 22.4g P | 3.4g C | 17.3g G | 261kcal
Queijo cottage: 12.5g P | 2.7g C | 4.3g G | 97kcal
Amendoim torrado: 26.2g P | 21.1g C | 44.0g G | 581kcal
Castanha do pará (1 unid ≈ 5g): 14.5g P | 15.1g C | 63.5g G | 656kcal
Whey protein (padrão): 80g P | 5g C | 5g G | 385kcal`;

// ── Monta o prompt ────────────────────────────────────────────────────────────
function buildNutritionPrompt(params) {
  const {
    objetivo, restricao, atividade, refeicoes, tempoCozinhar,
    foraLar, saude, suplementos, orcamento, dietaAnterior,
    peso, altura, idade, sexo,
    treino, anamnese, diasTreino,
  } = params;

  const temCondicaoMedica = saude && saude !== 'nenhuma';
  const avisoMedico = temCondicaoMedica
    ? `⚠️ ATENÇÃO CLÍNICA: O usuário tem ${LABELS.saude[saude]}. Adapte rigorosamente o plano para esta condição e inclua aviso obrigatório de acompanhamento médico.`
    : '';

  const dadosFisicos = peso && altura && idade && sexo
    ? `Peso: ${peso}kg | Altura: ${altura}cm | Idade: ${idade} anos | Sexo: ${sexo === 'masculino' ? 'Masculino' : 'Feminino'}`
    : 'Dados físicos não informados — use valores médios e oriente buscar profissional';

  // Contexto do treino atual
  let treinoCtx = '';
  if (treino) {
    treinoCtx = `
TREINO ATUAL DO USUÁRIO (use para personalizar timing e calorias):
- Objetivo do treino: ${treino.tipo || 'não informado'}
- Nível: ${treino.nivel || 'não informado'}
- Dias de treino/semana: ${treino.diasPorSemana || diasTreino || 4}
- Divisão: ${treino.divisao || 'não informada'}
→ Adapte a distribuição de carboidratos ao redor dos treinos (maior carbo pré e pós-treino).
→ Nos dias de treino: aumente carbo em ~20%, reduza em dias de descanso.`;
  } else if (diasTreino) {
    treinoCtx = `\nFREQUÊNCIA DE TREINO: ${diasTreino} dias/semana — considere timing nutricional pré e pós-treino.`;
  }

  // Contexto da anamnese
  let anamneseCtx = '';
  if (anamnese) {
    const partes = [];
    if (anamnese.doencas) partes.push(`Doenças reportadas: ${anamnese.doencas}`);
    if (anamnese.medicamentos) partes.push(`Medicamentos: ${anamnese.medicamentos}`);
    if (anamnese.alergias) partes.push(`Alergias: ${anamnese.alergias}`);
    if (anamnese.cirurgias) partes.push(`Cirurgias/histórico: ${anamnese.cirurgias}`);
    if (anamnese.objetivoPrincipal) partes.push(`Objetivo declarado pelo aluno: ${anamnese.objetivoPrincipal}`);
    if (partes.length > 0) {
      anamneseCtx = `\nFICHA DE SAÚDE (ANAMNESE) — USE PARA PERSONALIZAR:\n${partes.join('\n')}`;
    }
  }

  return `PERFIL NUTRICIONAL COMPLETO DO USUÁRIO:
${dadosFisicos}

- Objetivo principal: ${LABELS.objetivo[objetivo] || objetivo}
- Restrições alimentares: ${LABELS.restricao[restricao] || restricao}
- Nível de atividade física: ${LABELS.atividade[atividade] || atividade}
- Frequência de refeições preferida: ${LABELS.refeicoes[refeicoes] || refeicoes}
- Tempo para cozinhar: ${LABELS.tempoCozinhar[tempoCozinhar] || tempoCozinhar}
- Refeições fora de casa: ${LABELS.foraLar[foraLar] || foraLar}
- Condições de saúde: ${LABELS.saude[saude] || saude}
- Suplementação atual: ${LABELS.suplementos[suplementos] || suplementos}
- Orçamento alimentar: ${LABELS.orcamento[orcamento] || orcamento}
- Experiência anterior com dieta: ${LABELS.dietaAnterior[dietaAnterior] || dietaAnterior}
${treinoCtx}
${anamneseCtx}
${avisoMedico}

${CIENCIA_NUTRICIONAL}

INSTRUÇÕES PARA O PLANO NUTRICIONAL:
1. Calcule as calorias usando Mifflin-St Jeor com os dados físicos fornecidos — mostre o cálculo no campo descricao
2. Gere EXATAMENTE o número de refeições que o usuário prefere
3. Cada refeição deve ter: nome, horário sugerido, lista de alimentos com quantidade e calorias, total de calorias, macro breakdown e uma opção substituta prática
4. USE ALIMENTOS TIPICAMENTE BRASILEIROS: arroz, feijão, frango, ovo, mandioca, banana, laranja, carne moída, pão francês, leite, iogurte, queijo, etc.
5. Respeite TODAS as restrições alimentares sem exceção
6. Para vegetariano/vegano: garanta proteína completa (combinações corretas)
7. Inclua dicas de preparo rápido se o usuário tem pouco tempo para cozinhar
8. Se come fora com frequência: inclua guia de escolhas em restaurantes e fast food brasileiros (por ex. almoço executivo, lanchonete, etc.)
9. Suplementação: recomende APENAS o que tem evidência forte. Explique dose, horário e motivo
10. Inclua dicas de micronutrientes relevantes para o objetivo
11. A proteína total deve bater no target calculado — verifique somando todas as refeições
12. Inclua um aviso profissional ao final
13. PARA CADA ALIMENTO inclua proteina, carboidrato E gordura individuais — use a tabela TACO brasileira
14. REGRA DE OURO: calorias do alimento = (proteina×4) + (carboidrato×4) + (gordura×9)
15. Total de calorias da refeição = soma das calorias de todos os alimentos
16. Macros da refeição (proteina/carbo/gordura) = soma dos macros de todos os alimentos da refeição
17. Total do plano (calorias e macros) = soma de todas as refeições — verifique a consistência
18. Se o usuário tem treino cadastrado: posicione as refeições de maior carbo pré e pós-treino
19. Personalize o TÍTULO do plano com o nome do objetivo e dados do usuário (ex: "Plano Hipertrofia — 85kg / 25 anos")
20. As dicas devem ser PRÁTICAS e ESPECÍFICAS para o perfil do usuário, não genéricas

${TACO_REFERENCIA}

⚠️ OBRIGATÓRIO: Calcule os macros de CADA ALIMENTO usando a tabela TACO acima como referência. Ajuste proporcionalmente para a quantidade indicada. A fórmula kcal = (P×4)+(C×4)+(G×9) DEVE ser respeitada em todos os alimentos.`;
}

// ── Schema JSON esperado ──────────────────────────────────────────────────────
const JSON_SCHEMA = `{
  "titulo": "string criativo e personalizado",
  "objetivo": "emagrecimento|ganho_massa|recomposicao|manutencao|saude_geral|performance",
  "descricao": "string técnica de 2-3 frases explicando a lógica nutricional do plano",
  "calorias": number,
  "macros": {
    "proteina": number,
    "carboidrato": number,
    "gordura": number,
    "fibraMinima": number
  },
  "refeicoes": [
    {
      "nome": "Café da Manhã",
      "horario": "07:00 – 08:00",
      "calorias": number,
      "macros": { "proteina": number, "carbo": number, "gordura": number },
      "alimentos": [
        {
          "item": "nome do alimento",
          "quantidade": "3 unidades / 150g",
          "calorias": number,
          "proteina": number,
          "carboidrato": number,
          "gordura": number
        }
      ],
      "opcaoSubstituta": "string com opção alternativa prática e de sabor diferente"
    }
  ],
  "suplementacao": [
    { "nome": "Creatina Monohidratada", "dose": "5g", "horario": "Qualquer horário, com água", "motivo": "Aumenta força e síntese proteica — evidência nível A" }
  ],
  "guiaForaDeCasa": "string com orientações práticas para refeições em restaurantes, se aplicável, ou null",
  "dicas": [
    "string com dica prática, específica e baseada em ciência"
  ],
  "micronutrientesDestaque": [
    { "nutriente": "Vitamina D", "fonte": "Gema do ovo, salmão, exposição solar", "importancia": "Síntese proteica e função imune" }
  ],
  "avisoMedico": "string obrigatória com aviso de que o plano é educativo e recomendação de acompanhamento profissional"
}`;

// ── Recalcula calorias e macros matematicamente (corrige erros da IA) ─────────
function recalcularTotais(plano) {
  let totalCal = 0, totalProt = 0, totalCarbo = 0, totalGord = 0;

  plano.refeicoes = plano.refeicoes.map(refeicao => {
    let refCal = 0, refProt = 0, refCarbo = 0, refGord = 0;

    refeicao.alimentos = (refeicao.alimentos || []).map(alimento => {
      const p = Number(alimento.proteina)    || 0;
      const c = Number(alimento.carboidrato) || 0;
      const g = Number(alimento.gordura)     || 0;
      const cal = Math.round((p * 4) + (c * 4) + (g * 9));
      refProt  += p;
      refCarbo += c;
      refGord  += g;
      refCal   += cal;
      return { ...alimento, calorias: cal };
    });

    refCal  = Math.round(refCal);
    refProt  = Math.round(refProt);
    refCarbo = Math.round(refCarbo);
    refGord  = Math.round(refGord);

    totalCal  += refCal;
    totalProt  += refProt;
    totalCarbo += refCarbo;
    totalGord  += refGord;

    return {
      ...refeicao,
      calorias: refCal,
      macros: { proteina: refProt, carbo: refCarbo, gordura: refGord },
    };
  });

  plano.calorias = Math.round(totalCal);
  plano.macros = {
    ...plano.macros,
    proteina:    Math.round(totalProt),
    carboidrato: Math.round(totalCarbo),
    gordura:     Math.round(totalGord),
  };

  return plano;
}

// ── Validação do retorno ──────────────────────────────────────────────────────
function validarPlano(plano) {
  if (!plano || typeof plano !== 'object') throw new Error('Resposta não é um objeto');
  if (!Array.isArray(plano.refeicoes) || plano.refeicoes.length === 0)
    throw new Error('Refeições ausentes ou inválidas');

  if (!plano.titulo) plano.titulo = 'Plano Nutricional Personalizado';
  if (!plano.descricao) plano.descricao = 'Plano gerado com base no seu perfil e objetivo.';
  if (!plano.macros) plano.macros = { proteina: 0, carboidrato: 0, gordura: 0, fibraMinima: 25 };
  if (!Array.isArray(plano.dicas)) plano.dicas = [];
  if (!Array.isArray(plano.suplementacao)) plano.suplementacao = [];
  if (!plano.avisoMedico)
    plano.avisoMedico = 'Este plano é de caráter educativo. Consulte um nutricionista registrado (CRN) para acompanhamento individualizado e ajustes precisos.';

  plano.refeicoes.forEach(r => {
    if (!r.alimentos) r.alimentos = [];
    if (!r.macros) r.macros = { proteina: 0, carbo: 0, gordura: 0 };
  });

  // Recalcula todos os totais matematicamente — garante consistência
  plano = recalcularTotais(plano);

  plano.geradoEm = new Date().toISOString();

  return plano;
}

// ── Função principal ──────────────────────────────────────────────────────────
async function gerarPlanoNutricional(params) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Você é um Nutricionista Esportivo de elite com doutorado em Nutrição e Metabolismo, especializado em:
- Nutrição para hipertrofia, emagrecimento e recomposição corporal (Eric Helms, Alan Aragon, Layne Norton)
- Cálculo preciso de necessidades calóricas e distribuição de macronutrientes (DRIs, AMDR)
- Micronutrientes e sua função específica para praticantes de exercício
- Suplementação baseada em evidências científicas sólidas (somente nível A de evidência)
- Adaptação de planos para restrições alimentares, alergias e condições médicas
- Timing nutricional: pré-treino, pós-treino e nutrição noturna
- Alimentos funcionais anti-inflamatórios e saúde intestinal
- Nutrição vegetariana e vegana para atletas (combinações para proteína completa)
- Culinária prática brasileira: alimentos acessíveis, nutritivos e saborosos
- Controle glicêmico e seu impacto na composição corporal e performance
- Hidratação e eletrólitos no contexto do treinamento intenso

Seus planos são tecnicamente impecáveis. Nenhum nutricionista com CRN questionaria suas recomendações. Você segue as diretrizes do CFN, DRIs atualizadas (2023) e as evidências científicas mais recentes.

REGRAS ABSOLUTAS QUE NUNCA PODE VIOLAR:
1. Nunca recomendar menos de 1200 kcal (mulheres) ou 1500 kcal (homens)
2. Proteína nunca abaixo de 1.6 g/kg
3. Gordura nunca abaixo de 20% das calorias totais
4. Sempre incluir fibras (mínimo 25g/dia)
5. Suplementos apenas com evidência científica nível A (creatina, proteína, cafeína, ômega-3, vitamina D)
6. Para condições médicas: conservadorismo obrigatório + aviso de acompanhamento médico
7. Sempre incluir variedade para cobrir micronutrientes essenciais

Responda SOMENTE com um objeto JSON válido. Sem markdown, sem \`\`\`json, sem texto. Apenas o JSON puro.`,
      },
      {
        role: 'user',
        content: `${buildNutritionPrompt(params)}\n\nRetorne APENAS o JSON seguindo este schema exato:\n${JSON_SCHEMA}`,
      },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.6,
    max_tokens: 6000,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Resposta vazia do Groq');

  let plano;
  try {
    plano = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON inválido na resposta da IA');
    plano = JSON.parse(match[0]);
  }

  const planoFinal = validarPlano(plano);

  // Calcula água diária deterministicamente (35ml/kg)
  if (params.peso) {
    planoFinal.aguaDiaria = Math.round(params.peso * 35);
    planoFinal.aguaDicaContexto = `Baseado no seu peso (${params.peso}kg × 35ml). Aumente 500ml nos dias de treino intenso.`;
  }

  return planoFinal;
}

// ── Modifica plano existente via chat ─────────────────────────────────────────
async function modificarPlanoNutricional(planoAtual, pedido) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Você é um Nutricionista Esportivo de elite. Você receberá um plano nutricional completo e uma solicitação de modificação do usuário.

REGRAS:
1. Faça APENAS as modificações solicitadas — preserve todo o resto do plano
2. REGRA DE OURO: kcal do alimento = (proteina×4) + (carboidrato×4) + (gordura×9)
3. Use a tabela TACO para macros dos alimentos alterados:
   - Frango peito cozido/100g: 31.5g P, 0g C, 3.7g G
   - Ovo inteiro cozido/100g: 13.3g P, 0.5g C, 9.6g G
   - Arroz cozido/100g: 2.5g P, 28.1g C, 0.1g G
   - Batata-doce cozida/100g: 1.4g P, 18.4g C, 0.1g G
4. Preserve os campos aguaDiaria e aguaDicaContexto do plano original
5. Retorne JSON com: { "plano": {...plano completo modificado...}, "mensagem": "string descrevendo as alterações feitas" }
6. Sem markdown, sem \`\`\`json. Apenas JSON puro.`,
      },
      {
        role: 'user',
        content: `PLANO ATUAL:\n${JSON.stringify(planoAtual)}\n\nSOLICITAÇÃO: ${pedido}`,
      },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
    max_tokens: 6000,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Resposta vazia do Groq');

  let resultado;
  try {
    resultado = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSON inválido na resposta da IA');
    resultado = JSON.parse(match[0]);
  }

  if (!resultado.plano) throw new Error('Plano não retornado pela IA');

  // Preserva aguaDiaria do plano original caso a IA não inclua
  if (!resultado.plano.aguaDiaria && planoAtual.aguaDiaria) {
    resultado.plano.aguaDiaria = planoAtual.aguaDiaria;
    resultado.plano.aguaDicaContexto = planoAtual.aguaDicaContexto;
  }

  resultado.plano = validarPlano(resultado.plano);

  return {
    plano: resultado.plano,
    mensagem: resultado.mensagem || 'Plano atualizado com sucesso.',
  };
}

module.exports = { gerarPlanoNutricional, modificarPlanoNutricional };
