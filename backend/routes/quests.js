const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { applyDecay, applyRewards, deriveMood, sobrietyDays } = require('../utils/petLogic');

const router = express.Router();

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

  let client;
  try {
    client = await db.getClient();
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
    const questResult = await client.query('SELECT * FROM quests WHERE id = $1', [questId]);
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
