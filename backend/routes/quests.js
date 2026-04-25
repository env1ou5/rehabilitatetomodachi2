const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { applyDecay, applyRewards, deriveMood, sobrietyDays } = require('../utils/petLogic');

const router = express.Router();
const GENERATED_QUEST_COUNT = 8;

const FALLBACK_QUESTS = [
  { title: 'Name the risky moment', description: 'Write one sentence about when this problem usually gets louder, then choose one thing you can do first.', category: 'reflection', health_reward: 2, happiness_reward: 7, energy_reward: 2 },
  { title: 'Add one layer of friction', description: 'Make the unwanted behavior slightly harder to start: move an item, block an app, avoid a route, or tell someone.', category: 'planning', health_reward: 4, happiness_reward: 8, energy_reward: 2 },
  { title: 'Text a safe person', description: 'Send one honest message to someone who would want you to stay okay today.', category: 'connection', health_reward: 2, happiness_reward: 10, energy_reward: 2 },
  { title: 'Ride out one urge', description: 'When an urge shows up, wait ten minutes before acting and do something grounding while it passes.', category: 'mind', health_reward: 4, happiness_reward: 6, energy_reward: 4 },
  { title: 'Replace the ritual', description: 'Pick one safe substitute for the time, place, or feeling tied to the habit.', category: 'planning', health_reward: 2, happiness_reward: 8, energy_reward: 4 },
  { title: 'Take care of your body first', description: 'Eat, hydrate, shower, stretch, or sleep before deciding anything big.', category: 'body', health_reward: 8, happiness_reward: 4, energy_reward: 6 },
  { title: 'Write the after-story', description: 'Write how you want to feel one hour after choosing recovery today.', category: 'reflection', health_reward: 2, happiness_reward: 8, energy_reward: 2 },
  { title: 'Make tomorrow easier', description: 'Set up one small thing tonight that lowers the chance of slipping tomorrow.', category: 'planning', health_reward: 4, happiness_reward: 7, energy_reward: 4 },
];

function actualReward(current, reward) {
  return Math.max(0, Math.min(100, current + reward)) - current;
}

async function getOrCreatePet(client, userId) {
  let result = await client.query('SELECT * FROM pets WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) {
    result = await client.query(
      'INSERT INTO pets (user_id) VALUES ($1) RETURNING *',
      [userId]
    );
  }
  return result.rows[0];
}

function normalizeQuest(raw, index) {
  const categories = ['connection', 'reflection', 'mind', 'body', 'planning'];
  const category = categories.includes(raw?.category) ? raw.category : categories[index % categories.length];
  return {
    title: String(raw?.title || FALLBACK_QUESTS[index]?.title || 'Do one recovery-supporting thing').trim().slice(0, 120),
    description: String(raw?.description || FALLBACK_QUESTS[index]?.description || 'Choose one small action that helps you stay aligned with recovery today.').trim().slice(0, 500),
    category,
    health_reward: clampReward(raw?.health_reward, FALLBACK_QUESTS[index]?.health_reward ?? 4),
    happiness_reward: clampReward(raw?.happiness_reward, FALLBACK_QUESTS[index]?.happiness_reward ?? 6),
    energy_reward: clampReward(raw?.energy_reward, FALLBACK_QUESTS[index]?.energy_reward ?? 4),
  };
}

function clampReward(value, fallback) {
  const n = Number(value);
  if (!Number.isInteger(n)) return fallback;
  return Math.max(0, Math.min(12, n));
}

async function generateWithAi(goal, supportStyle) {
  if (!process.env.GROQ_API_KEY) return FALLBACK_QUESTS;

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 1100,
      messages: [
        {
          role: 'system',
          content: `Generate ${GENERATED_QUEST_COUNT} daily rehab companion quests. Return only valid JSON: {"quests":[...]}. Each quest needs title, description, category, health_reward, happiness_reward, energy_reward. Categories must be one of connection, reflection, mind, body, planning. Rewards are integers 0-12. Keep quests concrete, low-pressure, non-medical, non-shaming, and flexible for a hackathon demo. Do not include medical advice, diagnosis, medication instructions, or crisis counseling.`,
        },
        {
          role: 'user',
          content: `Person says they are trying to fix: "${goal}". Rehab/support context: "${supportStyle}". Generate practical quests tailored to that exact text.`,
        },
      ],
    }),
  });

  const data = await groqRes.json().catch(() => null);
  if (!groqRes.ok) {
    console.error('Groq quest generation error:', groqRes.status, data?.error?.message || data);
    return FALLBACK_QUESTS;
  }

  const text = data?.choices?.[0]?.message?.content || '';
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed.quests) && parsed.quests.length > 0 ? parsed.quests : FALLBACK_QUESTS;
  } catch (err) {
    console.error('Quest JSON parse error:', err.message, text.slice(0, 200));
    return FALLBACK_QUESTS;
  }
}

