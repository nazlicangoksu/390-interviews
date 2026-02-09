import { useState } from 'react';
import type { AIAnalysisResult, AIAnalysisRequest, ParticipantGroup } from '../../types/synthesis';

interface AIAnalysisTabProps {
  analyses: AIAnalysisResult[];
  onRunAnalysis: (request: AIAnalysisRequest) => Promise<AIAnalysisResult | null>;
  isAnalyzing: boolean;
  activeAnalysis: string | null;
  sessionCount: number;
}

interface AnalysisCardConfig {
  type: AIAnalysisRequest['type'];
  title: string;
  description: string;
  hasGroupSelector?: boolean;
  hasSectionSelector?: boolean;
}

const cards: AnalysisCardConfig[] = [
  {
    type: 'thematic',
    title: 'Thematic Analysis',
    description: 'Identify recurring themes across interview notes, grouped by participant type.',
    hasGroupSelector: true,
  },
  {
    type: 'decision-framework',
    title: 'Decision Framework',
    description: 'Extract the core questions HNWIs ask when evaluating climate investment opportunities.',
  },
  {
    type: 'triangulation',
    title: 'Triangulation Narrative',
    description: 'Where do investor demand, scientific priority, and policy viability converge or diverge?',
  },
  {
    type: 'key-quotes',
    title: 'Key Quotes',
    description: 'Pull the most significant direct quotes from across all interview notes.',
  },
  {
    type: 'paper-section',
    title: 'Paper Section Draft',
    description: 'Generate a draft for a specific section of your research paper.',
    hasSectionSelector: true,
  },
  {
    type: 'concept-synthesis',
    title: 'Concept Synthesis',
    description: 'Aggregate feedback and generate redesign suggestions for a specific concept.',
  },
];

const sectionLabels: Record<number, string> = {
  1: 'Part 1: Setup',
  2: 'Part 2: Insights',
  3: 'Part 3: Overlaps',
  4: 'Part 4: Decision Framework',
  5: 'Part 5: Opportunities',
};

export default function AIAnalysisTab({ analyses, onRunAnalysis, isAnalyzing, activeAnalysis, sessionCount }: AIAnalysisTabProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ParticipantGroup>('investor');
  const [selectedSection, setSelectedSection] = useState<number>(2);

  const getAnalysis = (type: string, params?: any): AIAnalysisResult | undefined => {
    return analyses.find(a => {
      if (a.type !== type) return false;
      if (params?.participantGroup && a.params?.participantGroup !== params.participantGroup) return false;
      if (params?.paperSection && a.params?.paperSection !== params.paperSection) return false;
      return true;
    });
  };

  const handleRun = (card: AnalysisCardConfig) => {
    const params: AIAnalysisRequest['params'] = {};
    if (card.hasGroupSelector) params.participantGroup = selectedGroup;
    if (card.hasSectionSelector) params.paperSection = selectedSection as 1 | 2 | 3 | 4 | 5;
    onRunAnalysis({ type: card.type, params });
  };

  return (
    <div className="space-y-6">
      {sessionCount === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          No sessions available. Conduct some interviews first before running AI analysis.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {cards.map(card => {
          const params: any = {};
          if (card.hasGroupSelector) params.participantGroup = selectedGroup;
          if (card.hasSectionSelector) params.paperSection = selectedSection;
          const existing = getAnalysis(card.type, params);
          const isActive = activeAnalysis === card.type;
          const isExpanded = expandedCard === card.type;

          return (
            <div key={card.type} className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-stone-800">{card.title}</h3>
                {existing && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Cached
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-500 mb-3">{card.description}</p>

              {card.hasGroupSelector && (
                <div className="flex gap-2 mb-3">
                  {(['investor', 'scientist', 'policy'] as ParticipantGroup[]).map(group => (
                    <button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        selectedGroup === group
                          ? 'bg-stone-800 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {group.charAt(0).toUpperCase() + group.slice(1)}
                    </button>
                  ))}
                </div>
              )}

              {card.hasSectionSelector && (
                <select
                  value={selectedSection}
                  onChange={e => setSelectedSection(Number(e.target.value))}
                  className="text-sm border border-stone-300 rounded-lg px-2 py-1 mb-3 w-full focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {Object.entries(sectionLabels).map(([num, label]) => (
                    <option key={num} value={num}>{label}</option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleRun(card)}
                  disabled={isAnalyzing || sessionCount === 0}
                  className="text-sm bg-stone-700 hover:bg-stone-800 text-white px-3 py-1.5 rounded-lg font-medium disabled:bg-stone-400 transition-colors"
                >
                  {isActive ? 'Generating...' : existing ? 'Regenerate' : 'Generate'}
                </button>
                {existing && (
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : card.type)}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    {isExpanded ? 'Collapse' : 'View Result'}
                  </button>
                )}
              </div>

              {isExpanded && existing && (
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <div className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                    {existing.content}
                  </div>
                  <p className="text-xs text-stone-400 mt-2">
                    Generated {new Date(existing.generatedAt).toLocaleDateString()} from {existing.sessionCount} sessions
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
