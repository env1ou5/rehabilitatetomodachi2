import { useEffect, useState } from 'react';
import { api } from '../api';

const MOODS = [
  { value: 1, emoji: '😞', label: 'rough' },
  { value: 2, emoji: '😕', label: 'low' },
  { value: 3, emoji: '😐', label: 'okay' },
  { value: 4, emoji: '🙂', label: 'good' },
  { value: 5, emoji: '😊', label: 'great' },
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const res = await api.getJournal();
      setEntries(res.entries);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.addJournal({ content: content.trim(), mood });
      setContent('');
      setMood(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.deleteJournal(id);
      setEntries((es) => es.filter((e) => e.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="pixel-heading text-xl mb-4">Journal</h2>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">How are you, right now?</label>
          <div className="flex gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(mood === m.value ? null : m.value)}
                className={`flex-1 py-2 border-2 border-ink rounded-lg text-2xl transition-all ${
                  mood === m.value ? 'bg-peach-400 shadow-chunky-sm' : 'bg-cream-50 hover:bg-cream-100'
                }`}
                aria-label={m.label}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">What's on your mind?</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="input resize-none"
            placeholder="Wins, struggles, triggers, gratitudes — anything."
            maxLength={5000}
          />
        </div>

        {error && (
          <div className="text-sm text-clay-500">{error}</div>
        )}

        <button type="submit" disabled={saving || !content.trim()} className="btn-peach">
          {saving ? 'Saving...' : 'Save entry'}
        </button>
      </form>

      {entries.length > 0 && (
        <div className="mt-6 pt-5 border-t-2 border-dashed border-ink/15">
          <h3 className="font-display font-bold text-sm uppercase tracking-wide text-ink/50 mb-3">
            Recent entries
          </h3>
          <ul className="space-y-3">
            {entries.slice(0, 5).map((e) => (
              <li key={e.id} className="bg-cream-100 border-2 border-ink rounded-lg p-3">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {e.mood && <span className="text-lg">{MOODS.find(m => m.value === e.mood)?.emoji}</span>}
                    <span className="font-pixel text-sm text-ink/60 uppercase">
                      {formatDate(e.created_at)}
                    </span>
                  </div>
                  <button
                    onClick={() => remove(e.id)}
                    className="text-xs text-ink/40 hover:text-clay-500"
                    aria-label="Delete entry"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-ink/80 whitespace-pre-wrap break-words">{e.content}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
