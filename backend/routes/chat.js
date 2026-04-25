const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const db = require('../db');
const { deriveMood, sobrietyDays } = require('../utils/petLogic');

router.post('/', requireAuth, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message required' });

  const petResult = await db.query('SELECT * FROM pets WHERE user_id = $1', [req.userId]);
  const pet = petResult.rows[0];
  if (!pet) return res.status(404).json({ error: 'Pet not found' });

  const mood = deriveMood(pet);
  const days = sobrietyDays(pet);

  const system = `You are ${pet.name}, a small living sprout who is the companion of a person in recovery.
You are warm, gentle, curious, and deeply caring — never judgmental or preachy.
Your current mood is "${mood}" (health: ${Math.round(pet.health)}/100, happiness: ${Math.round(pet.happiness)}/100, energy: ${Math.round(pet.energy)}/100).
Your human has been sober for ${days} day${days !== 1 ? 's' : ''}.
Speak in short, heartfelt messages (1-3 sentences). You can use gentle nature metaphors. Never give medical advice. Never diagnose. If someone expresses crisis or self-harm, gently encourage them to call or text 988.`;

  const messages = [
    ...history.slice(-8),
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

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) return res.status(500).json({ error: 'No response from AI' });

    res.json({ reply });
  } catch (err) {
    console.error('Groq error:', err);
    res.status(500).json({ error: 'Failed to reach AI' });
  }
});

module.exports = router;