async function replaceGeneratedQuests(client, userId, goal, supportStyle) {
  await client.query(
    `UPDATE quests
     SET is_active = FALSE
     WHERE user_id = $1`,
    [userId]
  );

  const rawQuests = await generateWithAi(goal, supportStyle);
  const quests = rawQuests.slice(0, GENERATED_QUEST_COUNT).map(normalizeQuest);
  const stamp = Date.now().toString(36);
  const saved = [];

  for (let i = 0; i < quests.length; i++) {
    const quest = quests[i];
    const result = await client.query(
      `INSERT INTO quests (
         user_id, slug, title, description, category, focus_tags, support_tags,
         is_core, health_reward, happiness_reward, energy_reward, generated_from
       )
       VALUES ($1, $2, $3, $4, $5, '{}', '{}', FALSE, $6, $7, $8, $9)
       RETURNING id, slug, title, description, category, focus_tags, support_tags, is_core,
                 health_reward, happiness_reward, energy_reward, FALSE AS completed_today`,
      [
        userId,
        `ai_${userId}_${stamp}_${i}`,
        quest.title,
        quest.description,
        quest.category,
        quest.health_reward,
        quest.happiness_reward,
        quest.energy_reward,
        goal,
      ]
    );
    saved.push(result.rows[0]);
  }

  return saved;
}

// GET /quests — all active quests with today's completion status
router.get('/', requireAuth, async (req, res) => {
  try {
    const petResult = await db.query(
      `SELECT recovery_focus, recovery_goal, support_style FROM pets WHERE user_id = $1`,
      [req.userId]
    );
    const pet = petResult.rows[0] || { recovery_focus: 'general', recovery_goal: '', support_style: 'self_guided' };

    const result = await db.query(
      `SELECT q.id, q.slug, q.title, q.description, q.category,
              q.focus_tags, q.support_tags, q.is_core,
              q.health_reward, q.happiness_reward, q.energy_reward,
              EXISTS (
                SELECT 1 FROM quest_completions qc
                WHERE qc.quest_id = q.id
                  AND qc.user_id = $1
                  AND qc.completed_on = CURRENT_DATE
              ) AS completed_today
       FROM quests q
       WHERE q.is_active = TRUE
         AND (q.user_id IS NULL OR q.user_id = $1)
         AND (
           q.user_id = $1
           OR q.is_core = TRUE
           OR $2 = ANY(q.focus_tags)
           OR $3 = ANY(q.support_tags)
         )
       ORDER BY (q.user_id = $1) DESC, q.is_core DESC, q.category ASC, q.id ASC`,
      [req.userId, pet.recovery_focus, pet.support_style]
    );
    return res.json({
      profile: {
        recovery_focus: pet.recovery_focus,
        recovery_goal: pet.recovery_goal,
        support_style: pet.support_style,
      },
      quests: result.rows,
    });
  } catch (err) {
    console.error('GET /quests error:', err);
    return res.status(500).json({ error: 'Failed to load quests' });
  }
});

router.post('/generate', requireAuth, async (req, res) => {
  const goal = typeof req.body?.goal === 'string' ? req.body.goal.trim().slice(0, 500) : '';
  const supportStyle = typeof req.body?.support_style === 'string' ? req.body.support_style : 'self_guided';

  if (!goal) return res.status(400).json({ error: 'Tell us what you are trying to fix first' });

  let client;
  try {
    client = await db.getClient();
    await client.query('BEGIN');
    await getOrCreatePet(client, req.userId);
    await client.query(
      `UPDATE pets
       SET recovery_goal = $1, support_style = $2
       WHERE user_id = $3`,
      [goal, supportStyle, req.userId]
    );

    const quests = await replaceGeneratedQuests(client, req.userId, goal, supportStyle);
    await client.query('COMMIT');
    return res.status(201).json({ quests });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('generate quests error:', err);
    return res.status(500).json({ error: 'Failed to generate quests' });
  } finally {
    if (client) client.release();
  }
});

