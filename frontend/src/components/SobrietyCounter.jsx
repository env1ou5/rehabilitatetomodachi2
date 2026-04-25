export default function SobrietyCounter({ days }) {
  const milestone = nextMilestone(days);
  const progress = milestone
    ? Math.min(100, Math.round(((days - milestone.prev) / (milestone.next - milestone.prev)) * 100))
    : 100;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="pixel-heading text-sm">Streak</span>
        {milestone && (
          <span className="text-xs text-ink/50 font-medium">
            next: {milestone.next}-day milestone
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <div className="font-display font-black text-5xl text-moss-700 leading-none">
          {days}
        </div>
        <div className="font-pixel text-lg text-peach-600 uppercase">
          {days === 1 ? 'day' : 'days'} sober
        </div>
      </div>

      {milestone && (
        <div className="mt-3 h-2 bg-cream-200 border-2 border-ink rounded-full overflow-hidden">
          <div
            className="h-full bg-moss-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {days === 0 && (
        <p className="text-xs text-ink/60 mt-3 italic font-display">
          Day one is brave. Your sprout is still here. 🌱
        </p>
      )}
      {days > 0 && days < 7 && (
        <p className="text-xs text-ink/60 mt-3 italic font-display">
          The first week is the hardest part of the climb. Keep going.
        </p>
      )}
    </div>
  );
}

function nextMilestone(days) {
  const milestones = [1, 3, 7, 14, 30, 60, 90, 180, 365, 730, 1095];
  for (let i = 0; i < milestones.length; i++) {
    if (days < milestones[i]) {
      return { prev: i === 0 ? 0 : milestones[i - 1], next: milestones[i] };
    }
  }
  return null;
}
