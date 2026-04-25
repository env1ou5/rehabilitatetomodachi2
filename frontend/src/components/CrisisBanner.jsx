import { useState } from 'react';

export default function CrisisBanner() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-clay-400/15 border-2 border-clay-500 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-display font-bold text-clay-500"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span aria-hidden>🆘</span>
          Need help right now?
        </span>
        <span className="text-xs">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 text-sm text-ink/80 space-y-1.5 border-t-2 border-clay-500/30">
          <p className="pt-2">If you're in crisis or considering using, please reach out:</p>
          <ul className="space-y-1 pl-1">
            <li>
              <strong>988</strong> — Suicide &amp; Crisis Lifeline (call or text, US)
            </li>
            <li>
              <strong>1-800-662-4357</strong> — SAMHSA National Helpline (24/7, free, confidential)
            </li>
            <li>
              <strong>741741</strong> — Crisis Text Line (text HOME)
            </li>
          </ul>
          <p className="text-xs text-ink/50 pt-1">
            Outside the US? <a href="https://findahelpline.com" target="_blank" rel="noopener" className="underline">findahelpline.com</a> lists crisis lines worldwide.
          </p>
        </div>
      )}
    </div>
  );
}
