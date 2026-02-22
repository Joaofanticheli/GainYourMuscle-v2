const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

    const systemPrompt = `Você é um nutricionista especialista em nutrição esportiva.
O usuário vai te pedir modificações no plano alimentar dele.

REGRAS OBRIGATÓRIAS:
- Retorne APENAS um JSON válido, sem texto antes ou depois
- Mantenha EXATAMENTE a mesma estrutura do plano original
- Faça a modificação solicitada mantendo o equilíbrio nutricional
- Ajuste calorias e macros se necessário após a modificação
- Use o formato:
{
  "plano": { /* plano completo com as modificações */ },
  "mensagem": "Explicação curta e amigável das mudanças feitas (2-3 frases)"
}`;

    const userMsg = `Plano atual:\n${JSON.stringify(plano)}\n\nModificação solicitada: ${pedido}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMsg },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const resposta = completion.choices[0]?.message?.content || '';

    // Remove possível markdown code block
    const limpa = resposta.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = limpa.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('IA não retornou JSON válido');

    const resultado = JSON.parse(jsonMatch[0]);
    const planoModificado = resultado.plano;
    const mensagem = resultado.mensagem || 'Plano atualizado com sucesso!';

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
