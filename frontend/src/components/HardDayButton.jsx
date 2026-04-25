import { useState } from 'react';

export default function HardDayButton({ onConfirm }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    const msg = await onConfirm(note);
    setSubmitting(false);
    if (msg) {
      setMessage(msg);
      setNote('');
      setOpen(false);
    }
  };

  if (message) {
    return (
      <div className="card p-5 bg-moss-500/10 border-moss-500">
        <p className="font-display font-bold text-moss-700 mb-1">You showed up. That counts.</p>
        <p className="text-sm text-ink/70">{message}</p>
        <button onClick={() => setMessage(null)} className="btn-ghost mt-3 text-sm">
          Close
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <details className="text-center">
        <summary
          className="text-xs text-ink/40 hover:text-ink/70 cursor-pointer inline-block py-2"
          onClick={(e) => { e.preventDefault(); setOpen(true); }}
        >
          Had a hard day? →
        </summary>
      </details>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="font-display font-bold text-lg text-ink mb-1">It's okay.</h3>
      <p className="text-sm text-ink/70 mb-4">
        Recovery isn't a straight line. Logging a hard day will reset your streak counter — but your sprout is fine.
        No stat penalties. No shame. Tomorrow is a new chance.
      </p>

      <label className="label">Want to write down what happened? (optional)</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        className="input resize-none mb-3"
        placeholder="Trigger, context, what helped, what you'll try next time..."
        maxLength={1000}
      />

      <div className="flex gap-2 justify-end">
        <button onClick={() => { setOpen(false); setNote(''); }} className="btn-ghost text-sm">
          Cancel
        </button>
        <button onClick={submit} disabled={submitting} className="btn-peach text-sm">
          {submitting ? '...' : 'Log it & start fresh'}
        </button>
      </div>
    </div>
  );
}
