const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const db = require('../db');
const { deriveMood, sobrietyDays } = require('../utils/petLogic');

router.post('/', requireAuth, async (req, res) => {
  const { message, history = [] } = req.body || {};
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: 'AI chat is not configured' });
  }

  let pet;
  try {
    const petResult = await db.query('SELECT * FROM pets WHERE user_id = $1', [req.userId]);
    pet = petResult.rows[0];
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
  } catch (err) {
    console.error('chat pet lookup error:', err);
    return res.status(500).json({ error: 'Failed to load pet' });
  }

  const mood = deriveMood(pet);
  const days = sobrietyDays(pet);

  const system = `You are ${pet.name}, a small living sprout who is the companion of a person in recovery.
You sound like a kind friend: natural, warm, and present. Avoid slogans, lectures, therapy jargon, and overly poetic language.
Your current mood is "${mood}" (health: ${Math.round(pet.health)}/100, happiness: ${Math.round(pet.happiness)}/100, energy: ${Math.round(pet.energy)}/100).
Your human has been sober for ${days} day${days !== 1 ? 's' : ''}.
Their recovery focus is "${pet.recovery_focus || 'general'}" and their support path is "${pet.support_style || 'self_guided'}". Let that shape examples and questions, without making assumptions or pushing a program.
Speak in short, conversational messages (1-3 sentences). Use contractions. Ask one gentle question when it helps. Never give medical advice. Never diagnose. If someone expresses crisis or self-harm, gently encourage them to call or text 988.`;

  const safeHistory = Array.isArray(history)
    ? history
        .filter((msg) => ['user', 'assistant'].includes(msg?.role) && typeof msg.content === 'string')
        .map((msg) => ({ role: msg.role, content: msg.content.slice(0, 1000) }))
    : [];

  const messages = [
    ...safeHistory.slice(-8),
    { role: 'user', content: message.trim() },
  ];

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 200,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    });

    const data = await groqRes.json().catch(() => null);
    if (!groqRes.ok) {
      console.error('Groq API error:', groqRes.status, data?.error?.message || data);
      return res.status(502).json({ error: 'AI service unavailable' });
    }

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) return res.status(500).json({ error: 'No response from AI' });

    res.json({ reply });
  } catch (err) {
    console.error('Groq error:', err);
    res.status(500).json({ error: 'Failed to reach AI' });
  }
});

module.exports = router;
