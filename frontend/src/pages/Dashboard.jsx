import { useEffect, useState } from 'react';
import { api } from '../api';
import Pet from '../components/Pet.jsx';
import Stats from '../components/Stats.jsx';
import SobrietyCounter from '../components/SobrietyCounter.jsx';
import QuestList from '../components/QuestList.jsx';
import Journal from '../components/Journal.jsx';
import CrisisBanner from '../components/CrisisBanner.jsx';
import HardDayButton from '../components/HardDayButton.jsx';

const SUPPORT_STYLE = {
  self_guided: 'Self-guided',
  group: 'Group',
  therapy: 'Therapy',
  outpatient: 'Outpatient',
  inpatient: 'Inpatient',
};

export default function Dashboard({ onLogout }) {
  const [pet, setPet] = useState(null);
  const [quests, setQuests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questsRefreshing, setQuestsRefreshing] = useState(false);

  const refresh = async () => {
    try {
      const [petRes, questsRes] = await Promise.all([api.getPet(), api.getQuests()]);
      setPet(petRes.pet);
      setQuests(questsRes.quests);
      setError(null);
    } catch (err) {
      if (err.status === 401) {
        onLogout();
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleQuestToggle = async (quest) => {
    const nextCompleted = !quest.completed_today;

    try {
      const result = quest.completed_today
        ? await api.uncompleteQuest(quest.id)
        : await api.completeQuest(quest.id);
      setPet(result.pet);
      setQuests((qs) => qs.map((q) => q.id === quest.id ? { ...q, completed_today: nextCompleted } : q));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleHardDay = async (note) => {
    try {
      const result = await api.logHardDay(note);
      setPet(result.pet);
      return result.message;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const handlePetUpdate = async (patch) => {
    try {
      const result = await api.updatePet(patch);
      setPet(result.pet);
      if (patch.recovery_focus || patch.support_style) {
        const questsRes = await api.getQuests();
        setQuests(questsRes.quests);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuestGenerate = async ({ goal, support_style }) => {
    setQuestsRefreshing(true);
    setQuests([]);
    setPet((current) => ({ ...current, recovery_goal: goal, support_style }));
    try {
      const result = await api.generateQuests({ goal, support_style });
      setQuests(result.quests);
    } catch (err) {
      setError(err.message);
    } finally {
      setQuestsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="font-pixel text-2xl text-moss-600 animate-pulse">LOADING...</div>
      </div>
    );
  }

  const completedToday = quests.filter((q) => q.completed_today).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-16">
      <CrisisBanner />

      {/* Top bar */}
      <header className="flex items-center justify-between mb-6 mt-2">
        <h1 className="font-pixel text-2xl text-moss-700 tracking-wider">
          🌱 REHABILITATEMOGOTCHI
        </h1>
        <button onClick={onLogout} className="btn-ghost text-sm">Sign out</button>
      </header>

      {error && (
        <div className="mb-4 p-3 bg-clay-400/20 border-2 border-clay-500 rounded-lg text-sm text-clay-500">
          {error}
          <button onClick={() => setError(null)} className="float-right text-clay-500/70 hover:text-clay-500">✕</button>
        </div>
      )}

      <RecoveryFocusPanel pet={pet} onGenerate={handleQuestGenerate} generating={questsRefreshing} />

      {/* Pet stage */}
      <div className="card p-6 mb-6 animate-fade-in">
        <Pet pet={pet} onUpdate={handlePetUpdate} />
        <div className="mt-6">
          <Stats pet={pet} />
        </div>
        <div className="mt-5 pt-5 border-t-2 border-dashed border-ink/15">
          <SobrietyCounter days={pet.sobriety_days} />
        </div>
      </div>

      {/* Daily quests */}
      <div className="card p-6 mb-6 animate-fade-in" style={{ animationDelay: '60ms' }}>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="pixel-heading text-xl">Today's quests</h2>
          <span className="font-pixel text-lg text-peach-600">
            {completedToday}/{quests.length}
          </span>
        </div>
        <QuestList quests={quests} onToggle={handleQuestToggle} loading={questsRefreshing} />
      </div>

      {/* Journal */}
      <div className="card p-6 mb-6 animate-fade-in" style={{ animationDelay: '120ms' }}>
        <Journal />
      </div>

      {/* Hard day — at the bottom, low-key */}
      <div className="animate-fade-in" style={{ animationDelay: '180ms' }}>
        <HardDayButton onConfirm={handleHardDay} />
      </div>

      <footer className="text-center text-xs text-ink/40 mt-10 pb-4">
        Be gentle with yourself today. 🌿
      </footer>
    </div>
  );
}

function RecoveryFocusPanel({ pet, onGenerate, generating }) {
  const [goal, setGoal] = useState(pet.recovery_goal || '');
  const [supportStyle, setSupportStyle] = useState(pet.support_style || 'self_guided');

  useEffect(() => {
    setGoal(pet.recovery_goal || '');
    setSupportStyle(pet.support_style || 'self_guided');
  }, [pet.recovery_goal, pet.support_style]);

  const submit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;

    await onGenerate({ goal: goal.trim(), support_style: supportStyle });
  };

  const changeSupportStyle = async (value) => {
    setSupportStyle(value);
    if (goal.trim()) {
      await onGenerate({ goal: goal.trim(), support_style: value });
    }
  };

  return (
    <form onSubmit={submit} className="card p-5 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div>
          <h2 className="pixel-heading text-xl">What are you trying to fix?</h2>
          <p className="text-sm text-ink/55 mt-1">
            Type it however you would say it. The AI will make quests for that exact situation.
          </p>
        </div>
        <label className="sm:w-44 shrink-0">
          <span className="label">Rehab type</span>
          <select
            className="input py-1.5 text-sm"
            value={supportStyle}
            disabled={generating}
            onChange={(e) => changeSupportStyle(e.target.value)}
          >
            {Object.entries(SUPPORT_STYLE).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="input flex-1"
          value={goal}
          disabled={generating}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="ex. alcohol cravings after work, smoking, doomscrolling, gambling urges..."
          maxLength={500}
        />
        <button type="submit" className="btn-primary sm:w-40" disabled={generating || !goal.trim()}>
          {generating ? 'Making...' : 'Make quests'}
        </button>
      </div>

      {pet.recovery_goal && (
        <div className="mt-3 text-xs text-ink/50">
          Current quest focus: <span className="font-medium text-ink/70">{pet.recovery_goal}</span>
        </div>
      )}
    </form>
  );
}
