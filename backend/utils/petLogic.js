// Decay rate: pets lose 1 point per stat per ~3 hours of neglect.
// This is deliberately gentle — we want to encourage check-ins, not punish.
const HOURS_PER_DECAY_POINT = 3;

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Apply time-based decay to a pet's stats.
 * Should be called whenever we read or write the pet.
 */
async function applyDecay(db, pet) {
  if (!pet) return null;

  const now = new Date();
  const last = new Date(pet.last_decayed_at);
  const hoursElapsed = (now - last) / (1000 * 60 * 60);
  const decay = Math.floor(hoursElapsed / HOURS_PER_DECAY_POINT);
  if (decay <= 0) return pet;

  const newHealth    = clamp(pet.health    - decay);
  const newHappiness = clamp(pet.happiness - decay);
  const newEnergy    = clamp(pet.energy    - decay);

  const result = await db.query(
    `UPDATE pets
     SET health = $1, happiness = $2, energy = $3, last_decayed_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [newHealth, newHappiness, newEnergy, pet.id]
  );
  return result.rows[0];
}

/**
 * Apply quest rewards to a pet's stats.
 */
async function applyRewards(db, petId, rewards) {
  const result = await db.query(
    `UPDATE pets
     SET health = GREATEST(0, LEAST(100, health + $1)),
         happiness = GREATEST(0, LEAST(100, happiness + $2)),
         energy = GREATEST(0, LEAST(100, energy + $3))
     WHERE id = $4
     RETURNING *`,
    [rewards.health || 0, rewards.happiness || 0, rewards.energy || 0, petId]
  );
  return result.rows[0];
}

/**
 * Derive a mood string from stats. Used by the frontend to pick a sprite.
 */
function deriveMood(pet) {
  if (!pet) return 'okay';

  const avg = (pet.health + pet.happiness + pet.energy) / 3;
  if (avg >= 80) return 'thriving';
  if (avg >= 60) return 'content';
  if (avg >= 40) return 'okay';
  if (avg >= 20) return 'sad';
  return 'rough';
}

/**
 * Compute days since sobriety_start (inclusive of today).
 */
function sobrietyDays(pet) {
  if (!pet) return 0;

  const start = new Date(pet.sobriety_start);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

module.exports = { applyDecay, applyRewards, deriveMood, sobrietyDays, clamp };
