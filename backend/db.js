const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const hasDiscretePgConfig = Boolean(
  process.env.PGHOST ||
  process.env.PGPORT ||
  process.env.PGDATABASE ||
  process.env.PGUSER ||
  process.env.PGPASSWORD
);

const poolConfig = hasDiscretePgConfig
  ? {
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
      database: process.env.PGDATABASE,
    }
  : { connectionString: process.env.DATABASE_URL };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};
