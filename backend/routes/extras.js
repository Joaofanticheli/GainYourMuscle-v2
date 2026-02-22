const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Helper HTTP GET JSON ──────────────────────────────────────────────────────
function httpGet(url) {
  const mod = url.startsWith('https') ? require('https') : require('http');
  return new Promise((resolve, reject) => {
    mod.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: null }); }
      });
    }).on('error', reject);
  });
}

// ── GIF de exercício via Giphy ────────────────────────────────────────────────
router.get('/exercise-gif', protect, async (req, res) => {
  try {
    const { nome } = req.query;
    if (!nome) return res.status(400).json({ success: false });

    const apiKey = process.env.GIPHY_API_KEY;
    if (!apiKey) return res.json({ success: false, gifUrl: null });

    const query = encodeURIComponent(`${nome} exercise workout how to`);
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${query}&limit=8&rating=g&lang=en`;
    const { body } = await httpGet(url);

    const gif = body?.data?.[0];
    if (!gif) return res.json({ success: false, gifUrl: null });

    const gifUrl = gif.images?.downsized_medium?.url
      || gif.images?.fixed_height?.url
      || gif.images?.original?.url
      || null;

    res.json({ success: true, gifUrl });
  } catch (err) {
    console.error('Erro busca GIF:', err.message);
    res.json({ success: false, gifUrl: null });
  }
});

// ── Verifica se um vídeo pode ser embedado via oEmbed ─────────────────────────
async function isEmbeddable(videoId) {
  try {
    const https = require('https');
    return await new Promise((resolve) => {
      const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      https.get(url, (res) => {
        resolve(res.statusCode === 200);
        res.resume();
      }).on('error', () => resolve(false));
    });
  } catch {
    return false;
  }
}

// ── YouTube: busca vídeo de demonstração de exercício ─────────────────────────
router.get('/youtube/video', protect, async (req, res) => {
  try {
    const { nome } = req.query;
    if (!nome) return res.status(400).json({ success: false, message: 'Nome do exercício obrigatório' });

    const YouTube = require('youtube-sr').default;
    const query = `${nome} execução correta musculação tutorial`;
    const results = await YouTube.search(query, { limit: 12, type: 'video' });

    // Filtra: duração entre 30s e 8 minutos
    const candidatos = results.filter(v => {
      const dur = v.duration || 0; // duração em ms
      return dur >= 30000 && dur <= 480000;
    });

    // Tenta até 4 candidatos para achar um com embed habilitado
    for (const video of candidatos.slice(0, 4)) {
      const ok = await isEmbeddable(video.id);
      if (ok) {
        return res.json({ success: true, videoId: video.id, title: video.title });
      }
    }

    return res.json({ success: false, videoId: null });
  } catch (err) {
    console.error('Erro busca YouTube:', err.message);
    res.json({ success: false, videoId: null });
  }
});

// ── Chat Dúvidas: IA especialista fitness/nutrição contextual ─────────────────
router.post('/chat/duvidas', protect, async (req, res) => {
  try {
    const { mensagem, historico = [] } = req.body;
    if (!mensagem) return res.status(400).json({ success: false, message: 'Mensagem obrigatória' });

    const User = require('../models/User');
    const user = await User.findById(req.user._id).select('perfil treinoAtual planoNutricional');

    const perfilCtx = user?.perfil
      ? `Dados do aluno: ${user.perfil.peso}kg, ${user.perfil.altura}cm, ${user.perfil.idade} anos, ${user.perfil.sexo}.`
      : '';

    const treinoCtx = user?.treinoAtual
      ? `Treino atual: ${user.treinoAtual.nome || 'personalizado'}, objetivo ${user.treinoAtual.tipo || 'geral'}, nível ${user.treinoAtual.nivel || 'intermediário'}.`
      : '';

    const nutricaoCtx = user?.planoNutricional
      ? `Plano nutricional: ${user.planoNutricional.calorias || 0} kcal/dia, objetivo ${user.planoNutricional.objetivo || 'geral'}.`
      : '';

    const systemPrompt = `Você é um especialista em fitness, musculação e nutrição esportiva, com base na metodologia de Fabrício Pacholok.
Você está respondendo dúvidas de um aluno específico — responda sempre no contexto do perfil e plano dele.

${perfilCtx}
${treinoCtx}
${nutricaoCtx}

REGRAS:
- Responda em português brasileiro, de forma clara e direta
- Seja conciso: máximo 3 parágrafos curtos — vá direto ao ponto
- Explique o PORQUÊ de forma rápida, sem enrolação
- Use exemplos práticos quando necessário
- Nunca dê diagnósticos médicos — para dores persistentes, oriente a buscar profissional`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...historico.slice(-10),
      { role: 'user', content: mensagem },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 512,
    });

    const resposta = completion.choices[0]?.message?.content || 'Não consegui processar sua dúvida. Tente novamente.';
    res.json({ success: true, resposta });
  } catch (err) {
    console.error('Erro chat dúvidas:', err.message);
    res.status(500).json({ success: false, message: 'Erro ao processar dúvida' });
  }
});

// ── Nutrição: modificar plano via IA ─────────────────────────────────────────
router.post('/nutrition/modify', protect, async (req, res) => {
  try {
    const { plano, pedido } = req.body;
    if (!plano || !pedido) {
      return res.status(400).json({ success: false, message: 'Plano e pedido obrigatórios' });
    }

    const systemPrompt = `Você é um Nutricionista Esportivo de elite especializado em modificações de planos alimentares.

REGRAS DE CÁLCULO — NUNCA VIOLE:
- Calorias = (proteína × 4) + (carboidrato × 4) + (gordura × 9)
- Ao trocar um alimento: use os valores reais da tabela TACO (Brasil)
- Após trocar: recalcule calorias e macros do ALIMENTO → da REFEIÇÃO → do PLANO TOTAL
- calorias da refeição = soma das calorias de todos os alimentos dela
- macros da refeição = soma dos macros de todos os alimentos dela
- calorias totais do plano = soma das calorias de todas as refeições
- macros totais do plano = soma dos macros de todas as refeições

TABELA TACO — VALORES POR 100g (use como referência):
Frango grelhado: 159kcal P:31 C:0 G:3.5 | Carne bovina magra: 163kcal P:28 C:0 G:5
Atum em água: 130kcal P:29 C:0 G:1 | Salmão: 208kcal P:20 C:0 G:13
Ovo inteiro (50g=1und): 78kcal P:6.5 C:0.6 G:5.5 | Clara (33g): 17kcal P:3.6 C:0.2 G:0
Arroz branco cozido: 130kcal P:2.7 C:28 G:0.3 | Arroz integral cozido: 124kcal P:2.6 C:26 G:1
Batata-doce cozida: 77kcal P:1.4 C:18 G:0.1 | Mandioca cozida: 125kcal P:1 C:30 G:0.3
Macarrão cozido: 149kcal P:5 C:30 G:1.2 | Pão integral (50g): 134kcal P:5 C:25 G:2
Aveia em flocos: 394kcal P:14 C:67 G:9 | Banana (100g): 98kcal P:1.3 C:26 G:0.1
Maçã (150g): 87kcal P:0.4 C:23 G:0.2 | Laranja (180g): 85kcal P:1.7 C:20 G:0.2
Feijão cozido: 76kcal P:4.5 C:14 G:0.5 | Lentilha cozida: 93kcal P:6.3 C:17 G:0.4
Brócolis cozido: 34kcal P:2.9 C:5 G:0.4 | Espinafre cozido: 28kcal P:2.9 C:3.4 G:0.4
Tomate (100g): 15kcal P:0.9 C:3.5 G:0.2 | Cenoura cozida: 41kcal P:0.9 C:9.6 G:0.3
Queijo cottage (100g): 98kcal P:11 C:3.4 G:4.5 | Iogurte grego (100g): 97kcal P:9 C:4 G:5
Whey protein (30g): 120kcal P:24 C:3 G:1.5 | Leite desnatado (200ml): 68kcal P:6.8 C:9.6 G:0.2
Azeite (10ml): 88kcal P:0 C:0 G:10 | Abacate (100g): 160kcal P:1.5 C:9 G:15
Castanha-do-pará (20g): 135kcal P:2.9 C:0.6 G:14 | Amendoim (30g): 176kcal P:8 C:5 G:15
Tofu (100g): 76kcal P:8 C:1.9 G:4.8 | Grão-de-bico cozido: 129kcal P:7 C:22 G:2

REGRAS DO PLANO:
- Proteína nunca abaixo de 1.6g/kg de peso corporal
- Gordura nunca abaixo de 20% das calorias totais
- Fibras mínimo 25g/dia
- Respeite restrições alimentares do plano original (vegetariano, vegano, etc.)
- Só mude o que foi pedido — mantenha tudo o resto igual
- A estrutura JSON deve ser IDÊNTICA ao plano original

Responda SOMENTE com JSON válido neste formato:
{
  "plano": { /* plano completo e atualizado, mesma estrutura do original */ },
  "mensagem": "2 frases explicando o que mudou e o impacto nos macros"
}`;

    const userMsg = `Plano atual (JSON completo):\n${JSON.stringify(plano)}\n\nModificação solicitada pelo usuário: "${pedido}"\n\nIMPORTANTE: Recalcule todos os macros e calorias afetados pela mudança, do alimento até os totais do plano.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMsg },
      ],
      temperature: 0.2,
      max_tokens: 6000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '';
    let resultado;
    try {
      resultado = JSON.parse(content);
    } catch {
      const match = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').match(/\{[\s\S]*\}/);
      if (!match) throw new Error('IA não retornou JSON válido');
      resultado = JSON.parse(match[0]);
    }

    const planoModificado = resultado.plano;
    const mensagem = resultado.mensagem || 'Plano atualizado com sucesso!';

    if (!planoModificado || !planoModificado.refeicoes) {
      throw new Error('Plano modificado inválido — estrutura incorreta');
    }

    // Garante que geradoEm é preservado
    planoModificado.geradoEm = plano.geradoEm || new Date().toISOString();

    // Salva o plano modificado no banco
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    user.planoNutricional = planoModificado;
    user.markModified('planoNutricional');
    await user.save();

    res.json({ success: true, plano: planoModificado, mensagem });
  } catch (err) {
    console.error('Erro ao modificar plano nutricional:', err.message);
    res.status(500).json({ success: false, message: 'Erro ao modificar plano nutricional' });
  }
});

module.exports = router;
