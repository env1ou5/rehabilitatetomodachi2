import { useEffect, useRef, useState } from 'react';
import SproutChat from './SproutChat.jsx';

const PET_SPECIES = {
  sprout: { label: 'Sprout', icon: '🌱' },
  cactus: { label: 'Cactus', icon: '🌵' },
  fern: { label: 'Fern', icon: '🌿' },
  flower: { label: 'Flower', icon: '✿' },
};

const PALETTES = {
  moss: { label: 'Moss', stem: '#5C8268', leaf: '#7FA088', roughStem: '#7E6F4F', roughLeaf: '#A89A6E', sadStem: '#8C9A6B', sadLeaf: '#A2B384', pot: '#D88A7A', potRim: '#C56B5A' },
  sunset: { label: 'Sunset', stem: '#B96E4C', leaf: '#F2A36F', roughStem: '#8C674E', roughLeaf: '#CFA07A', sadStem: '#C98567', sadLeaf: '#E6B08B', pot: '#5C8268', potRim: '#456350' },
  ocean: { label: 'Ocean', stem: '#437C8C', leaf: '#76AEB8', roughStem: '#657783', roughLeaf: '#94AAB0', sadStem: '#5F8C98', sadLeaf: '#8ABAC3', pot: '#D88A7A', potRim: '#C56B5A' },
  lavender: { label: 'Lavender', stem: '#6F668F', leaf: '#9A8BC0', roughStem: '#746B7A', roughLeaf: '#A69CB3', sadStem: '#81779E', sadLeaf: '#AEA1CF', pot: '#F4A87A', potRim: '#EC8956' },
};

