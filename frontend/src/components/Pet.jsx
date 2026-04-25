import { useState } from 'react';
import SproutChat from './SproutChat.jsx';

/**
 * The pet is a sprout that visually responds to mood.
 * Mood states (from petLogic.js): thriving | content | okay | sad | rough
 */
export default function Pet({ pet, onRename }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(pet.name);
  const [chatOpen, setChatOpen] = useState(false);

  const submitRename = (e) => {
    e.preventDefault();
    if (name.trim() && name.trim() !== pet.name) onRename(name.trim());
    setEditing(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Stage */}
      <div className="relative w-full h-56 flex items-end justify-center
                      bg-gradient-to-b from-cream-100 to-cream-200
                      border-2 border-ink rounded-xl overflow-hidden">
        {/* Decorative sky dots */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-3 left-6 w-2 h-2 bg-peach-400 rounded-full opacity-60" />
          <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-moss-400 rounded-full opacity-50" />
          <div className="absolute top-14 left-16 w-1 h-1 bg-clay-400 rounded-full opacity-40" />
          <div className="absolute top-6 right-1/3 w-2 h-2 bg-peach-400 rounded-full opacity-30" />
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-moss-400/30
                        border-t-2 border-dashed border-ink/20" />

        {/* Pet sprite — click to chat */}
        <button
          onClick={() => setChatOpen(true)}
          className="relative z-10 focus:outline-none group"
          title={`Talk to ${pet.name}`}
          aria-label={`Talk to ${pet.name}`}
        >
          <PetSprite mood={pet.mood} />
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-pixel text-[10px]
                           bg-white border border-ink/20 rounded px-1.5 py-0.5 whitespace-nowrap
                           opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            tap to chat
          </span>
        </button>

        {/* Mood badge */}
        <div className="absolute top-3 right-3 font-pixel text-sm uppercase
                        bg-cream-50 border-2 border-ink rounded-md px-2 py-0.5
                        shadow-chunky-sm">
          {pet.mood}
        </div>
      </div>

      {/* Name */}
      <div className="mt-4 flex items-center gap-2">
        {editing ? (
          <form onSubmit={submitRename} className="flex items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={submitRename}
              className="input text-center font-display font-bold text-2xl py-1 max-w-[12rem]"
              maxLength={50}
            />
          </form>
        ) : (
          <>
            <h2 className="font-display font-black text-3xl text-moss-700">
              {pet.name}
            </h2>
            <button
              onClick={() => { setName(pet.name); setEditing(true); }}
              className="text-ink/40 hover:text-ink/80 text-sm"
              title="Rename"
              aria-label="Rename pet"
            >
              ✎
            </button>
          </>
        )}
      </div>
      <div className="font-pixel text-xs text-ink/40 uppercase tracking-widest">
        a small sprout
      </div>

      {chatOpen && <SproutChat pet={pet} onClose={() => setChatOpen(false)} />}
    </div>
  );
}

/* ----- The SVG sprite, parameterized by mood ----- */

function PetSprite({ mood }) {
  // Map mood → animation, pose, accessories
  const config = {
    thriving: { anim: 'animate-pet-bob',   leafTilt:   8, eyeY: 56, mouth: 'smile', sparkles: true,  petals: true,  bloom: true },
    content:  { anim: 'animate-pet-bob',   leafTilt:   4, eyeY: 56, mouth: 'smile', sparkles: false, petals: false, bloom: false },
    okay:     { anim: 'animate-pet-sway',  leafTilt:   0, eyeY: 58, mouth: 'flat',  sparkles: false, petals: false, bloom: false },
    sad:      { anim: 'animate-pet-droop', leafTilt:  -8, eyeY: 60, mouth: 'frown', sparkles: false, petals: false, bloom: false },
    rough:    { anim: 'animate-pet-droop', leafTilt: -14, eyeY: 62, mouth: 'frown', sparkles: false, petals: false, bloom: false },
  };
  const c = config[mood] || config.okay;

  // Leaf and stem color shift with health — wilt towards a paler clay tone.
  const stemColor = mood === 'rough' ? '#7E6F4F' : mood === 'sad' ? '#8C9A6B' : '#5C8268';
  const leafColor = mood === 'rough' ? '#A89A6E' : mood === 'sad' ? '#A2B384' : '#7FA088';

  return (
    <svg
      viewBox="0 0 160 200"
      className={`w-44 h-56 z-10 ${c.anim}`}
      aria-label={`Pet appears ${mood}`}
    >
      {/* Pot */}
      <g>
        <path d="M40 168 L120 168 L114 196 L46 196 Z" fill="#D88A7A" stroke="#2A2520" strokeWidth="3" strokeLinejoin="round" />
        <rect x="36" y="160" width="88" height="12" rx="2" fill="#C56B5A" stroke="#2A2520" strokeWidth="3" />
        {/* Pot stripe */}
        <path d="M50 178 L110 178" stroke="#2A2520" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
      </g>

      {/* Stem */}
      <path
        d="M80 168 Q78 130 80 100"
        stroke={stemColor}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Side leaves */}
      <g transform={`rotate(${-20 + c.leafTilt} 80 130)`}>
        <ellipse cx="62" cy="128" rx="14" ry="8" fill={leafColor} stroke="#2A2520" strokeWidth="2.5" />
        <path d="M62 128 L70 130" stroke="#2A2520" strokeWidth="1.5" opacity="0.4" />
      </g>
      <g transform={`rotate(${20 - c.leafTilt} 80 130)`}>
        <ellipse cx="98" cy="128" rx="14" ry="8" fill={leafColor} stroke="#2A2520" strokeWidth="2.5" />
        <path d="M98 128 L90 130" stroke="#2A2520" strokeWidth="1.5" opacity="0.4" />
      </g>

      {/* Head bulb */}
      <g>
        <circle cx="80" cy="80" r="32" fill={leafColor} stroke="#2A2520" strokeWidth="3" />
        {/* Cheek blush */}
        <ellipse cx="62" cy={c.eyeY + 6} rx="5" ry="3" fill="#EC8956" opacity="0.55" />
        <ellipse cx="98" cy={c.eyeY + 6} rx="5" ry="3" fill="#EC8956" opacity="0.55" />
        {/* Eyes */}
        <circle cx="68" cy={c.eyeY} r="3.5" fill="#2A2520" />
        <circle cx="92" cy={c.eyeY} r="3.5" fill="#2A2520" />
        <circle cx="69" cy={c.eyeY - 1} r="1" fill="#FBF7EF" />
        <circle cx="93" cy={c.eyeY - 1} r="1" fill="#FBF7EF" />
        {/* Mouth */}
        {c.mouth === 'smile' && (
          <path d="M72 70 Q80 78 88 70" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}
        {c.mouth === 'flat' && (
          <path d="M73 71 L87 71" stroke="#2A2520" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {c.mouth === 'frown' && (
          <path d="M72 73 Q80 67 88 73" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {/* Top sprouts */}
        <path d="M80 48 Q76 36 70 32" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M80 48 Q84 36 90 32" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="68" cy="30" rx="6" ry="3" fill={leafColor} stroke="#2A2520" strokeWidth="2.5" transform="rotate(-30 68 30)" />
        <ellipse cx="92" cy="30" rx="6" ry="3" fill={leafColor} stroke="#2A2520" strokeWidth="2.5" transform="rotate(30 92 30)" />
      </g>

      {/* Bloom (only when thriving) */}
      {c.bloom && (
        <g>
          <circle cx="80" cy="22" r="5" fill="#EC8956" stroke="#2A2520" strokeWidth="2" />
          <circle cx="80" cy="22" r="2" fill="#FBF7EF" />
        </g>
      )}

      {/* Sparkles */}
      {c.sparkles && (
        <g>
          <Sparkle x={28} y={50} delay="0s" />
          <Sparkle x={132} y={42} delay="0.4s" />
          <Sparkle x={140} y={100} delay="0.8s" />
          <Sparkle x={20} y={110} delay="1.2s" />
        </g>
      )}

      {/* Falling petals when sad/rough — visualized as one tilted leaf below */}
      {(mood === 'rough') && (
        <g opacity="0.7">
          <ellipse cx="42" cy="170" rx="5" ry="2.5" fill={leafColor} stroke="#2A2520" strokeWidth="1.5" transform="rotate(40 42 170)" />
        </g>
      )}
    </svg>
  );
}

function Sparkle({ x, y, delay }) {
  return (
    <g transform={`translate(${x} ${y})`} className="animate-sparkle" style={{ animationDelay: delay, transformOrigin: `${x}px ${y}px` }}>
      <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="#EC8956" stroke="#2A2520" strokeWidth="1" />
    </g>
  );
}
