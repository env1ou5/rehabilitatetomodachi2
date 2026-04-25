require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pet');
const questRoutes = require('./routes/quests');
const journalRoutes = require('./routes/journal');
const chatRoutes = require('./routes/chat');

const app = express();

app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/pet', petRoutes);
app.use('/quests', questRoutes);
app.use('/journal', journalRoutes);
app.use('/chat', chatRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error fallthrough
app.use((err, req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
if (!process.env.JWT_SECRET) {
  console.warn('⚠  JWT_SECRET is not set. Set it in .env before going to production.');
}

app.listen(PORT, () => {
  console.log(`🌱 Rehabilitatemogotchi API listening on :${PORT}`);
});
