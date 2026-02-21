// ============================================================================
// GERADOR INTELIGENTE DE TREINOS
// ============================================================================

const exerciciosDB = {
  // PEITO
  peito: [
    { nome: 'Supino Reto com Barra',      dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Supino Inclinado com Barra',  dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Crucifixo com Halteres',      dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Supino com Halteres',         dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Flexão de Braço',             dificuldade: 'novato',        equipamento: 'casa'     },
    { nome: 'Flexão Inclinada',            dificuldade: 'novato',        equipamento: 'casa'     },
    { nome: 'Flexão Declinada',            dificuldade: 'intermediaria', equipamento: 'casa'     },
    { nome: 'Crossover',                   dificuldade: 'intermediaria', equipamento: 'grande'   },
    { nome: 'Supino Declinado',            dificuldade: 'intermediaria', equipamento: 'academia' },
  ],

  // COSTAS
  costas: [
    { nome: 'Barra Fixa',                  dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Puxada Frontal',              dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Remada Curvada com Barra',    dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Remada Unilateral',           dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Levantamento Terra',          dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Remada Baixa no Cabo',        dificuldade: 'novato',        equipamento: 'grande'   },
    { nome: 'Remada Invertida',            dificuldade: 'novato',        equipamento: 'casa'     },
    { nome: 'Superman',                    dificuldade: 'nunca',         equipamento: 'casa'     },
  ],

  // OMBROS
  ombro: [
    { nome: 'Desenvolvimento com Barra',   dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Desenvolvimento com Halteres',dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Elevação Lateral',            dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Elevação Frontal',            dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Remada Alta',                 dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Face Pull',                   dificuldade: 'novato',        equipamento: 'grande'   },
  ],

  // BÍCEPS
  biceps: [
    { nome: 'Rosca Direta com Barra',      dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Rosca Alternada',             dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Rosca Martelo',               dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Rosca Scott',                 dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Rosca Concentrada',           dificuldade: 'novato',        equipamento: 'academia' },
  ],

  // TRÍCEPS
  triceps: [
    { nome: 'Tríceps Testa',               dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Tríceps Corda',               dificuldade: 'novato',        equipamento: 'grande'   },
    { nome: 'Tríceps Francês',             dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Mergulho (Dips)',             dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Flexão Diamante',             dificuldade: 'intermediaria', equipamento: 'casa'     },
    { nome: 'Tríceps Pulley',              dificuldade: 'novato',        equipamento: 'academia' },
  ],

  // PERNAS
  pernas: [
    { nome: 'Agachamento Livre com Barra', dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Leg Press',                   dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Levantamento Terra Romeno',   dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Agachamento Búlgaro',         dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Cadeira Extensora',           dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Cadeira Flexora',             dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Panturrilha em Pé',           dificuldade: 'novato',        equipamento: 'academia' },
    { nome: 'Agachamento (Peso Corporal)', dificuldade: 'nunca',         equipamento: 'casa'     },
    { nome: 'Afundo',                      dificuldade: 'novato',        equipamento: 'casa'     },
    { nome: 'Passada Lateral',             dificuldade: 'novato',        equipamento: 'casa'     },
    { nome: 'Agachamento com Salto',       dificuldade: 'novato',        equipamento: 'casa'     },
    { nome: 'Step-Up com Salto',           dificuldade: 'intermediaria', equipamento: 'academia' },
  ],

  // ABDÔMEN
  abdomen: [
    { nome: 'Prancha Isométrica',          dificuldade: 'novato',        equipamento: 'casa'     },
    { nome: 'Abdominal Supra',             dificuldade: 'novato',        equipamento: 'casa'     },
    { nome: 'Abdominal Infra',             dificuldade: 'novato',        equipamento: 'casa'     },
    { nome: 'Russian Twist',               dificuldade: 'novato',        equipamento: 'casa'     },
    { nome: 'Abdominal Oblíquo',           dificuldade: 'novato',        equipamento: 'casa'     },
    { nome: 'Prancha Lateral',             dificuldade: 'intermediaria', equipamento: 'casa'     },
    { nome: 'Dead Bug',                    dificuldade: 'novato',        equipamento: 'casa'     },
    { nome: 'Hollow Body Hold',            dificuldade: 'intermediaria', equipamento: 'casa'     },
    { nome: 'Pallof Press',                dificuldade: 'novato',        equipamento: 'academia' },
  ],

  // MOBILIDADE
  mobilidade: [
    { nome: 'Rotação de Quadril',                       dificuldade: 'nunca',        equipamento: 'casa'     },
    { nome: 'World Greatest Stretch',                   dificuldade: 'novato',       equipamento: 'casa'     },
    { nome: 'Rotação Torácica em Quadrúpede',           dificuldade: 'novato',       equipamento: 'casa'     },
    { nome: 'Mobilização de Tornozelo',                 dificuldade: 'nunca',        equipamento: 'casa'     },
    { nome: 'Alongamento do Flexor de Quadril',         dificuldade: 'nunca',        equipamento: 'casa'     },
    { nome: 'Cat-Cow (Mobilidade de Coluna)',            dificuldade: 'nunca',        equipamento: 'casa'     },
    { nome: 'Mobilização de Quadril 90/90',             dificuldade: 'novato',       equipamento: 'casa'     },
    { nome: 'Afundo com Rotação de Tronco',             dificuldade: 'novato',       equipamento: 'casa'     },
    { nome: 'Separação de Escápulas em Quadrúpede',     dificuldade: 'nunca',        equipamento: 'casa'     },
    { nome: 'Agachamento de Mobilidade (Squat Hold)',   dificuldade: 'nunca',        equipamento: 'casa'     },
    { nome: 'Prancha com Rotação (Thread the Needle)',  dificuldade: 'novato',       equipamento: 'casa'     },
    { nome: 'Alongamento de Isquiotibiais em Pé',       dificuldade: 'nunca',        equipamento: 'casa'     },
    { nome: 'Rotação de Ombro com Bastão',              dificuldade: 'nunca',        equipamento: 'academia' },
    { nome: 'Abertura de Peito no Rolo de Espuma',      dificuldade: 'novato',       equipamento: 'academia' },
    { nome: 'Abertura de Pernas (Addutor no Solo)',     dificuldade: 'nunca',        equipamento: 'casa'     },
  ],
};

// ── Mapa: local da lesão → grupos musculares afetados ──────────────────────
const lesaoGruposAfetados = {
  ombro:          ['ombro', 'peito', 'triceps'],
  cotovelo_punho: ['biceps', 'triceps'],
  coluna_lombar:  ['costas'],
  coluna_cervical:['ombro'],
  quadril:        ['pernas'],
  joelho:         ['pernas'],
  tornozelo:      ['pernas'],
};

const localLesaoLabel = {
  ombro:          'ombro',
  cotovelo_punho: 'cotovelo/punho',
  coluna_lombar:  'coluna lombar',
  coluna_cervical:'pescoço',
  quadril:        'quadril',
  joelho:         'joelho',
  tornozelo:      'tornozelo',
};

// ── Foco esportivo: retorna grupos principais e estilo de treino ─────────────
function focoEsportivo(esporte, posicao) {
  const normalizar = s => (s || '').toLowerCase().trim();
  const mapa = {
    futebol: {
      goleiro:       { principais: ['pernas', 'ombro', 'costas', 'abdomen'], estilo: 'explosivo'   },
      zagueiro:      { principais: ['pernas', 'costas', 'abdomen'],           estilo: 'forca'       },
      lateral:       { principais: ['pernas', 'abdomen', 'costas'],           estilo: 'resistencia' },
      'meio-campo':  { principais: ['pernas', 'abdomen'],                     estilo: 'resistencia' },
      atacante:      { principais: ['pernas', 'abdomen'],                     estilo: 'explosivo'   },
    },
    basquete: {
      armador:       { principais: ['pernas', 'abdomen', 'costas'],           estilo: 'explosivo'   },
      'ala-armador': { principais: ['pernas', 'ombro', 'costas'],             estilo: 'explosivo'   },
      ala:           { principais: ['pernas', 'costas', 'ombro'],             estilo: 'explosivo'   },
      'ala-pivô':    { principais: ['pernas', 'costas', 'peito'],             estilo: 'forca'       },
      pivô:          { principais: ['pernas', 'costas', 'peito'],             estilo: 'forca'       },
    },
    volei: {
      levantador:    { principais: ['ombro', 'costas', 'abdomen'],            estilo: 'explosivo'   },
      oposto:        { principais: ['ombro', 'pernas', 'costas'],             estilo: 'explosivo'   },
      ponteiro:      { principais: ['pernas', 'ombro', 'costas'],             estilo: 'explosivo'   },
      central:       { principais: ['pernas', 'ombro', 'abdomen'],            estilo: 'explosivo'   },
      libero:        { principais: ['pernas', 'abdomen', 'costas'],           estilo: 'resistencia' },
    },
    tenis: {
      'linha de base':    { principais: ['pernas', 'costas', 'ombro'],        estilo: 'resistencia' },
      'serve-and-volley': { principais: ['ombro', 'pernas', 'costas'],        estilo: 'explosivo'   },
      recreativo:         { principais: ['costas', 'ombro', 'pernas'],        estilo: 'saude_geral' },
    },
    natacao: {
      'velocidade (sprint)': { principais: ['costas', 'ombro', 'peito'],      estilo: 'explosivo'   },
      'resistência (fundo)': { principais: ['costas', 'ombro', 'pernas'],     estilo: 'resistencia' },
      'polo aquático':       { principais: ['ombro', 'pernas', 'costas'],     estilo: 'explosivo'   },
    },
    corrida: {
      'velocista (até 400m)':   { principais: ['pernas', 'abdomen'],          estilo: 'explosivo'   },
      'meio-fundo (800m-5km)':  { principais: ['pernas', 'abdomen', 'costas'],estilo: 'resistencia' },
      'fundo/maratona':         { principais: ['pernas', 'abdomen', 'costas'],estilo: 'resistencia' },
    },
    luta: {
      'striking (boxe/muay thai)':  { principais: ['ombro', 'costas', 'pernas', 'abdomen'],estilo: 'explosivo' },
      'grappling (jiu-jitsu/luta)': { principais: ['costas', 'pernas', 'abdomen', 'biceps'],estilo: 'forca'    },
      'mma (completo)':             { principais: ['costas', 'pernas', 'ombro', 'abdomen'],estilo: 'explosivo' },
    },
    ciclismo: {
      sprinter:       { principais: ['pernas', 'abdomen'],                    estilo: 'explosivo'   },
      escalador:      { principais: ['pernas', 'abdomen'],                    estilo: 'resistencia' },
      contrarrelógio: { principais: ['pernas', 'costas', 'abdomen'],          estilo: 'resistencia' },
    },
    fut_americano: {
      quarterback:    { principais: ['ombro', 'costas', 'abdomen'],           estilo: 'explosivo'   },
      'running back': { principais: ['pernas', 'abdomen', 'costas'],          estilo: 'explosivo'   },
      'wide receiver':{ principais: ['pernas', 'ombro', 'abdomen'],           estilo: 'explosivo'   },
      lineman:        { principais: ['peito', 'costas', 'pernas', 'ombro'],   estilo: 'forca'       },
      linebacker:     { principais: ['pernas', 'costas', 'abdomen'],          estilo: 'explosivo'   },
    },
  };

  const e = normalizar(esporte);
  const p = normalizar(posicao);
  return mapa[e]?.[p] || { principais: ['pernas', 'costas', 'abdomen'], estilo: 'funcional' };
}

// ── Helper: escolhe exercício com bias para compostos quando disciplina fraca ─
function escolherExercicio(disponiveis, disciplina) {
  if (disponiveis.length === 0) return null;
  if (disciplina === 'frequentemente' && disponiveis.length > 2) {
    // Primeiros exercícios do DB são os compostos/clássicos → dá preferência
    const corte = Math.ceil(disponiveis.length / 2);
    const idx = Math.floor(Math.random() * corte);
    return disponiveis.splice(idx, 1)[0];
  }
  const idx = Math.floor(Math.random() * disponiveis.length);
  return disponiveis.splice(idx, 1)[0];
}

// ── Seleciona exercícios de mobilidade ──────────────────────────────────────
function selecionarMobilidade(params, num) {
  const { ambiente } = params;
  const ambienteMap = { casa: ['casa'], pequena: ['casa', 'academia'], grande: ['casa', 'academia'] };
  const permitidos = ambienteMap[ambiente] || ['casa', 'academia'];

  const pool = exerciciosDB.mobilidade
    .filter(ex => permitidos.includes(ex.equipamento))
    .slice(); // cópia

  const selecionados = [];
  for (let i = 0; i < Math.min(num, pool.length); i++) {
    const idx = Math.floor(Math.random() * pool.length);
    selecionados.push(pool.splice(idx, 1)[0]);
  }
  return selecionados;
}

// ── Determina a divisão de treino ────────────────────────────────────────────
function determinarDivisao(dias) {
  const divisoes = {
    3: {
      tipo: 'ABC',
      dias: [
        { dia: 'Seg', nome: 'Peito, Ombro e Tríceps', grupos: ['peito', 'ombro', 'triceps'] },
        { dia: 'Qua', nome: 'Costas e Bíceps',         grupos: ['costas', 'biceps']          },
        { dia: 'Sex', nome: 'Pernas e Abdômen',         grupos: ['pernas', 'abdomen']         },
      ],
    },
    4: {
      tipo: 'ABCD',
      dias: [
        { dia: 'Seg', nome: 'Peito e Tríceps',   grupos: ['peito', 'triceps']  },
        { dia: 'Ter', nome: 'Costas e Bíceps',   grupos: ['costas', 'biceps']  },
        { dia: 'Qui', nome: 'Pernas',            grupos: ['pernas']            },
        { dia: 'Sex', nome: 'Ombro e Abdômen',   grupos: ['ombro', 'abdomen']  },
      ],
    },
    5: {
      tipo: 'ABCDE',
      dias: [
        { dia: 'Seg', nome: 'Peito',                  grupos: ['peito']                    },
        { dia: 'Ter', nome: 'Costas',                 grupos: ['costas']                   },
        { dia: 'Qua', nome: 'Pernas',                 grupos: ['pernas']                   },
        { dia: 'Qui', nome: 'Ombro',                  grupos: ['ombro']                    },
        { dia: 'Sex', nome: 'Braços e Abdômen',       grupos: ['biceps', 'triceps', 'abdomen'] },
      ],
    },
    6: {
      tipo: 'ABCDEF',
      dias: [
        { dia: 'Seg', nome: 'Peito',              grupos: ['peito']             },
        { dia: 'Ter', nome: 'Costas',             grupos: ['costas']            },
        { dia: 'Qua', nome: 'Pernas',             grupos: ['pernas']            },
        { dia: 'Qui', nome: 'Ombro',              grupos: ['ombro']             },
        { dia: 'Sex', nome: 'Bíceps e Tríceps',   grupos: ['biceps', 'triceps'] },
        { dia: 'Sab', nome: 'Pernas e Abdômen',   grupos: ['pernas', 'abdomen'] },
      ],
    },
  };
  return divisoes[dias] || divisoes[4];
}

// ── Seleciona exercícios para um grupo muscular ──────────────────────────────
function selecionarExercicios(grupo, params) {
  const { experiencia, ambiente, lesao, localLesao } = params;
  let exercicios = exerciciosDB[grupo] || [];

  // Filtra por experiência
  exercicios = exercicios.filter(ex => {
    if (experiencia === 'nunca') return ex.dificuldade === 'novato' || ex.dificuldade === 'nunca';
    if (experiencia === 'novato') return ex.dificuldade !== 'intermediaria' || Math.random() > 0.7;
    return true;
  });

  // Filtra por ambiente
  const ambienteMap = { casa: ['casa'], pequena: ['casa', 'academia'], grande: ['casa', 'academia', 'grande'] };
  const permitidos = ambienteMap[ambiente] || ['academia', 'grande'];
  exercicios = exercicios.filter(ex => permitidos.includes(ex.equipamento));

  // Trata lesão com localização específica
  if (lesao !== 'nenhuma') {
    const gruposAfetados = lesaoGruposAfetados[localLesao] || [];
    if (localLesao && gruposAfetados.includes(grupo)) {
      // Grupo diretamente afetado → só exercícios básicos
      exercicios = exercicios.filter(ex => ex.dificuldade === 'novato' || ex.dificuldade === 'nunca');
    } else if (!localLesao) {
      // Sem local definido → restrição genérica
      exercicios = exercicios.filter(ex => ex.dificuldade === 'novato');
    }
    // Se local definido mas grupo não afetado → treina normalmente
  }

  return exercicios;
}

// ── Determina séries, reps e descanso ────────────────────────────────────────
function determinarSeriesReps(params, grupo) {
  const { experiencia, fadiga, duracao, objetivo, esporte, posicao } = params;

  let series = 3, reps = '8-12', descanso = 60;

  // Estilo efetivo: para esporte usa o foco da posição
  let estilo = objetivo;
  if (objetivo === 'esporte' && esporte && posicao) {
    estilo = focoEsportivo(esporte, posicao).estilo;
  }

  if (estilo === 'forca') {
    series = 5; reps = '4-6'; descanso = 120;
  } else if (estilo === 'resistencia' || estilo === 'emagrecimento' || estilo === 'condicionamento') {
    series = 3; reps = '15-20'; descanso = 40;
  } else if (estilo === 'explosivo') {
    series = 4; reps = '6-8'; descanso = 90;
  } else if (estilo === 'saude_geral' || estilo === 'funcional') {
    series = 3; reps = '10-15'; descanso = 60;
  } else {
    // hipertrofia (default)
    series = 3; reps = '8-12'; descanso = 60;
  }

  // Ajusta por experiência
  if (experiencia === 'nunca') {
    series = Math.max(2, series - 1);
    if (estilo !== 'forca') reps = '10-15';
  } else if (experiencia === 'intermediaria') {
    series = series + 1;
    if (estilo === 'hipertrofia' || !objetivo) reps = '6-10';
  }

  // Ajusta por fadiga
  if (fadiga === 'evito')     series = Math.max(2, series - 1);
  else if (fadiga === 'nao')  series = series + 1;

  // Ajusta por duração
  if (duracao === 'curto')    series = Math.max(2, series - 1);
  else if (duracao === 'longo') series = series + 1;

  // Mobilidade e abdômen sempre têm menos séries e mais reps
  if (grupo === 'abdomen' || grupo === 'mobilidade') {
    reps = grupo === 'mobilidade' ? '8-10 reps cada lado' : '15-20';
    series = Math.min(series, 3);
    descanso = grupo === 'mobilidade' ? 20 : 30;
  }

  return { series, reps, descanso };
}

// ── Gerador principal ────────────────────────────────────────────────────────
function gerarTreinoPersonalizado(params) {
  const {
    diasTreino   = 4,
    experiencia  = 'novato',
    fadiga       = 'consigo',
    lesao        = 'nenhuma',
    localLesao   = '',
    duracao      = 'normal',
    disciplina   = 'intermediario',
    variedade    = 'intermediario',
    ambiente     = 'grande',
    muscular     = 'pouco',
    objetivo     = 'hipertrofia',
    esporte      = '',
    posicao      = '',
  } = params;

  const divisao = determinarDivisao(diasTreino);

  // Foco esportivo (quando aplicável)
  const foco = (objetivo === 'esporte' && esporte && posicao)
    ? focoEsportivo(esporte, posicao)
    : null;

  // Observação de lesão para grupo afetado
  const gruposAfetados = localLesao ? (lesaoGruposAfetados[localLesao] || []) : [];
  const obsLesao = localLesao
    ? `Região do ${localLesaoLabel[localLesao] || localLesao} sensível. Use carga leve e priorize a técnica.`
    : 'Execute com cuidado, respeitando seus limites.';

  // Disciplina fraca → treino mais curto
  const disciplinaFraca = disciplina === 'frequentemente';

  const diasGerados = divisao.dias.map(dia => {
    const exerciciosDoDia = [];
    let ordem = 1;

    dia.grupos.forEach(grupo => {
      const disponiveis = selecionarExercicios(grupo, params);

      // Quantos exercícios por grupo
      let numEx = 3;
      if (duracao === 'curto')        numEx = 2;
      if (duracao === 'longo')        numEx = 4;
      if (dia.grupos.length > 2)      numEx = 2;
      if (disciplinaFraca)            numEx = Math.max(2, numEx - 1); // sessões menores = mais fácil de manter
      if (foco && foco.principais.includes(grupo)) numEx = Math.min(numEx + 1, 5); // extra no foco esportivo

      const isGrupoAfetado = lesao !== 'nenhuma' && localLesao && gruposAfetados.includes(grupo);

      for (let i = 0; i < Math.min(numEx, disponiveis.length); i++) {
        const ex = escolherExercicio(disponiveis, disciplina);
        if (!ex) break;

        const { series, reps, descanso } = determinarSeriesReps(params, grupo);

        exerciciosDoDia.push({
          nome: ex.nome,
          grupoMuscular: grupo,
          series,
          repeticoes: reps,
          descanso,
          observacoes: isGrupoAfetado ? obsLesao : (lesao !== 'nenhuma' ? 'Execute com cuidado.' : ''),
          videoUrl: ex.videoUrl || '',
          ordem: ordem++,
        });
      }
    });

    // ── Adiciona mobilidade ao final de cada dia ──────────────────────────
    const numMob = objetivo === 'esporte' ? 3 : 2;
    const exerciciosMob = selecionarMobilidade(params, numMob);
    exerciciosMob.forEach(ex => {
      exerciciosDoDia.push({
        nome: ex.nome,
        grupoMuscular: 'mobilidade',
        series: 2,
        repeticoes: '8-10 reps cada lado',
        descanso: 20,
        observacoes: 'Mobilidade — foque na amplitude de movimento, sem pressa.',
        videoUrl: '',
        ordem: ordem++,
      });
    });

    const duracaoEstimada = exerciciosDoDia.reduce((total, ex) => {
      return total + (ex.series * 2) + (ex.series * (ex.descanso / 60));
    }, 0);

    return {
      dia: dia.dia,
      nome: dia.nome,
      focoPrincipal: dia.grupos,
      exercicios: exerciciosDoDia,
      duracaoEstimada: Math.round(duracaoEstimada),
      dificuldade: experiencia === 'nunca' ? 'facil' : experiencia === 'novato' ? 'moderado' : 'dificil',
    };
  });

  // ── Monta nome/descrição/tipo baseados no objetivo ───────────────────────
  const esporteNomes = {
    futebol: 'Futebol', basquete: 'Basquete', volei: 'Vôlei', tenis: 'Tênis',
    natacao: 'Natação', corrida: 'Corrida', luta: 'Lutas/MMA', ciclismo: 'Ciclismo',
    fut_americano: 'Futebol Americano',
  };

  const objetivoInfo = {
    hipertrofia:    { nome: 'Hipertrofia',    desc: 'Focado em ganho de massa muscular com séries moderadas e sobrecarga progressiva.' },
    forca:          { nome: 'Força',          desc: 'Focado em desenvolver força máxima com cargas altas e baixas repetições.'        },
    emagrecimento:  { nome: 'Emagrecimento',  desc: 'Focado em queima calórica com alta repetição, pouco descanso e volume elevado.'   },
    condicionamento:{ nome: 'Condicionamento',desc: 'Focado em resistência e condicionamento físico geral.'                           },
    saude_geral:    { nome: 'Saúde Geral',    desc: 'Equilíbrio entre força, resistência e bem-estar, ideal para qualidade de vida.'  },
  };

  const tipoMap = {
    hipertrofia: 'hipertrofia', forca: 'forca', emagrecimento: 'emagrecimento',
    condicionamento: 'resistencia', saude_geral: 'funcional', esporte: 'funcional',
  };

  const nivelNome = experiencia === 'nunca' ? 'Iniciante' : experiencia === 'novato' ? 'Novato' : 'Intermediário';

  let nomeWorkout, descWorkout;

  if (objetivo === 'esporte' && esporte && posicao) {
    const esporteLabel = esporteNomes[esporte] || esporte;
    const focoPrincipais = foco ? foco.principais.join(', ') : 'grupos variados';
    nomeWorkout = `Treino ${divisao.tipo} — ${esporteLabel} (${posicao})`;
    descWorkout  = `Programa específico para ${posicao.toLowerCase()} de ${esporteLabel.toLowerCase()}, `
      + `com foco em ${focoPrincipais} e mobilidade integrada em todos os dias.`;
  } else {
    const info = objetivoInfo[objetivo] || objetivoInfo.hipertrofia;
    const sufixoDisciplina = disciplinaFraca ? ' — Curto e Dinâmico' : '';
    nomeWorkout = `Treino ${divisao.tipo} — ${info.nome} (${nivelNome})${sufixoDisciplina}`;
    descWorkout  = disciplinaFraca
      ? `${info.desc} Sessões mais curtas e variadas para manter a motivação e garantir consistência.`
      : info.desc;
  }

  return {
    nome: nomeWorkout,
    descricao: descWorkout,
    tipo: tipoMap[objetivo] || 'hipertrofia',
    nivel: experiencia === 'nunca' ? 'iniciante' : experiencia === 'novato' ? 'intermediario' : 'avancado',
    divisao: divisao.tipo,
    diasPorSemana: diasTreino,
    dias: diasGerados,
    parametros: params,
  };
}

module.exports = { gerarTreinoPersonalizado };
