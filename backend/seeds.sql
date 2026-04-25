-- Default quest catalog. ON CONFLICT DO NOTHING so this is idempotent.
INSERT INTO quests (slug, title, description, category, health_reward, happiness_reward, energy_reward) VALUES
  ('meeting',     'Attend a meeting or check-in',  'Go to a recovery meeting (AA, NA, SMART, etc.) or check in with your sponsor or counselor.', 'connection',   8,  10, 0),
  ('reach_out',   'Reach out to someone supportive', 'Send a text or call someone who supports your recovery — even a short message counts.',     'connection',   4,  10, 0),
  ('journal',     'Write a journal entry',          'Reflect on your day, your triggers, and your wins. Even a few sentences help.',             'reflection',   2,  8,  0),
  ('mindfulness', 'Practice mindfulness',           'Spend 5–10 minutes meditating, breathing, or just being present.',                           'mind',         4,  6,  4),
  ('exercise',    'Move your body',                 'Walk, stretch, lift, dance — any movement for at least 15 minutes.',                         'body',         10, 4,  4),
  ('hydration',   'Drink enough water',             'Aim for 6–8 glasses of water today.',                                                        'body',         6,  0,  4),
  ('sleep',       'Protect your sleep',             'Get 7+ hours of sleep, or commit to a wind-down routine tonight.',                           'body',         8,  4,  10),
  ('gratitude',   'Name three good things',         'Write down or say out loud three things you''re grateful for today.',                       'reflection',   0,  10, 2),
  ('nourish',     'Eat a real meal',                'Have a proper meal — protein, veg, something cooked. Fuel matters.',                         'body',         8,  2,  6),
  ('craving_log', 'Log a craving (if any)',         'If you had a craving today, write down what triggered it and what helped. No craving? Skip — that counts too.', 'reflection', 4, 6, 0)
ON CONFLICT (slug) DO NOTHING;