const ACCESSORIES = {
  none: 'None',
  bow: 'Bow',
  scarf: 'Scarf',
  glasses: 'Glasses',
  star: 'Star',
};

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
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <div className="absolute top-3 left-6 w-2 h-2 bg-peach-400 rounded-full" />
          <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-moss-400 rounded-full" />
          <div className="absolute top-14 left-16 w-1 h-1 bg-clay-400 rounded-full" />
          <div className="absolute top-6 right-1/3 w-2 h-2 bg-peach-400 rounded-full opacity-50" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-moss-400/25 border-t-2 border-dashed border-ink/20" />

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
            <h2 className="font-display font-black text-3xl text-moss-700">{pet.name}</h2>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(PET_SPECIES).map(([value, option]) => (
            <ChoiceButton
              key={value}
              active={pet.species === value}
              disabled={savingField === 'species'}
              onClick={() => onChange('species', value)}
            >
              <span className="text-lg" aria-hidden>{option.icon}</span>
              <span>{option.label}</span>
            </ChoiceButton>
          ))}
        </div>
      </div>

      <div>
        <div className="pixel-heading text-sm mb-2">Colors</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(PALETTES).map(([value, palette]) => (
            <ChoiceButton
              key={value}
              active={pet.color_palette === value}
              disabled={savingField === 'color_palette'}
              onClick={() => onChange('color_palette', value)}
            >
              <span className="inline-flex -space-x-1" aria-hidden>
                <span className="w-4 h-4 rounded-full border border-ink" style={{ backgroundColor: palette.leaf }} />
                <span className="w-4 h-4 rounded-full border border-ink" style={{ backgroundColor: palette.pot }} />
              </span>
              <span>{palette.label}</span>
            </ChoiceButton>
          ))}
        </div>
      </div>

      <div>
        <div className="pixel-heading text-sm mb-2">Accessory</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(ACCESSORIES).map(([value, label]) => (
            <ChoiceButton
              key={value}
              active={pet.accessory === value}
              disabled={savingField === 'accessory'}
              onClick={() => onChange('accessory', value)}
            >
              <AccessoryIcon value={value} />
              <span>{label}</span>
            </ChoiceButton>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChoiceButton({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-12 px-2 py-2 border-2 border-ink rounded-lg font-display font-bold text-sm flex items-center justify-center gap-2 transition ${
        active ? 'bg-moss-500 text-cream-50 shadow-chunky-sm' : 'bg-cream-50 hover:bg-cream-100 text-ink/75'
      }`}
    >
      {children}
    </button>
  );
}

function AccessoryIcon({ value }) {
  const icons = { none: '·', bow: '⋈', scarf: '~', glasses: 'oo', star: '★' };
  return <span className="font-pixel text-lg leading-none" aria-hidden>{icons[value]}</span>;
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

  if (species === 'cactus') {
    return <CactusSprite pet={pet} palette={palette} config={c} talking={talking} />;
  }
  if (species === 'flower') {
    return <FlowerSprite pet={pet} palette={palette} config={c} talking={talking} />;
  }
  if (species === 'fern') {
    return <FernSprite pet={pet} palette={palette} config={c} talking={talking} />;
  }

  return (
    <svg
      viewBox="0 0 160 200"
      className={`w-44 h-56 z-10 ${talking ? 'sprout-talk-sway' : c.anim}`}
      aria-label={`Pet appears ${mood}`}
    >
      <g>
        <path d="M40 168 L120 168 L114 196 L46 196 Z" fill={palette.pot} stroke="#2A2520" strokeWidth="3" strokeLinejoin="round" />
        <rect x="36" y="160" width="88" height="12" rx="2" fill={palette.potRim} stroke="#2A2520" strokeWidth="3" />
        <path d="M50 178 L110 178" stroke="#2A2520" strokeWidth="2" strokeDasharray="4 4" opacity="0.35" />
      </g>

      <path d="M80 168 Q78 132 80 100" stroke={stemColor} strokeWidth="6" strokeLinecap="round" fill="none" />
      <SideLeaves species={species} leafColor={leafColor} leafTilt={c.leafTilt} />

      <g>
        <circle cx="80" cy="80" r={species === 'cactus' ? 30 : 32} fill={leafColor} stroke="#2A2520" strokeWidth="3" />
        {species === 'cactus' && <CactusMarks />}
        <ellipse cx="62" cy={c.eyeY + 6} rx="5" ry="3" fill="#EC8956" opacity="0.5" />
        <ellipse cx="98" cy={c.eyeY + 6} rx="5" ry="3" fill="#EC8956" opacity="0.5" />
        <circle cx="68" cy={c.eyeY} r="3.5" fill="#2A2520" />
        <circle cx="92" cy={c.eyeY} r="3.5" fill="#2A2520" />
        <circle cx="69" cy={c.eyeY - 1} r="1" fill="#FBF7EF" />
        <circle cx="93" cy={c.eyeY - 1} r="1" fill="#FBF7EF" />
        <Mouth mood={c.mouth} talking={talking} />
        <TopDetail species={species} leafColor={leafColor} bloom={c.bloom} />
        <Accessory accessory={pet.accessory} />
      </g>

      {c.sparkles && (
        <g>
          <Sparkle x={30} y={54} delay="0s" />
          <Sparkle x={132} y={48} delay="0.4s" />
          <Sparkle x={138} y={104} delay="0.8s" />
        </g>
      )}

      {mood === 'rough' && (
        <g opacity="0.65">
          <ellipse cx="42" cy="170" rx="5" ry="2.5" fill={leafColor} stroke="#2A2520" strokeWidth="1.5" transform="rotate(40 42 170)" />
        </g>
      )}
    </svg>
  );
}

function CactusSprite({ pet, palette, config, talking }) {
  const cactusColor = pet.mood === 'rough' ? palette.roughLeaf : pet.mood === 'sad' ? palette.sadLeaf : palette.leaf;

  return (
    <svg viewBox="0 0 160 200" className={`w-44 h-56 z-10 ${talking ? 'sprout-talk-sway' : config.anim}`} aria-label={`Pet appears ${pet.mood}`}>
      <Pot palette={palette} />
      <g>
        <path d="M65 166 L65 75 Q65 48 80 48 Q95 48 95 75 L95 166 Z" fill={cactusColor} stroke="#2A2520" strokeWidth="3" strokeLinejoin="round" />
        <path d="M66 112 Q48 112 48 92 Q48 78 58 78 Q66 78 66 91" fill="none" stroke={cactusColor} strokeWidth="13" strokeLinecap="round" />
        <path d="M94 124 Q116 124 116 100 Q116 84 105 84 Q94 84 94 99" fill="none" stroke={cactusColor} strokeWidth="13" strokeLinecap="round" />
        <path d="M66 112 Q48 112 48 92 Q48 78 58 78 Q66 78 66 91" fill="none" stroke="#2A2520" strokeWidth="3" strokeLinecap="round" />
        <path d="M94 124 Q116 124 116 100 Q116 84 105 84 Q94 84 94 99" fill="none" stroke="#2A2520" strokeWidth="3" strokeLinecap="round" />
        <path d="M75 62 L75 154 M85 62 L85 154" stroke="#2A2520" strokeWidth="1.5" opacity="0.16" />
        <g stroke="#2A2520" strokeWidth="1.5" strokeLinecap="round" opacity="0.42">
          <path d="M72 72 L68 72 M88 86 L92 86 M72 108 L68 108 M88 132 L92 132 M56 92 L52 92 M108 102 L112 102" />
        </g>
        <Face eyeY={config.eyeY + 18} talking={talking} mouth={config.mouth} />
        <Accessory accessory={pet.accessory} />
      </g>
      {config.sparkles && <Sparkle x={126} y={46} delay="0.2s" />}
    </svg>
  );
}

function FlowerSprite({ pet, palette, config, talking }) {
  const stemColor = pet.mood === 'rough' ? palette.roughStem : pet.mood === 'sad' ? palette.sadStem : palette.stem;
  const leafColor = pet.mood === 'rough' ? palette.roughLeaf : pet.mood === 'sad' ? palette.sadLeaf : palette.leaf;
  const petalColor = pet.color_palette === 'ocean' ? '#8ABAC3' : pet.color_palette === 'lavender' ? '#AEA1CF' : '#F4A87A';

  return (
    <svg viewBox="0 0 160 200" className={`w-44 h-56 z-10 ${talking ? 'sprout-talk-sway' : config.anim}`} aria-label={`Pet appears ${pet.mood}`}>
      <Pot palette={palette} />
      <path d="M80 166 Q78 128 80 104" stroke={stemColor} strokeWidth="6" strokeLinecap="round" fill="none" />
      <ellipse cx="63" cy="132" rx="15" ry="8" fill={leafColor} stroke="#2A2520" strokeWidth="2.5" transform="rotate(-24 63 132)" />
      <ellipse cx="97" cy="128" rx="15" ry="8" fill={leafColor} stroke="#2A2520" strokeWidth="2.5" transform="rotate(24 97 128)" />
      <g>
        {[
          [80, 43], [101, 57], [94, 82], [66, 82], [59, 57],
        ].map(([cx, cy]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx="17" ry="22" fill={petalColor} stroke="#2A2520" strokeWidth="3" />
        ))}
        <circle cx="80" cy="68" r="28" fill={leafColor} stroke="#2A2520" strokeWidth="3" />
        <Face eyeY={config.eyeY + 2} talking={talking} mouth={config.mouth} />
        <Accessory accessory={pet.accessory} />
      </g>
      {config.sparkles && <Sparkle x={124} y={40} delay="0.3s" />}
    </svg>
  );
}

function FernSprite({ pet, palette, config, talking }) {
  const stemColor = pet.mood === 'rough' ? palette.roughStem : pet.mood === 'sad' ? palette.sadStem : palette.stem;
  const leafColor = pet.mood === 'rough' ? palette.roughLeaf : pet.mood === 'sad' ? palette.sadLeaf : palette.leaf;

  return (
    <svg viewBox="0 0 160 200" className={`w-44 h-56 z-10 ${talking ? 'sprout-talk-sway' : config.anim}`} aria-label={`Pet appears ${pet.mood}`}>
      <Pot palette={palette} />
      <path d="M80 166 Q79 126 80 88" stroke={stemColor} strokeWidth="6" strokeLinecap="round" fill="none" />
      {[76, 92, 108, 124, 140].map((y, i) => (
        <g key={y}>
          <ellipse cx={62 - i * 2} cy={y} rx="18" ry="6" fill={leafColor} stroke="#2A2520" strokeWidth="2.3" transform={`rotate(${-34 + i * 3} ${62 - i * 2} ${y})`} />
          <ellipse cx={98 + i * 2} cy={y} rx="18" ry="6" fill={leafColor} stroke="#2A2520" strokeWidth="2.3" transform={`rotate(${34 - i * 3} ${98 + i * 2} ${y})`} />
        </g>
      ))}
      <circle cx="80" cy="72" r="26" fill={leafColor} stroke="#2A2520" strokeWidth="3" />
      <Face eyeY={config.eyeY} talking={talking} mouth={config.mouth} />
      <Accessory accessory={pet.accessory} />
      {config.sparkles && <Sparkle x={124} y={46} delay="0.1s" />}
    </svg>
  );
}

function Pot({ palette }) {
  return (
    <g>
      <path d="M40 168 L120 168 L114 196 L46 196 Z" fill={palette.pot} stroke="#2A2520" strokeWidth="3" strokeLinejoin="round" />
      <rect x="36" y="160" width="88" height="12" rx="2" fill={palette.potRim} stroke="#2A2520" strokeWidth="3" />
      <path d="M50 178 L110 178" stroke="#2A2520" strokeWidth="2" strokeDasharray="4 4" opacity="0.35" />
    </g>
  );
}

function Face({ eyeY, talking, mouth }) {
  return (
    <>
      <ellipse cx="62" cy={eyeY + 6} rx="5" ry="3" fill="#EC8956" opacity="0.5" />
      <ellipse cx="98" cy={eyeY + 6} rx="5" ry="3" fill="#EC8956" opacity="0.5" />
      <circle cx="68" cy={eyeY} r="3.5" fill="#2A2520" />
      <circle cx="92" cy={eyeY} r="3.5" fill="#2A2520" />
      <circle cx="69" cy={eyeY - 1} r="1" fill="#FBF7EF" />
      <circle cx="93" cy={eyeY - 1} r="1" fill="#FBF7EF" />
      <Mouth mood={mouth} talking={talking} />
    </>
  );
}

function Mouth({ mood, talking }) {
  if (talking) return <ellipse cx="80" cy="72" rx="6" ry="3" fill="#2A2520" className="sprout-mouth-talk" />;
  if (mood === 'smile') return <path d="M72 70 Q80 78 88 70" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  if (mood === 'flat') return <path d="M73 71 L87 71" stroke="#2A2520" strokeWidth="2.5" strokeLinecap="round" />;
  return <path d="M72 73 Q80 67 88 73" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
}

function SideLeaves({ species, leafColor, leafTilt }) {
  if (species === 'cactus') {
    return (
      <>
        <path d="M76 136 Q60 130 60 116" stroke={leafColor} strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M88 136 Q102 130 102 116" stroke={leafColor} strokeWidth="7" strokeLinecap="round" fill="none" />
      </>
    );
  }

  const fern = species === 'fern';
  return (
    <>
      <g transform={`rotate(${-20 + leafTilt} 80 130)`}>
        <ellipse cx="62" cy="128" rx={fern ? 18 : 14} ry={fern ? 6 : 8} fill={leafColor} stroke="#2A2520" strokeWidth="2.5" />
        <path d="M62 128 L70 130" stroke="#2A2520" strokeWidth="1.5" opacity="0.35" />
      </g>
      <g transform={`rotate(${20 - leafTilt} 80 130)`}>
        <ellipse cx="98" cy="128" rx={fern ? 18 : 14} ry={fern ? 6 : 8} fill={leafColor} stroke="#2A2520" strokeWidth="2.5" />
        <path d="M98 128 L90 130" stroke="#2A2520" strokeWidth="1.5" opacity="0.35" />
      </g>
    </>
  );
}

function TopDetail({ species, leafColor, bloom }) {
  if (species === 'cactus') return <path d="M70 50 L72 43 M80 48 L80 40 M90 50 L88 43" stroke="#2A2520" strokeWidth="2" strokeLinecap="round" opacity="0.45" />;

  if (species === 'flower') {
    return (
      <g>
        <circle cx="80" cy="26" r="5" fill="#EC8956" stroke="#2A2520" strokeWidth="2" />
        <circle cx="72" cy="28" r="5" fill="#F4A87A" stroke="#2A2520" strokeWidth="2" />
        <circle cx="88" cy="28" r="5" fill="#F4A87A" stroke="#2A2520" strokeWidth="2" />
        <circle cx="80" cy="26" r="2" fill="#FBF7EF" />
      </g>
    );
  }

  return (
    <g>
      <path d="M80 48 Q76 36 70 32" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M80 48 Q84 36 90 32" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="68" cy="30" rx={species === 'fern' ? 9 : 6} ry="3" fill={leafColor} stroke="#2A2520" strokeWidth="2.5" transform="rotate(-30 68 30)" />
      <ellipse cx="92" cy="30" rx={species === 'fern' ? 9 : 6} ry="3" fill={leafColor} stroke="#2A2520" strokeWidth="2.5" transform="rotate(30 92 30)" />
      {bloom && <circle cx="80" cy="22" r="4.5" fill="#EC8956" stroke="#2A2520" strokeWidth="2" />}
    </g>
  );
}

function CactusMarks() {
  return (
    <g stroke="#2A2520" strokeWidth="1.5" strokeLinecap="round" opacity="0.35">
      <path d="M58 76 L54 76 M104 82 L108 82 M78 58 L78 54 M86 102 L86 106" />
    </g>
  );
}

function Accessory({ accessory }) {
  if (accessory === 'bow') {
    return (
      <g transform="translate(80 50)">
        <path d="M0 0 L-12 -6 L-12 6 Z" fill="#EC8956" stroke="#2A2520" strokeWidth="2" />
        <path d="M0 0 L12 -6 L12 6 Z" fill="#EC8956" stroke="#2A2520" strokeWidth="2" />
        <circle cx="0" cy="0" r="3" fill="#F4A87A" stroke="#2A2520" strokeWidth="2" />
      </g>
    );
  }

  if (accessory === 'scarf') {
    return (
      <g>
        <path d="M55 106 Q80 115 105 106" stroke="#EC8956" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M94 110 L102 130" stroke="#EC8956" strokeWidth="6" strokeLinecap="round" />
      </g>
    );
  }

  if (accessory === 'glasses') {
    return (
      <g fill="none" stroke="#2A2520" strokeWidth="2">
        <circle cx="68" cy="56" r="7" />
        <circle cx="92" cy="56" r="7" />
        <path d="M75 56 L85 56" />
      </g>
    );
  }

  if (accessory === 'star') {
    return <path d="M112 52 L115 58 L122 59 L117 64 L118 71 L112 68 L106 71 L107 64 L102 59 L109 58 Z" fill="#F4A87A" stroke="#2A2520" strokeWidth="2" />;
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
