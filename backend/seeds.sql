-- Default quest catalog. ON CONFLICT updates metadata so seeds can evolve safely.
INSERT INTO quests (slug, title, description, category, focus_tags, support_tags, is_core, health_reward, happiness_reward, energy_reward) VALUES
  ('meeting', 'Attend a meeting or check-in', 'Go to a recovery meeting (AA, NA, SMART, etc.) or check in with your sponsor or counselor.', 'connection', '{}', '{group,therapy,outpatient,inpatient}', TRUE, 8, 10, 0),
  ('reach_out', 'Reach out to someone supportive', 'Send a text or call someone who supports your recovery. Even a short message counts.', 'connection', '{}', '{}', TRUE, 4, 10, 0),
  ('journal', 'Write a journal entry', 'Reflect on your day, your triggers, and your wins. Even a few sentences help.', 'reflection', '{}', '{}', TRUE, 2, 8, 0),
  ('mindfulness', 'Practice mindfulness', 'Spend 5-10 minutes meditating, breathing, or just being present.', 'mind', '{}', '{}', TRUE, 4, 6, 4),
  ('exercise', 'Move your body', 'Walk, stretch, lift, dance. Any movement for at least 15 minutes counts.', 'body', '{}', '{}', TRUE, 10, 4, 4),
  ('hydration', 'Drink enough water', 'Aim for 6-8 glasses of water today.', 'body', '{}', '{}', TRUE, 6, 0, 4),
  ('sleep', 'Protect your sleep', 'Get 7+ hours of sleep, or commit to a wind-down routine tonight.', 'body', '{}', '{}', TRUE, 8, 4, 10),
  ('gratitude', 'Name three good things', 'Write down or say out loud three things you are grateful for today.', 'reflection', '{}', '{}', TRUE, 0, 10, 2),
  ('nourish', 'Eat a real meal', 'Have a proper meal with something filling and steady. Fuel matters.', 'body', '{}', '{}', TRUE, 8, 2, 6),
  ('craving_log', 'Log a craving or urge', 'If an urge showed up today, write down what triggered it and what helped. No urge? Mark that win too.', 'reflection', '{}', '{}', TRUE, 4, 6, 0),

  ('alcohol_plan_ride', 'Plan a sober ride or exit', 'Before any risky setting, decide how you will leave early and who you can text if alcohol shows up.', 'planning', '{alcohol}', '{}', FALSE, 2, 8, 4),
  ('alcohol_mocktail', 'Make a no-alcohol ritual', 'Pick a drink, snack, or evening routine that gives your hands something safe to do.', 'mind', '{alcohol}', '{self_guided,outpatient}', FALSE, 4, 8, 2),
  ('alcohol_trigger_map', 'Map one alcohol trigger', 'Name one person, place, feeling, or time of day that makes drinking louder. Add one boundary for it.', 'reflection', '{alcohol}', '{therapy,self_guided}', FALSE, 2, 8, 2),

  ('opioid_safety_check', 'Do a safety check', 'Check that your support plan and emergency contacts are easy to reach today.', 'planning', '{opioids}', '{therapy,outpatient,inpatient}', FALSE, 6, 8, 2),
  ('opioid_appointment_step', 'Protect the next appointment', 'Confirm the time, ride, reminder, or question for your next medical or counseling appointment.', 'planning', '{opioids}', '{therapy,outpatient}', FALSE, 4, 8, 4),
  ('opioid_body_scan', 'Listen to your body', 'Take two minutes to notice hunger, pain, stress, or tiredness without arguing with it. Write down one need.', 'mind', '{opioids}', '{}', FALSE, 4, 6, 4),

  ('nicotine_delay', 'Delay one nicotine urge', 'When an urge hits, wait five minutes, sip water, and do something with your hands.', 'mind', '{nicotine}', '{self_guided,outpatient}', FALSE, 4, 6, 4),
  ('nicotine_swap', 'Set up a hand-to-mouth swap', 'Put gum, mints, tea, a straw, or another safe substitute somewhere easy to grab.', 'planning', '{nicotine}', '{}', FALSE, 2, 7, 4),
  ('nicotine_zone', 'Make one smoke-free zone', 'Pick one place or time today where nicotine does not come with you.', 'planning', '{nicotine}', '{}', FALSE, 4, 8, 2),

  ('stimulants_downshift', 'Build a downshift block', 'Schedule 20 minutes with low light, food, water, or quiet so your nervous system can land.', 'body', '{stimulants}', '{}', FALSE, 8, 4, 8),
  ('stimulants_task_limit', 'Choose a stopping point', 'Pick one clear endpoint for work, gaming, studying, or cleaning before momentum runs the day.', 'planning', '{stimulants}', '{self_guided,therapy}', FALSE, 2, 8, 6),
  ('stimulants_food_anchor', 'Eat before intensity', 'Have something with protein or carbs before a high-energy block.', 'body', '{stimulants}', '{}', FALSE, 8, 4, 6),

  ('cannabis_evening_plan', 'Plan the evening gap', 'Choose what you will do during the time you would usually use: shower, walk, game, cook, call, or rest.', 'planning', '{cannabis}', '{}', FALSE, 2, 8, 4),
  ('cannabis_sleep_support', 'Make sleep easier tonight', 'Set up one sleep support: lower lights, put the phone away, stretch, or start a wind-down playlist.', 'body', '{cannabis}', '{}', FALSE, 4, 4, 10),
  ('cannabis_stash_boundary', 'Remove one cue', 'Move, discard, or avoid one item or place that keeps cannabis on your mind.', 'planning', '{cannabis}', '{self_guided,outpatient}', FALSE, 4, 8, 2),

  ('gambling_money_pause', 'Add friction to spending', 'Set one money boundary today: remove an app, lower a limit, tell someone, or wait 24 hours.', 'planning', '{gambling}', '{}', FALSE, 2, 10, 4),
  ('gambling_urge_timer', 'Ride out a betting urge', 'Set a 10-minute timer before acting on an urge. When it ends, write what changed.', 'mind', '{gambling}', '{self_guided,therapy}', FALSE, 2, 8, 4),
  ('gambling_repair_step', 'Take one repair step', 'Open one bill, message one trusted person, or make one small plan for financial cleanup.', 'connection', '{gambling}', '{therapy,group}', FALSE, 4, 8, 2),

  ('digital_app_limit', 'Set one digital boundary', 'Use an app limit, site blocker, grayscale, or phone-free room for one vulnerable window today.', 'planning', '{digital}', '{}', FALSE, 2, 8, 4),
  ('digital_body_return', 'Come back to the room', 'Put the device down and name five things you can see, four you can feel, and one thing you need.', 'mind', '{digital}', '{}', FALSE, 2, 6, 4),
  ('digital_connection_swap', 'Swap scrolling for contact', 'Send one real message or voice note before opening the app that usually pulls you in.', 'connection', '{digital}', '{}', FALSE, 2, 10, 2),

  ('food_regular_meal', 'Plan the next steady meal', 'Choose what and roughly when you will eat next. Keep it simple and kind.', 'body', '{food}', '{therapy,outpatient,inpatient}', FALSE, 8, 5, 6),
  ('food_no_body_check', 'Skip one body-check loop', 'When the urge to check, count, or judge shows up, redirect to one grounding action.', 'mind', '{food}', '{therapy,self_guided}', FALSE, 4, 8, 4),
  ('food_support_note', 'Tell someone one food truth', 'Share one honest sentence with a safe person about meals, urges, or stress.', 'connection', '{food}', '{therapy,group,outpatient}', FALSE, 2, 10, 2),

  ('group_share', 'Share one honest sentence', 'At group or with a peer, say one true thing instead of the polished version.', 'connection', '{}', '{group,inpatient,outpatient}', FALSE, 2, 10, 2),
  ('therapy_question', 'Bring one question to care', 'Write down one question, symptom, trigger, or pattern to bring to a therapist, counselor, or clinician.', 'reflection', '{}', '{therapy,outpatient,inpatient}', FALSE, 2, 8, 2),
  ('inpatient_room_reset', 'Reset your space', 'Make your bed, clear your corner, or set out tomorrow clothes. Small order can lower noise.', 'body', '{}', '{inpatient}', FALSE, 6, 4, 4),
  ('outpatient_transition', 'Protect a transition', 'Plan the 30 minutes before or after treatment, work, school, or getting home.', 'planning', '{}', '{outpatient}', FALSE, 2, 8, 4),
  ('self_guided_plan', 'Write a tiny recovery plan', 'Pick one risky moment today and write what you will do first, second, and third.', 'planning', '{}', '{self_guided}', FALSE, 2, 8, 4)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  focus_tags = EXCLUDED.focus_tags,
  support_tags = EXCLUDED.support_tags,
  is_core = EXCLUDED.is_core,
  health_reward = EXCLUDED.health_reward,
  happiness_reward = EXCLUDED.happiness_reward,
  energy_reward = EXCLUDED.energy_reward,
  is_active = TRUE;
