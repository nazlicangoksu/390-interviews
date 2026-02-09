import type { SynthesisFilters, ParticipantGroup } from '../../types/synthesis';

interface FilterBarProps {
  filters: SynthesisFilters;
  onFiltersChange: (filters: SynthesisFilters) => void;
}

const groupLabels: Record<ParticipantGroup, string> = {
  investor: 'Investors',
  scientist: 'Scientists',
  policy: 'Policy',
};

export default function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const toggleGroup = (group: ParticipantGroup) => {
    const current = filters.groups;
    const updated = current.includes(group)
      ? current.filter(g => g !== group)
      : [...current, group];
    if (updated.length > 0) {
      onFiltersChange({ ...filters, groups: updated });
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Group</span>
        {(Object.keys(groupLabels) as ParticipantGroup[]).map(group => (
          <label key={group} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.groups.includes(group)}
              onChange={() => toggleGroup(group)}
              className="rounded border-stone-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-stone-700">{groupLabels[group]}</span>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Status</span>
        {(['all', 'completed', 'in-progress'] as const).map(status => (
          <button
            key={status}
            onClick={() => onFiltersChange({ ...filters, completed: status })}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              filters.completed === status
                ? 'bg-stone-800 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {status === 'all' ? 'All' : status === 'completed' ? 'Completed' : 'In Progress'}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">From</span>
        <input
          type="date"
          value={filters.from || ''}
          onChange={e => onFiltersChange({ ...filters, from: e.target.value || undefined })}
          className="text-sm border border-stone-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">To</span>
        <input
          type="date"
          value={filters.to || ''}
          onChange={e => onFiltersChange({ ...filters, to: e.target.value || undefined })}
          className="text-sm border border-stone-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {(filters.groups.length < 3 || filters.completed !== 'all' || filters.from || filters.to) && (
        <button
          onClick={() => onFiltersChange({ groups: ['investor', 'scientist', 'policy'], completed: 'all' })}
          className="text-xs text-amber-600 hover:text-amber-700 font-medium"
        >
          Reset
        </button>
      )}
    </div>
  );
}
