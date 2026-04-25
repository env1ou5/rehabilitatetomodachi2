const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { applyDecay, applyRewards, deriveMood, sobrietyDays } = require('../utils/petLogic');

const router = express.Router();

// GET /quests — all active quests with today's completion status
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT q.id, q.slug, q.title, q.description, q.category,
              q.health_reward, q.happiness_reward, q.energy_reward,
              EXISTS (
                SELECT 1 FROM quest_completions qc
                WHERE qc.quest_id = q.id
                  AND qc.user_id = $1
                  AND qc.completed_on = CURRENT_DATE
              ) AS completed_today
       FROM quests q
       WHERE q.is_active = TRUE
       ORDER BY q.id ASC`,
      [req.userId]
    );
    return res.json({ quests: result.rows });
  } catch (err) {
    console.error('GET /quests error:', err);
    return res.status(500).json({ error: 'Failed to load quests' });
  }
});

// POST /quests/:id/complete
router.post('/:id/complete', requireAuth, async (req, res) => {
  const questId = parseInt(req.params.id, 10);
  if (Number.isNaN(questId)) return res.status(400).json({ error: 'invalid quest id' });

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const questResult = await client.query(
      `SELECT * FROM quests WHERE id = $1 AND is_active = TRUE`,
      [questId]
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

    let petResult = await client.query('SELECT * FROM pets WHERE user_id = $1', [req.userId]);
    let pet = petResult.rows[0];
    pet = await applyDecay(client, pet);

    if (wasNew) {
      pet = await applyRewards(client, pet.id, {
        health: quest.health_reward,
        happiness: quest.happiness_reward,
        energy: quest.energy_reward,
      });
    }

    await client.query('COMMIT');
    return res.json({
      pet: { ...pet, mood: deriveMood(pet), sobriety_days: sobrietyDays(pet) },
      already_completed: !wasNew,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('complete quest error:', err);
    return res.status(500).json({ error: 'Failed to complete quest' });
  } finally {
    client.release();
  }
});

// DELETE /quests/:id/complete — undo (in case of misclick)
router.delete('/:id/complete', requireAuth, async (req, res) => {
  const questId = parseInt(req.params.id, 10);
  if (Number.isNaN(questId)) return res.status(400).json({ error: 'invalid quest id' });

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const questResult = await client.query('SELECT * FROM quests WHERE id = $1', [questId]);
    const quest = questResult.rows[0];
    if (!quest) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Quest not found' });
    }

    const del = await client.query(
      `DELETE FROM quest_completions
       WHERE user_id = $1 AND quest_id = $2 AND completed_on = CURRENT_DATE
       RETURNING id`,
      [req.userId, questId]
    );
    const wasRemoved = del.rows.length > 0;

    let petResult = await client.query('SELECT * FROM pets WHERE user_id = $1', [req.userId]);
    let pet = petResult.rows[0];

    if (wasRemoved) {
      // Reverse the rewards.
      pet = await applyRewards(client, pet.id, {
        health: -quest.health_reward,
        happiness: -quest.happiness_reward,
        energy: -quest.energy_reward,
      });
    }

    await client.query('COMMIT');
    return res.json({
      pet: { ...pet, mood: deriveMood(pet), sobriety_days: sobrietyDays(pet) },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('uncomplete quest error:', err);
    return res.status(500).json({ error: 'Failed to undo quest' });
  } finally {
    client.release();
  }
});

module.exports = router;
