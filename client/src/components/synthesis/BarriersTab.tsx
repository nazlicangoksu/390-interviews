import type { BarrierFrequency, TopicFrequency, CustomItemFrequency } from '../../types/synthesis';

interface BarriersTabProps {
  barrierFrequencies: BarrierFrequency[];
  customBarriers: CustomItemFrequency[];
  topicFrequencies: TopicFrequency[];
  customTopics: CustomItemFrequency[];
}

function FrequencyBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const width = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-stone-600 w-48 truncate" title={label}>{label}</span>
      <div className="flex-1 bg-stone-100 rounded-full h-4 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-sm font-medium text-stone-700 w-6 text-right">{count}</span>
    </div>
  );
}

function GroupDots({ investor, scientist, policy }: { investor: number; scientist: number; policy: number }) {
  return (
    <div className="flex gap-1 ml-2">
      {investor > 0 && <span className="text-xs text-amber-600" title={`${investor} investor(s)`}>I:{investor}</span>}
      {scientist > 0 && <span className="text-xs text-emerald-600" title={`${scientist} scientist(s)`}>S:{scientist}</span>}
      {policy > 0 && <span className="text-xs text-blue-600" title={`${policy} policy`}>P:{policy}</span>}
    </div>
  );
}

export default function BarriersTab({ barrierFrequencies, customBarriers, topicFrequencies, customTopics }: BarriersTabProps) {
  const maxBarrier = Math.max(...barrierFrequencies.map(b => b.count), 1);
  const maxTopic = Math.max(...topicFrequencies.map(t => t.count), 1);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="text-sm font-medium text-stone-700 mb-4">Investment Barriers</h3>
          {barrierFrequencies.length === 0 ? (
            <p className="text-sm text-stone-400">No barrier data yet.</p>
          ) : (
            <div className="space-y-3">
              {barrierFrequencies.map(barrier => (
                <div key={barrier.barrierId}>
                  <FrequencyBar
                    label={barrier.barrierName}
                    count={barrier.count}
                    max={maxBarrier}
                    color="bg-red-400"
                  />
                  <GroupDots
                    investor={barrier.byGroup.investor}
                    scientist={barrier.byGroup.scientist}
                    policy={barrier.byGroup.policy}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {customBarriers.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-sm font-medium text-stone-700 mb-4">Custom Barriers (Participant-Created)</h3>
            <div className="space-y-2">
              {customBarriers.map((cb, i) => (
                <div key={i} className="flex items-center justify-between bg-stone-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-stone-700 capitalize">{cb.text}</span>
                  <span className="text-xs text-stone-500">{cb.count} session{cb.count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="text-sm font-medium text-stone-700 mb-4">Topic Interest</h3>
          {topicFrequencies.length === 0 ? (
            <p className="text-sm text-stone-400">No topic selections yet.</p>
          ) : (
            <div className="space-y-3">
              {topicFrequencies.map(topic => (
                <div key={topic.topicId}>
                  <FrequencyBar
                    label={topic.topicName}
                    count={topic.count}
                    max={maxTopic}
                    color="bg-emerald-400"
                  />
                  <GroupDots
                    investor={topic.byGroup.investor}
                    scientist={topic.byGroup.scientist}
                    policy={topic.byGroup.policy}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {customTopics.length > 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-sm font-medium text-stone-700 mb-4">Custom Topics (Participant-Created)</h3>
            <div className="space-y-2">
              {customTopics.map((ct, i) => (
                <div key={i} className="flex items-center justify-between bg-stone-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-stone-700 capitalize">{ct.text}</span>
                  <span className="text-xs text-stone-500">{ct.count} session{ct.count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
