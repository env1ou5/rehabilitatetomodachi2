const fs = require('fs');
const path = require('path');
const db = require('../db');

async function run() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
    const seeds = fs.readFileSync(path.join(__dirname, '..', 'seeds.sql'), 'utf8');

    console.log('Applying schema...');
    await db.query(schema);
    console.log('Seeding default quests...');
    await db.query(seeds);
    console.log('✓ Database ready.');
  } catch (err) {
    console.error('✗ Setup failed:', err.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

run();
