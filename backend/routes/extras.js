const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── YouTube: busca vídeo específico do Fabrício Pacholok ──────────────────────
router.get('/youtube/video', protect, async (req, res) => {
  try {
    const { nome } = req.query;
    if (!nome) return res.status(400).json({ success: false, message: 'Nome do exercício obrigatório' });

    const YouTube = require('youtube-sr').default;
    const query = `${nome} execução correta musculação`;
    const results = await YouTube.search(query, { limit: 5, type: 'video' });
    const pacholokVideo = results[0];

    if (!pacholokVideo) {
      return res.json({ success: false, videoId: null });
    }

    res.json({ success: true, videoId: pacholokVideo.id, title: pacholokVideo.title });
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
- Seja educativo: explique o PORQUÊ, não apenas o QUE fazer
- Use exemplos concretos e práticos
- Quando falar de exercícios, mencione biomecânica e execução correta
- Quando falar de nutrição, explique o impacto no corpo
- Se não souber algo específico do aluno, pergunte
- Mantenha respostas entre 3 e 8 parágrafos — completo mas sem enrolação
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
      max_tokens: 1024,
    });

    const resposta = completion.choices[0]?.message?.content || 'Não consegui processar sua dúvida. Tente novamente.';
    res.json({ success: true, resposta });
  } catch (err) {
    console.error('Erro chat dúvidas:', err.message);
    res.status(500).json({ success: false, message: 'Erro ao processar dúvida' });
  }
});

module.exports = router;
