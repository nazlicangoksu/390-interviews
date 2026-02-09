import type { SynthesisAggregate, ParticipantGroup } from '../../types/synthesis';

interface OverviewTabProps {
  aggregate: SynthesisAggregate;
}

const groupColors: Record<ParticipantGroup, string> = {
  investor: 'bg-amber-500',
  scientist: 'bg-emerald-500',
  policy: 'bg-blue-500',
};

const groupLabels: Record<ParticipantGroup, string> = {
  investor: 'Investors',
  scientist: 'Scientists',
  policy: 'Policy Analysts',
};

function StatCard({ label, value, subtitle }: { label: string; value: string | number; subtitle?: string }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
      <p className="text-2xl font-light text-stone-800">{value}</p>
      <p className="text-sm text-stone-500 mt-1">{label}</p>
      {subtitle && <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const width = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-stone-600 w-40 truncate">{label}</span>
      <div className="flex-1 bg-stone-100 rounded-full h-5 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-sm font-medium text-stone-700 w-8 text-right">{value}</span>
    </div>
  );
}

export default function OverviewTab({ aggregate }: OverviewTabProps) {
  const { stats, conceptRankings } = aggregate;
  const maxGroup = Math.max(...Object.values(stats.byGroup));
  const maxOrg = Math.max(...Object.values(stats.byOrganizationType));

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Sessions" value={stats.totalSessions} />
        <StatCard label="Completed" value={stats.completedSessions} />
        <StatCard label="In Progress" value={stats.inProgressSessions} />
        <StatCard
          label="Concepts Reviewed"
          value={conceptRankings.length}
          subtitle={`of ${conceptRankings.length} reviewed at least once`}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="text-sm font-medium text-stone-700 mb-4">Sessions by Participant Group</h3>
          <div className="space-y-3">
            {(Object.keys(groupLabels) as ParticipantGroup[]).map(group => (
              <Bar
                key={group}
                label={groupLabels[group]}
                value={stats.byGroup[group]}
                max={maxGroup}
                color={groupColors[group]}
              />
            ))}
          </div>
          {stats.byGroup.scientist === 0 && stats.byGroup.policy === 0 && (
            <p className="text-xs text-stone-400 mt-3 italic">
              Only investor interviews recorded so far. Scientist and policy analyst sessions will appear here as you conduct them.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="text-sm font-medium text-stone-700 mb-4">Sessions by Organization Type</h3>
          <div className="space-y-3">
            {Object.entries(stats.byOrganizationType)
              .sort((a, b) => b[1] - a[1])
              .map(([orgType, count]) => (
                <Bar
                  key={orgType}
                  label={orgType}
                  value={count}
                  max={maxOrg}
                  color="bg-stone-500"
                />
              ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="text-sm font-medium text-stone-700 mb-2">Date Range</h3>
        <p className="text-sm text-stone-600">
          {formatDate(stats.dateRange.earliest)} to {formatDate(stats.dateRange.latest)}
        </p>
      </div>
    </div>
  );
}
