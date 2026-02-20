// ============================================================================
// GERADOR INTELIGENTE DE TREINOS
// ============================================================================
// Este arquivo contém a lógica para gerar treinos personalizados
// baseados nas respostas do questionário do usuário

/**
 * Banco de dados de exercícios
 * Cada exercício tem: nome, grupo muscular, dificuldade, equipamento necessário
 */
const exerciciosDB = {
  // PEITO
  peito: [
    { nome: 'Supino Reto', dificuldade: 'intermediaria', equipamento: 'academia', videoUrl: 'https://youtube.com/...' },
    { nome: 'Supino Inclinado', dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Supino Declinado', dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Crucifixo com Halteres', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Flexão de Braço', dificuldade: 'novato', equipamento: 'casa' },
    { nome: 'Flexão Declinada', dificuldade: 'intermediaria', equipamento: 'casa' },
    { nome: 'Crossover', dificuldade: 'intermediaria', equipamento: 'grande' },
  ],

  // COSTAS
  costas: [
    { nome: 'Barra Fixa', dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Puxada Frontal', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Remada Curvada', dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Remada Unilateral', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Levantamento Terra', dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Remada Invertida', dificuldade: 'novato', equipamento: 'casa' },
  ],

  // OMBROS
  ombro: [
    { nome: 'Desenvolvimento com Barra', dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Desenvolvimento com Halteres', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Elevação Lateral', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Elevação Frontal', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Remada Alta', dificuldade: 'novato', equipamento: 'academia' },
  ],

  // BÍCEPS
  biceps: [
    { nome: 'Rosca Direta', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Rosca Alternada', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Rosca Martelo', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Rosca Scott', dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Rosca Concentrada', dificuldade: 'novato', equipamento: 'academia' },
  ],

  // TRÍCEPS
  triceps: [
    { nome: 'Tríceps Testa', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Tríceps Corda', dificuldade: 'novato', equipamento: 'grande' },
    { nome: 'Tríceps Francês', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Mergulho', dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Flexão Diamante', dificuldade: 'intermediaria', equipamento: 'casa' },
  ],

  // PERNAS
  pernas: [
    { nome: 'Agachamento Livre', dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Leg Press', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Cadeira Extensora', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Cadeira Flexora', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Agachamento Búlgaro', dificuldade: 'intermediaria', equipamento: 'academia' },
    { nome: 'Panturrilha em Pé', dificuldade: 'novato', equipamento: 'academia' },
    { nome: 'Agachamento Livre (Peso Corporal)', dificuldade: 'nunca', equipamento: 'casa' },
    { nome: 'Afundo', dificuldade: 'novato', equipamento: 'casa' },
  ],

  // ABDÔMEN
  abdomen: [
    { nome: 'Abdominal Supra', dificuldade: 'novato', equipamento: 'casa' },
    { nome: 'Abdominal Infra', dificuldade: 'novato', equipamento: 'casa' },
    { nome: 'Prancha', dificuldade: 'novato', equipamento: 'casa' },
    { nome: 'Abdominal Oblíquo', dificuldade: 'novato', equipamento: 'casa' },
    { nome: 'Prancha Lateral', dificuldade: 'intermediaria', equipamento: 'casa' },
  ]
};

/**
 * Determina a divisão de treino baseada nos dias disponíveis
 * @param {number} dias - Número de dias de treino por semana
 * @returns {object} - Divisão de treino
 */
function determinarDivisao(dias) {
  const divisoes = {
    3: {
      tipo: 'ABC',
      dias: [
        { dia: 'Seg', nome: 'Peito, Ombro e Tríceps', grupos: ['peito', 'ombro', 'triceps'] },
        { dia: 'Qua', nome: 'Costas e Bíceps', grupos: ['costas', 'biceps'] },
        { dia: 'Sex', nome: 'Pernas e Abdômen', grupos: ['pernas', 'abdomen'] }
      ]
    },
    4: {
      tipo: 'ABCD',
      dias: [
        { dia: 'Seg', nome: 'Peito e Tríceps', grupos: ['peito', 'triceps'] },
        { dia: 'Ter', nome: 'Costas e Bíceps', grupos: ['costas', 'biceps'] },
        { dia: 'Qui', nome: 'Pernas', grupos: ['pernas'] },
        { dia: 'Sex', nome: 'Ombro e Abdômen', grupos: ['ombro', 'abdomen'] }
      ]
    },
    5: {
      tipo: 'ABCDE',
      dias: [
        { dia: 'Seg', nome: 'Peito', grupos: ['peito'] },
        { dia: 'Ter', nome: 'Costas', grupos: ['costas'] },
        { dia: 'Qua', nome: 'Pernas', grupos: ['pernas'] },
        { dia: 'Qui', nome: 'Ombro', grupos: ['ombro'] },
        { dia: 'Sex', nome: 'Braços', grupos: ['biceps', 'triceps', 'abdomen'] }
      ]
    },
    6: {
      tipo: 'ABCDEF',
      dias: [
        { dia: 'Seg', nome: 'Peito', grupos: ['peito'] },
        { dia: 'Ter', nome: 'Costas', grupos: ['costas'] },
        { dia: 'Qua', nome: 'Pernas', grupos: ['pernas'] },
        { dia: 'Qui', nome: 'Ombro', grupos: ['ombro'] },
        { dia: 'Sex', nome: 'Bíceps e Tríceps', grupos: ['biceps', 'triceps'] },
        { dia: 'Sab', nome: 'Pernas e Abdômen', grupos: ['pernas', 'abdomen'] }
      ]
    }
  };

  return divisoes[dias] || divisoes[4]; // Default 4 dias
}

/**
 * Seleciona exercícios apropriados para o grupo muscular
 * @param {string} grupo - Grupo muscular
 * @param {object} params - Parâmetros do usuário
 * @returns {array} - Lista de exercícios selecionados
 */
function selecionarExercicios(grupo, params) {
  const { experiencia, ambiente, lesao } = params;

  // Filtra exercícios do grupo
  let exercicios = exerciciosDB[grupo] || [];

  // Filtra por experiência
  exercicios = exercicios.filter(ex => {
    if (experiencia === 'nunca') return ex.dificuldade === 'novato' || ex.dificuldade === 'nunca';
    if (experiencia === 'novato') return ex.dificuldade !== 'intermediaria' || Math.random() > 0.7;
    return true; // Intermediário pode fazer todos
  });

  // Filtra por ambiente
  const ambienteMap = {
    'casa': ['casa'],
    'pequena': ['casa', 'academia'],
    'grande': ['casa', 'academia', 'grande']
  };

  const equipamentosPermitidos = ambienteMap[ambiente] || ['academia', 'grande'];
  exercicios = exercicios.filter(ex =>
    equipamentosPermitidos.includes(ex.equipamento)
  );

  // Se tem lesão, evita exercícios complexos
  if (lesao !== 'nenhuma') {
    exercicios = exercicios.filter(ex => ex.dificuldade === 'novato');
  }

  return exercicios;
}

/**
 * Determina séries e repetições baseado nos parâmetros
 * @param {object} params - Parâmetros do usuário
 * @param {string} grupo - Grupo muscular
 * @returns {object} - Séries e repetições e descanso
 */
function determinarSeriesReps(params, grupo) {
  const { experiencia, fadiga, duracao, objetivo } = params;

  let series = 3;
  let reps = '8-12';
  let descanso = 60;

  // Prioridade: objetivo define o perfil base
  if (objetivo === 'forca') {
    series = 5;
    reps = '4-6';
    descanso = 120;
  } else if (objetivo === 'emagrecimento' || objetivo === 'condicionamento') {
    series = 3;
    reps = '15-20';
    descanso = 40;
  } else if (objetivo === 'saude_geral') {
    series = 3;
    reps = '10-15';
    descanso = 60;
  } else {
    // hipertrofia (default)
    series = 3;
    reps = '8-12';
    descanso = 60;
  }

  // Ajusta por experiência
  if (experiencia === 'nunca') {
    series = Math.max(2, series - 1);
    if (objetivo !== 'forca') reps = '10-15';
  } else if (experiencia === 'intermediaria') {
    series = series + 1;
    if (objetivo === 'hipertrofia' || !objetivo) reps = '6-10';
  }

  // Ajusta por fadiga
  if (fadiga === 'evito') {
    series = Math.max(2, series - 1);
  } else if (fadiga === 'nao') {
    series = series + 1;
  }

  // Ajusta por duração
  if (duracao === 'curto') {
    series = Math.max(2, series - 1);
  } else if (duracao === 'longo') {
    series = series + 1;
  }

  // Abdômen tem mais reps e menos séries
  if (grupo === 'abdomen') {
    reps = '15-20';
    series = Math.min(series, 3);
    descanso = 30;
  }

  return { series, reps, descanso };
}

/**
 * Gera um treino completo personalizado
 * @param {object} params - Parâmetros do questionário
 * @returns {object} - Treino completo
 */
function gerarTreinoPersonalizado(params) {
  const {
    diasTreino = 4,
    experiencia = 'novato',
    fadiga = 'consigo',
    lesao = 'nenhuma',
    duracao = 'normal',
    disciplina = 'intermediario',
    variedade = 'intermediario',
    ambiente = 'grande',
    muscular = 'pouco',
    objetivo = 'hipertrofia'
  } = params;

  // 1. Determina a divisão de treino
  const divisao = determinarDivisao(diasTreino);

  // 2. Gera os dias de treino
  const diasGerados = divisao.dias.map((dia, index) => {
    const exerciciosDoDia = [];
    let ordem = 1;

    // Para cada grupo muscular do dia
    dia.grupos.forEach(grupo => {
      // Seleciona exercícios apropriados
      const exerciciosDisponiveis = selecionarExercicios(grupo, params);

      // Determina quantos exercícios por grupo
      let numExercicios = 3;
      if (duracao === 'curto') numExercicios = 2;
      if (duracao === 'longo') numExercicios = 4;
      if (dia.grupos.length > 2) numExercicios = 2; // Se treina muitos grupos no mesmo dia

      // Seleciona exercícios aleatórios
      const exerciciosSelecionados = [];
      const disponiveis = [...exerciciosDisponiveis];

      for (let i = 0; i < Math.min(numExercicios, disponiveis.length); i++) {
        const randomIndex = Math.floor(Math.random() * disponiveis.length);
        const exercicio = disponiveis.splice(randomIndex, 1)[0];

        const { series, reps, descanso: descansoBase } = determinarSeriesReps(params, grupo);

        exerciciosSelecionados.push({
          nome: exercicio.nome,
          grupoMuscular: grupo,
          series,
          repeticoes: reps,
          descanso: descansoBase,
          observacoes: lesao !== 'nenhuma' ? 'Execute com cuidado, respeitando seus limites' : '',
          videoUrl: exercicio.videoUrl || '',
          ordem: ordem++
        });
      }

      exerciciosDoDia.push(...exerciciosSelecionados);
    });

    // Calcula duração estimada (2min por série + descanso)
    const duracaoEstimada = exerciciosDoDia.reduce((total, ex) => {
      return total + (ex.series * 2) + (ex.series * (ex.descanso / 60));
    }, 0);

    return {
      dia: dia.dia,
      nome: dia.nome,
      focoPrincipal: dia.grupos,
      exercicios: exerciciosDoDia,
      duracaoEstimada: Math.round(duracaoEstimada),
      dificuldade: experiencia === 'nunca' ? 'facil' : experiencia === 'novato' ? 'moderado' : 'dificil'
    };
  });

  // 3. Monta nome e descrição baseados no objetivo
  const objetivoNomes = {
    hipertrofia:    { nome: 'Hipertrofia', desc: 'Focado em ganho de massa muscular com séries moderadas e sobrecarga progressiva.' },
    forca:          { nome: 'Força',       desc: 'Focado em desenvolver força máxima com cargas altas e baixas repetições.' },
    emagrecimento:  { nome: 'Emagrecimento', desc: 'Focado em queima calórica com alta repetição, pouco descanso e volume elevado.' },
    condicionamento:{ nome: 'Condicionamento', desc: 'Focado em resistência e condicionamento físico geral.' },
    saude_geral:    { nome: 'Saúde Geral', desc: 'Equilíbrio entre força, resistência e bem-estar, ideal para qualidade de vida.' }
  };
  const nivelNome = experiencia === 'nunca' ? 'Iniciante' : experiencia === 'novato' ? 'Novato' : 'Intermediário';
  const objInfo = objetivoNomes[objetivo] || objetivoNomes.hipertrofia;

  // 4. Mapeia objetivo para o campo `tipo` do modelo
  const tipoMap = {
    hipertrofia: 'hipertrofia',
    forca: 'forca',
    emagrecimento: 'emagrecimento',
    condicionamento: 'resistencia',
    saude_geral: 'funcional'
  };

  return {
    nome: `Treino ${divisao.tipo} - ${objInfo.nome} (${nivelNome})`,
    descricao: objInfo.desc,
    tipo: tipoMap[objetivo] || 'hipertrofia',
    nivel: experiencia === 'nunca' ? 'iniciante' : experiencia === 'novato' ? 'intermediario' : 'avancado',
    divisao: divisao.tipo,
    diasPorSemana: diasTreino,
    dias: diasGerados,
    parametros: params
  };
}

// Exporta a função principal
module.exports = {
  gerarTreinoPersonalizado
};
