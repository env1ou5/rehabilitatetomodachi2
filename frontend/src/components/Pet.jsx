import { useEffect, useRef, useState } from 'react';
import SproutChat from './SproutChat.jsx';

const PET_SPECIES = {
  sprout: { label: 'Sprout' },
  cactus: { label: 'Cactus' },
  fern: { label: 'Fern' },
  flower: { label: 'Flower' },
};

const PALETTES = {
  moss: { label: 'Moss', stem: '#5C8268', leaf: '#7FA088', roughStem: '#7E6F4F', roughLeaf: '#A89A6E', sadStem: '#8C9A6B', sadLeaf: '#A2B384', pot: '#D88A7A', potRim: '#C56B5A' },
  sunset: { label: 'Sunset', stem: '#B26A48', leaf: '#F4A87A', roughStem: '#8B654E', roughLeaf: '#D8A078', sadStem: '#C98567', sadLeaf: '#E8B08B', pot: '#7FA088', potRim: '#5C8268' },
  ocean: { label: 'Ocean', stem: '#437C8C', leaf: '#6AA6B8', roughStem: '#687580', roughLeaf: '#94A6AE', sadStem: '#5F8C98', sadLeaf: '#87B5C0', pot: '#D88A7A', potRim: '#C56B5A' },
  lavender: { label: 'Lavender', stem: '#6F668F', leaf: '#9C8CC2', roughStem: '#746B7A', roughLeaf: '#A69BB3', sadStem: '#81779E', sadLeaf: '#AEA1CF', pot: '#F4A87A', potRim: '#EC8956' },
};

const ACCESSORIES = {
  none: 'None',
  bow: 'Bow',
  scarf: 'Scarf',
  glasses: 'Glasses',
  star: 'Star',
};

const RECOVERY_FOCUS = {
  general: 'General',
  alcohol: 'Alcohol',
  opioids: 'Opioids',
  nicotine: 'Nicotine',
  stimulants: 'Stimulants',
  cannabis: 'Cannabis',
  gambling: 'Gambling',
  digital: 'Digital habits',
  food: 'Food/body',
};

const SUPPORT_STYLE = {
  self_guided: 'Self-guided',
  group: 'Group',
  therapy: 'Therapy',
  outpatient: 'Outpatient',
  inpatient: 'Inpatient',
};

/**
 * The pet visually responds to mood and user customization.
 * Mood states (from petLogic.js): thriving | content | okay | sad | rough
 */
