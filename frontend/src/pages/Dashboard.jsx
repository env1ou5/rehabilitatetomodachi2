import { useEffect, useState } from 'react';
import { api } from '../api';
import Pet from '../components/Pet.jsx';
import Stats from '../components/Stats.jsx';
import SobrietyCounter from '../components/SobrietyCounter.jsx';
import QuestList from '../components/QuestList.jsx';
import Journal from '../components/Journal.jsx';
import CrisisBanner from '../components/CrisisBanner.jsx';
import HardDayButton from '../components/HardDayButton.jsx';

export default function Dashboard({ onLogout }) {
  const [pet, setPet] = useState(null);
  const [quests, setQuests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
    try {
      const result = quest.completed_today
        ? await api.uncompleteQuest(quest.id)
        : await api.completeQuest(quest.id);
      setPet(result.pet);
      setQuests((qs) => qs.map((q) => q.id === quest.id ? { ...q, completed_today: !q.completed_today } : q));
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

  const handleRename = async (newName) => {
    try {
      const result = await api.renamePet(newName);
      setPet(result.pet);
    } catch (err) {
      setError(err.message);
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

      {/* Pet stage */}
      <div className="card p-6 mb-6 animate-fade-in">
        <Pet pet={pet} onRename={handleRename} />
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
        <QuestList quests={quests} onToggle={handleQuestToggle} />
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
