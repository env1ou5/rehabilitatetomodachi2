export default function Stats({ pet }) {
  return (
    <div className="space-y-3">
      <Bar label="Health"    value={pet.health}    color="bg-clay-500"   icon="❤" />
      <Bar label="Happiness" value={pet.happiness} color="bg-peach-500"  icon="✦" />
      <Bar label="Energy"    value={pet.energy}    color="bg-moss-500"   icon="⚡" />
    </div>
  );
}

function Bar({ label, value, color, icon }) {
  // Quantize to 10 segments for the pixel-bar look
  const segments = 10;
  const filled = Math.round((value / 100) * segments);

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 flex items-center gap-1.5 font-pixel text-base text-ink uppercase">
        <span aria-hidden>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex-1 flex gap-0.5 p-1 bg-cream-100 border-2 border-ink rounded-md">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-4 rounded-sm transition-colors ${
              i < filled ? color : 'bg-cream-200'
            }`}
          />
        ))}
      </div>
      <div className="w-10 text-right font-pixel text-lg text-ink/70">{value}</div>
    </div>
  );
}