export default function Pet({ pet, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(pet.name);
  const [chatOpen, setChatOpen] = useState(false);
  const [savingField, setSavingField] = useState(null);
  const submittedRenameRef = useRef(false);

  useEffect(() => {
    if (!editing) setName(pet.name);
  }, [editing, pet.name]);

  const submitRename = (e) => {
    e.preventDefault();
    if (submittedRenameRef.current) return;

    submittedRenameRef.current = true;
    const cleanName = name.trim();
    if (cleanName && cleanName !== pet.name) onUpdate({ name: cleanName });
    setEditing(false);
  };

  const startEditing = () => {
    submittedRenameRef.current = false;
    setName(pet.name);
    setEditing(true);
  };

  const updateChoice = async (field, value) => {
    setSavingField(field);
    try {
      await onUpdate({ [field]: value });
    } finally {
      setSavingField(null);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-56 flex items-end justify-center bg-gradient-to-b from-cream-100 to-cream-200 border-2 border-ink rounded-xl overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-3 left-6 w-2 h-2 bg-peach-400 rounded-full opacity-60" />
          <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-moss-400 rounded-full opacity-50" />
          <div className="absolute top-14 left-16 w-1 h-1 bg-clay-400 rounded-full opacity-40" />
          <div className="absolute top-6 right-1/3 w-2 h-2 bg-peach-400 rounded-full opacity-30" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-moss-400/30 border-t-2 border-dashed border-ink/20" />

        <button
          onClick={() => setChatOpen(true)}
          className="relative z-10 focus:outline-none group"
          title={`Talk to ${pet.name}`}
          aria-label={`Talk to ${pet.name}`}
        >
          <PetSprite pet={pet} talking={chatOpen} />
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-pixel text-[10px] bg-white border border-ink/20 rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            tap to chat
          </span>
        </button>

        <div className="absolute top-3 right-3 font-pixel text-sm uppercase bg-cream-50 border-2 border-ink rounded-md px-2 py-0.5 shadow-chunky-sm">
          {pet.mood}
        </div>
      </div>

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
              onClick={startEditing}
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
        a small {PET_SPECIES[pet.species]?.label?.toLowerCase() || 'sprout'}
      </div>

      <PetCustomizer pet={pet} savingField={savingField} onChange={updateChoice} />

      {chatOpen && <SproutChat pet={pet} onClose={() => setChatOpen(false)} />}
    </div>
  );
}

function PetCustomizer({ pet, savingField, onChange }) {
  return (
    <div className="w-full mt-5 pt-5 border-t-2 border-dashed border-ink/15 space-y-4">
      <div>
        <div className="pixel-heading text-sm mb-2">Pet style</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Picker label="Species" field="species" value={pet.species} options={PET_SPECIES} savingField={savingField} onChange={onChange} />
          <Picker label="Palette" field="color_palette" value={pet.color_palette} options={PALETTES} savingField={savingField} onChange={onChange} />
          <Picker label="Accessory" field="accessory" value={pet.accessory} options={ACCESSORIES} savingField={savingField} onChange={onChange} />
        </div>
      </div>

      <div>
        <div className="pixel-heading text-sm mb-2">Recovery profile</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Picker label="Focus" field="recovery_focus" value={pet.recovery_focus} options={RECOVERY_FOCUS} savingField={savingField} onChange={onChange} />
          <Picker label="Support" field="support_style" value={pet.support_style} options={SUPPORT_STYLE} savingField={savingField} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

function Picker({ label, field, value, options, savingField, onChange }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select
        className="input py-1.5 text-sm"
        value={value || Object.keys(options)[0]}
        disabled={savingField === field}
        onChange={(e) => onChange(field, e.target.value)}
      >
        {Object.entries(options).map(([key, option]) => (
          <option key={key} value={key}>
            {typeof option === 'string' ? option : option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PetSprite({ pet, talking = false }) {
  const mood = pet.mood;
  const species = pet.species || 'sprout';
  const palette = PALETTES[pet.color_palette] || PALETTES.moss;
  const config = {
    thriving: { anim: 'animate-pet-bob', leafTilt: 8, eyeY: 56, mouth: 'smile', sparkles: true, bloom: true },
    content: { anim: 'animate-pet-bob', leafTilt: 4, eyeY: 56, mouth: 'smile', sparkles: false, bloom: false },
    okay: { anim: 'animate-pet-sway', leafTilt: 0, eyeY: 58, mouth: 'flat', sparkles: false, bloom: false },
    sad: { anim: 'animate-pet-droop', leafTilt: -8, eyeY: 60, mouth: 'frown', sparkles: false, bloom: false },
    rough: { anim: 'animate-pet-droop', leafTilt: -14, eyeY: 62, mouth: 'frown', sparkles: false, bloom: false },
  };
  const c = config[mood] || config.okay;
  const stemColor = mood === 'rough' ? palette.roughStem : mood === 'sad' ? palette.sadStem : palette.stem;
  const leafColor = mood === 'rough' ? palette.roughLeaf : mood === 'sad' ? palette.sadLeaf : palette.leaf;

  return (
    <svg
      viewBox="0 0 160 200"
      className={`w-44 h-56 z-10 ${talking ? 'sprout-talk-sway' : c.anim}`}
      aria-label={`Pet appears ${mood}`}
    >
      <g>
        <path d="M40 168 L120 168 L114 196 L46 196 Z" fill={palette.pot} stroke="#2A2520" strokeWidth="3" strokeLinejoin="round" />
        <rect x="36" y="160" width="88" height="12" rx="2" fill={palette.potRim} stroke="#2A2520" strokeWidth="3" />
        <path d="M50 178 L110 178" stroke="#2A2520" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
      </g>

      <path d="M80 168 Q78 130 80 100" stroke={stemColor} strokeWidth="6" strokeLinecap="round" fill="none" />
      <SpeciesLeaves species={species} leafColor={leafColor} leafTilt={c.leafTilt} />

      <g>
        <circle cx="80" cy="80" r="32" fill={leafColor} stroke="#2A2520" strokeWidth="3" />
        <ellipse cx="62" cy={c.eyeY + 6} rx="5" ry="3" fill="#EC8956" opacity="0.55" />
        <ellipse cx="98" cy={c.eyeY + 6} rx="5" ry="3" fill="#EC8956" opacity="0.55" />
        <circle cx="68" cy={c.eyeY} r="3.5" fill="#2A2520" />
        <circle cx="92" cy={c.eyeY} r="3.5" fill="#2A2520" />
        <circle cx="69" cy={c.eyeY - 1} r="1" fill="#FBF7EF" />
        <circle cx="93" cy={c.eyeY - 1} r="1" fill="#FBF7EF" />
        <Mouth mood={c.mouth} talking={talking} />
        <SpeciesTop species={species} leafColor={leafColor} />
        <Accessory accessory={pet.accessory} />
      </g>

      {(c.bloom || species === 'flower') && (
        <g>
          <circle cx="80" cy="22" r="5" fill="#EC8956" stroke="#2A2520" strokeWidth="2" />
          <circle cx="80" cy="22" r="2" fill="#FBF7EF" />
        </g>
      )}

      {c.sparkles && (
        <g>
          <Sparkle x={28} y={50} delay="0s" />
          <Sparkle x={132} y={42} delay="0.4s" />
          <Sparkle x={140} y={100} delay="0.8s" />
          <Sparkle x={20} y={110} delay="1.2s" />
        </g>
      )}

      {mood === 'rough' && (
        <g opacity="0.7">
          <ellipse cx="42" cy="170" rx="5" ry="2.5" fill={leafColor} stroke="#2A2520" strokeWidth="1.5" transform="rotate(40 42 170)" />
        </g>
      )}
    </svg>
  );
}

function Mouth({ mood, talking }) {
  if (talking) {
    return <ellipse cx="80" cy="72" rx="6" ry="3" fill="#2A2520" className="sprout-mouth-talk" />;
  }
  if (mood === 'smile') return <path d="M72 70 Q80 78 88 70" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  if (mood === 'flat') return <path d="M73 71 L87 71" stroke="#2A2520" strokeWidth="2.5" strokeLinecap="round" />;
  return <path d="M72 73 Q80 67 88 73" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
}

function SpeciesLeaves({ species, leafColor, leafTilt }) {
  if (species === 'cactus') {
    return (
      <>
        <path d="M70 132 Q52 126 54 108" stroke={leafColor} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M90 138 Q110 132 108 112" stroke={leafColor} strokeWidth="7" strokeLinecap="round" fill="none" />
      </>
    );
  }

  if (species === 'fern') {
    return (
      <>
        {[112, 124, 136].map((y, i) => (
          <g key={y}>
            <ellipse cx={62 - i * 2} cy={y} rx="12" ry="5" fill={leafColor} stroke="#2A2520" strokeWidth="2" transform={`rotate(${-28 + leafTilt} ${62 - i * 2} ${y})`} />
            <ellipse cx={98 + i * 2} cy={y} rx="12" ry="5" fill={leafColor} stroke="#2A2520" strokeWidth="2" transform={`rotate(${28 - leafTilt} ${98 + i * 2} ${y})`} />
          </g>
        ))}
      </>
    );
  }

  return (
    <>
      <g transform={`rotate(${-20 + leafTilt} 80 130)`}>
        <ellipse cx="62" cy="128" rx="14" ry="8" fill={leafColor} stroke="#2A2520" strokeWidth="2.5" />
        <path d="M62 128 L70 130" stroke="#2A2520" strokeWidth="1.5" opacity="0.4" />
      </g>
      <g transform={`rotate(${20 - leafTilt} 80 130)`}>
        <ellipse cx="98" cy="128" rx="14" ry="8" fill={leafColor} stroke="#2A2520" strokeWidth="2.5" />
        <path d="M98 128 L90 130" stroke="#2A2520" strokeWidth="1.5" opacity="0.4" />
      </g>
    </>
  );
}

function SpeciesTop({ species, leafColor }) {
  if (species === 'cactus') {
    return <path d="M70 50 L72 42 M78 48 L78 38 M88 50 L86 42" stroke="#2A2520" strokeWidth="2" strokeLinecap="round" opacity="0.55" />;
  }

  if (species === 'fern') {
    return (
      <>
        <path d="M80 50 Q70 36 56 36" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M80 50 Q90 36 104 36" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="56" cy="36" rx="8" ry="3" fill={leafColor} stroke="#2A2520" strokeWidth="2" transform="rotate(-12 56 36)" />
        <ellipse cx="104" cy="36" rx="8" ry="3" fill={leafColor} stroke="#2A2520" strokeWidth="2" transform="rotate(12 104 36)" />
      </>
    );
  }

  return (
    <>
      <path d="M80 48 Q76 36 70 32" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M80 48 Q84 36 90 32" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="68" cy="30" rx="6" ry="3" fill={leafColor} stroke="#2A2520" strokeWidth="2.5" transform="rotate(-30 68 30)" />
      <ellipse cx="92" cy="30" rx="6" ry="3" fill={leafColor} stroke="#2A2520" strokeWidth="2.5" transform="rotate(30 92 30)" />
    </>
  );
}

function Accessory({ accessory }) {
  if (accessory === 'bow') {
    return (
      <g transform="translate(80 48)">
        <path d="M0 0 L-14 -7 L-14 7 Z" fill="#EC8956" stroke="#2A2520" strokeWidth="2" />
        <path d="M0 0 L14 -7 L14 7 Z" fill="#EC8956" stroke="#2A2520" strokeWidth="2" />
        <circle cx="0" cy="0" r="3" fill="#F4A87A" stroke="#2A2520" strokeWidth="2" />
      </g>
    );
  }

  if (accessory === 'scarf') {
    return (
      <g>
        <path d="M54 105 Q80 116 106 105" stroke="#EC8956" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M94 110 L104 132" stroke="#EC8956" strokeWidth="7" strokeLinecap="round" />
      </g>
    );
  }

  if (accessory === 'glasses') {
    return (
      <g fill="none" stroke="#2A2520" strokeWidth="2">
        <circle cx="68" cy="56" r="8" />
        <circle cx="92" cy="56" r="8" />
        <path d="M76 56 L84 56" />
      </g>
    );
  }

  if (accessory === 'star') {
    return <path d="M112 50 L116 58 L125 59 L118 65 L120 74 L112 70 L104 74 L106 65 L99 59 L108 58 Z" fill="#F4A87A" stroke="#2A2520" strokeWidth="2" />;
  }

  return null;
}

function Sparkle({ x, y, delay }) {
  return (
    <g transform={`translate(${x} ${y})`} className="animate-sparkle" style={{ animationDelay: delay, transformOrigin: `${x}px ${y}px` }}>
      <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="#EC8956" stroke="#2A2520" strokeWidth="1" />
    </g>
  );
}
