const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// POST /auth/register
router.post('/register', async (req, res) => {
  const { username, email, password, petName } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Username or email already taken' });
    }

    const hash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id, username, email`,
      [username, email, hash]
    );
    const user = userResult.rows[0];

    // Every user gets a pet automatically.
    await client.query(
      `INSERT INTO pets (user_id, name) VALUES ($1, $2)`,
      [user.id, petName?.trim() || 'Buddy']
    );

    await client.query('COMMIT');
    return res.status(201).json({ user, token: signToken(user.id) });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('register error:', err);
    return res.status(500).json({ error: 'Failed to register' });
  } finally {
    client.release();
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const result = await db.query(
      `SELECT id, username, email, password_hash FROM users WHERE username = $1 OR email = $1`,
      [username]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    return res.json({
      user: { id: user.id, username: user.username, email: user.email },
      token: signToken(user.id),
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
