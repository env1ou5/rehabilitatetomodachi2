const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { applyDecay, deriveMood, sobrietyDays } = require('../utils/petLogic');

const router = express.Router();

const OPTIONS = {
  species: ['sprout', 'cactus', 'fern', 'flower'],
  color_palette: ['moss', 'sunset', 'ocean', 'lavender'],
  accessory: ['none', 'bow', 'scarf', 'glasses', 'star'],
  recovery_focus: ['general', 'alcohol', 'opioids', 'nicotine', 'stimulants', 'cannabis', 'gambling', 'digital', 'food'],
  support_style: ['self_guided', 'group', 'therapy', 'outpatient', 'inpatient'],
};

async function getOrCreatePet(userId) {
  let result = await db.query('SELECT * FROM pets WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) {
    result = await db.query(
      'INSERT INTO pets (user_id) VALUES ($1) RETURNING *',
      [userId]
    );
  }
  return result.rows[0];
}

async function getOrCreatePetWithClient(client, userId) {
  let result = await client.query('SELECT * FROM pets WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) {
    result = await client.query(
      'INSERT INTO pets (user_id) VALUES ($1) RETURNING *',
      [userId]
    );
  }
  return result.rows[0];
}

// GET /pet — current state, with decay applied
router.get('/', requireAuth, async (req, res) => {
  try {
    let pet = await getOrCreatePet(req.userId);
    pet = await applyDecay(db, pet);
    return res.json({
      pet: {
        ...pet,
        mood: deriveMood(pet),
        sobriety_days: sobrietyDays(pet),
      },
    });
  } catch (err) {
    console.error('GET /pet error:', err);
    return res.status(500).json({ error: 'Failed to load pet' });
  }
});

// PATCH /pet — rename
router.patch('/', requireAuth, async (req, res) => {
  const body = req.body || {};
  const updates = [];
  const values = [];

  if (Object.prototype.hasOwnProperty.call(body, 'name')) {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return res.status(400).json({ error: 'name required' });
    }
    values.push(body.name.trim().slice(0, 50));
    updates.push(`name = $${values.length}`);
  }

  for (const field of ['species', 'color_palette', 'accessory', 'recovery_focus', 'support_style']) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;

    const value = typeof body[field] === 'string' ? body[field] : '';
    if (!OPTIONS[field].includes(value)) {
      return res.status(400).json({ error: `invalid ${field}` });
    }
    values.push(value);
    updates.push(`${field} = $${values.length}`);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No pet updates provided' });
  }

  try {
    await getOrCreatePet(req.userId);
    values.push(req.userId);
    const result = await db.query(
      `UPDATE pets SET ${updates.join(', ')} WHERE user_id = $${values.length} RETURNING *`,
      values
    );
    const pet = result.rows[0];
    return res.json({
      pet: { ...pet, mood: deriveMood(pet), sobriety_days: sobrietyDays(pet) },
    });
  } catch (err) {
    console.error('PATCH /pet error:', err);
    return res.status(500).json({ error: 'Failed to update pet' });
  }
});

// POST /pet/hard-day — log a relapse / hard day, reset streak gently
// IMPORTANT: this does NOT damage the pet's stats. Recovery is not punitive.
router.post('/hard-day', requireAuth, async (req, res) => {
  const { note } = req.body || {};
  const cleanNote = typeof note === 'string' ? note.trim().slice(0, 1000) : null;
  let client;
  try {
    client = await db.getClient();
    await client.query('BEGIN');
    await getOrCreatePetWithClient(client, req.userId);
    await client.query(
      `INSERT INTO hard_days (user_id, note) VALUES ($1, $2)`,
      [req.userId, cleanNote || null]
    );
    // Reset sobriety_start to today. No stat penalty.
    const result = await client.query(
      `UPDATE pets SET sobriety_start = CURRENT_DATE WHERE user_id = $1 RETURNING *`,
      [req.userId]
    );
    await client.query('COMMIT');
    const pet = result.rows[0];
    return res.json({
      pet: { ...pet, mood: deriveMood(pet), sobriety_days: sobrietyDays(pet) },
      message: "It's okay. Today is day one again — and that takes courage.",
    });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('hard-day error:', err);
    return res.status(500).json({ error: 'Failed to log hard day' });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;