// POST /quests/:id/complete
router.post('/:id/complete', requireAuth, async (req, res) => {
  const questId = parseInt(req.params.id, 10);
  if (Number.isNaN(questId)) return res.status(400).json({ error: 'invalid quest id' });

  let client;
  try {
    client = await db.getClient();
    await client.query('BEGIN');

    const questResult = await client.query(
      `SELECT *
       FROM quests
       WHERE id = $1
         AND is_active = TRUE
         AND (user_id IS NULL OR user_id = $2)`,
      [questId, req.userId]
    );
    const quest = questResult.rows[0];
    if (!quest) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Quest not found' });
    }

    // Try to insert the completion. If it already exists for today, no-op.
    const insert = await client.query(
      `INSERT INTO quest_completions (user_id, quest_id, completed_on)
       VALUES ($1, $2, CURRENT_DATE)
       ON CONFLICT (user_id, quest_id, completed_on) DO NOTHING
       RETURNING id`,
      [req.userId, questId]
    );
    const wasNew = insert.rows.length > 0;

    let pet = await getOrCreatePet(client, req.userId);
    pet = await applyDecay(client, pet);

    if (wasNew) {
      const rewards = {
        health: actualReward(pet.health, quest.health_reward),
        happiness: actualReward(pet.happiness, quest.happiness_reward),
        energy: actualReward(pet.energy, quest.energy_reward),
      };

      await client.query(
        `UPDATE quest_completions
         SET health_reward_applied = $1,
             happiness_reward_applied = $2,
             energy_reward_applied = $3
         WHERE id = $4`,
        [rewards.health, rewards.happiness, rewards.energy, insert.rows[0].id]
      );

      pet = await applyRewards(client, pet.id, rewards);
    }

    await client.query('COMMIT');
    return res.json({
      pet: { ...pet, mood: deriveMood(pet), sobriety_days: sobrietyDays(pet) },
      already_completed: !wasNew,
    });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('complete quest error:', err);
    return res.status(500).json({ error: 'Failed to complete quest' });
  } finally {
    if (client) client.release();
  }
});

// DELETE /quests/:id/complete — undo (in case of misclick)
router.delete('/:id/complete', requireAuth, async (req, res) => {
  const questId = parseInt(req.params.id, 10);
  if (Number.isNaN(questId)) return res.status(400).json({ error: 'invalid quest id' });

  let client;
  try {
    client = await db.getClient();
    await client.query('BEGIN');
    const questResult = await client.query(
      `SELECT *
       FROM quests
       WHERE id = $1
         AND (user_id IS NULL OR user_id = $2)`,
      [questId, req.userId]
    );
    const quest = questResult.rows[0];
    if (!quest) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Quest not found' });
    }

    const del = await client.query(
      `DELETE FROM quest_completions
       WHERE user_id = $1 AND quest_id = $2 AND completed_on = CURRENT_DATE
       RETURNING id, health_reward_applied, happiness_reward_applied, energy_reward_applied`,
      [req.userId, questId]
    );
    const completion = del.rows[0];

    let pet = await getOrCreatePet(client, req.userId);

    if (completion) {
      const rewardsToReverse = {
        health: completion.health_reward_applied ?? quest.health_reward,
        happiness: completion.happiness_reward_applied ?? quest.happiness_reward,
        energy: completion.energy_reward_applied ?? quest.energy_reward,
      };

      pet = await applyRewards(client, pet.id, {
        health: -rewardsToReverse.health,
        happiness: -rewardsToReverse.happiness,
        energy: -rewardsToReverse.energy,
      });
    }

    await client.query('COMMIT');
    return res.json({
      pet: { ...pet, mood: deriveMood(pet), sobriety_days: sobrietyDays(pet) },
    });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('uncomplete quest error:', err);
    return res.status(500).json({ error: 'Failed to undo quest' });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;
