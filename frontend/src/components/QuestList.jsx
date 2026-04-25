const CATEGORY_BADGES = {
  connection: { label: 'connect', color: 'bg-peach-400' },
  reflection: { label: 'reflect', color: 'bg-clay-400' },
  mind:       { label: 'mind',    color: 'bg-moss-400' },
  body:       { label: 'body',    color: 'bg-moss-500 text-cream-50' },
  planning:   { label: 'plan',    color: 'bg-cream-200' },
};

export default function QuestList({ quests, onToggle, loading = false }) {
  if (loading) {
    return (
      <div className="p-4 bg-cream-100 border-2 border-dashed border-ink/30 rounded-lg">
        <div className="font-pixel text-lg text-moss-600 animate-pulse">MAKING NEW DAILY QUESTS...</div>
      </div>
    );
  }

  if (quests.length === 0) {
    return <p className="text-sm text-ink/50 italic">No quests yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {quests.map((quest) => {
        const badge = CATEGORY_BADGES[quest.category] || { label: quest.category, color: 'bg-cream-200' };
        return (
          <li
            key={quest.id}
            className={`flex items-start gap-3 p-3 rounded-lg border-2 border-ink transition-all ${
              quest.completed_today ? 'bg-moss-500/10' : 'bg-cream-50 hover:bg-cream-100'
            }`}
          >
            <label className="cursor-pointer pt-0.5">
              <input
                type="checkbox"
                className="quest-check"
                checked={quest.completed_today}
                onChange={() => onToggle(quest)}
                aria-label={`Toggle ${quest.title}`}
              />
            </label>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-display font-bold text-base ${
                  quest.completed_today ? 'line-through text-ink/40' : 'text-ink'
                }`}>
                  {quest.title}
                </span>
                <span className={`font-pixel uppercase text-xs px-1.5 py-0.5 rounded border-2 border-ink ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <p className={`text-xs mt-1 ${quest.completed_today ? 'text-ink/40' : 'text-ink/60'}`}>
                {quest.description}
              </p>
              <RewardChips quest={quest} />
              <QuestTags quest={quest} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function QuestTags({ quest }) {
  const tags = [
    ...(quest.focus_tags || []),
    ...(quest.support_tags || []),
  ].filter(Boolean);

  if (quest.is_core || tags.length === 0) return null;

  return (
    <div className="flex gap-1.5 mt-2 flex-wrap">
      {tags.map((tag) => (
        <span key={tag} className="font-pixel text-xs uppercase text-ink/45 border border-ink/15 rounded px-1.5 py-0.5">
          {tag.replace('_', ' ')}
        </span>
      ))}
    </div>
  );
}

function RewardChips({ quest }) {
  const chips = [];
  if (quest.health_reward)    chips.push({ icon: '❤', value: quest.health_reward,    label: 'health' });
  if (quest.happiness_reward) chips.push({ icon: '✦', value: quest.happiness_reward, label: 'happy' });
  if (quest.energy_reward)    chips.push({ icon: '⚡', value: quest.energy_reward,   label: 'energy' });
  if (chips.length === 0) return null;
  return (
    <div className="flex gap-2 mt-1.5">
      {chips.map((c) => (
        <span key={c.label} className="font-pixel text-xs text-ink/60">
          {c.icon}+{c.value}
        </span>
      ))}
    </div>
  );
}
