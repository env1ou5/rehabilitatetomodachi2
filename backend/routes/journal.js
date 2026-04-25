const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /journal — list entries (newest first), with optional limit
router.get('/', requireAuth, async (req, res) => {
  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isInteger(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 100)
    : 20;

  try {
    const result = await db.query(
      `SELECT id, mood, content, created_at
       FROM journal_entries
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [req.userId, limit]
    );
    return res.json({ entries: result.rows });
  } catch (err) {
    console.error('GET /journal error:', err);
    return res.status(500).json({ error: 'Failed to load entries' });
  }
});

// POST /journal — create a new entry
router.post('/', requireAuth, async (req, res) => {
  const { mood, content } = req.body || {};
  const parsedMood = mood === undefined || mood === null || mood === ''
    ? null
    : Number(mood);

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'content required' });
  }
  if (parsedMood !== null && (!Number.isInteger(parsedMood) || parsedMood < 1 || parsedMood > 5)) {
    return res.status(400).json({ error: 'mood must be 1-5' });
  }

  try {
    const result = await db.query(
      `INSERT INTO journal_entries (user_id, mood, content)
       VALUES ($1, $2, $3)
       RETURNING id, mood, content, created_at`,
      [req.userId, parsedMood, content.trim().slice(0, 5000)]
    );
    return res.status(201).json({ entry: result.rows[0] });
  } catch (err) {
    console.error('POST /journal error:', err);
    return res.status(500).json({ error: 'Failed to save entry' });
  }
});

// DELETE /journal/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });
  try {
    await db.query(
      `DELETE FROM journal_entries WHERE id = $1 AND user_id = $2`,
      [id, req.userId]
    );
    return res.status(204).send();
  } catch (err) {
    console.error('DELETE /journal error:', err);
    return res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;
