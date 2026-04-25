-- ============================================================
-- Rehabilitatemogotchi schema
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One pet per user. Stats are 0-100.
CREATE TABLE IF NOT EXISTS pets (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(50) NOT NULL DEFAULT 'Buddy',
  species         VARCHAR(20) NOT NULL DEFAULT 'sprout',
  health          INTEGER NOT NULL DEFAULT 80 CHECK (health BETWEEN 0 AND 100),
  happiness       INTEGER NOT NULL DEFAULT 80 CHECK (happiness BETWEEN 0 AND 100),
  energy          INTEGER NOT NULL DEFAULT 80 CHECK (energy BETWEEN 0 AND 100),
  sobriety_start  DATE NOT NULL DEFAULT CURRENT_DATE,
  last_decayed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catalog of available quests. Seeded with defaults.
CREATE TABLE IF NOT EXISTS quests (
  id              SERIAL PRIMARY KEY,
  slug            VARCHAR(50) UNIQUE NOT NULL,
  title           VARCHAR(120) NOT NULL,
  description     TEXT NOT NULL,
  category        VARCHAR(30) NOT NULL,
  health_reward   INTEGER NOT NULL DEFAULT 0,
  happiness_reward INTEGER NOT NULL DEFAULT 0,
  energy_reward   INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Track each quest completion. Unique per user/quest/day so a quest
-- can only be completed once per calendar day (UTC).
CREATE TABLE IF NOT EXISTS quest_completions (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id    INTEGER NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  completed_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, quest_id, completed_on)
);

CREATE INDEX IF NOT EXISTS idx_quest_completions_user_date
  ON quest_completions (user_id, completed_on);

-- Private journal entries.
CREATE TABLE IF NOT EXISTS journal_entries (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood       SMALLINT CHECK (mood BETWEEN 1 AND 5),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_user_created
  ON journal_entries (user_id, created_at DESC);

-- "Hard days" — relapse or rough day. Resets streak gently, no pet penalty.
CREATE TABLE IF NOT EXISTS hard_days (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  occurred_on  DATE NOT NULL DEFAULT CURRENT_DATE,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hard_days_user
  ON hard_days (user_id, occurred_on DESC);
