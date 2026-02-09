import { useState } from 'react';
import type { TriangulationCell, AIAnalysisResult, AIAnalysisRequest } from '../../types/synthesis';

interface TriangulationTabProps {
  matrix: TriangulationCell[];
  analyses: AIAnalysisResult[];
  onRunAnalysis: (request: AIAnalysisRequest) => Promise<AIAnalysisResult | null>;
  isAnalyzing: boolean;
}

const strengthColors = {
  none: 'bg-stone-100 text-stone-400',
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-green-500 text-white',
};

function AlignmentBadge({ score }: { score: number }) {
  if (score === 0) return <span className="text-xs text-stone-400">No overlap</span>;
  const pct = Math.round(score * 100);
  const color = pct >= 60 ? 'text-green-600' : pct >= 30 ? 'text-amber-600' : 'text-stone-500';
  return <span className={`text-sm font-medium ${color}`}>{pct}%</span>;
}

export default function TriangulationTab({ matrix, analyses, onRunAnalysis, isAnalyzing }: TriangulationTabProps) {
  const [selectedCell, setSelectedCell] = useState<{ topicId: string; group: string } | null>(null);

  const triangulationAnalysis = analyses.find(a => a.type === 'triangulation');

  const selectedTopic = selectedCell
    ? matrix.find(m => m.topicId === selectedCell.topicId)
    : null;

  const selectedSignal = selectedTopic && selectedCell
    ? selectedTopic[selectedCell.group as 'investor' | 'scientist' | 'policy']
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-stone-200 p-5 overflow-x-auto">
        <h3 className="text-sm font-medium text-stone-700 mb-4">
          Investor Demand x Scientific Priority x Policy Viability
        </h3>

        <div className="grid gap-px bg-stone-200 rounded-lg overflow-hidden" style={{ gridTemplateColumns: '200px 1fr 1fr 1fr 100px' }}>
          {/* Header */}
          <div className="bg-stone-50 p-3">
            <span className="text-xs font-medium text-stone-500 uppercase">Topic</span>
          </div>
          <div className="bg-stone-50 p-3 text-center">
            <span className="text-xs font-medium text-amber-600 uppercase">Investors</span>
          </div>
          <div className="bg-stone-50 p-3 text-center">
            <span className="text-xs font-medium text-emerald-600 uppercase">Scientists</span>
          </div>
          <div className="bg-stone-50 p-3 text-center">
            <span className="text-xs font-medium text-blue-600 uppercase">Policy</span>
          </div>
          <div className="bg-stone-50 p-3 text-center">
            <span className="text-xs font-medium text-stone-500 uppercase">Alignment</span>
          </div>

          {/* Rows */}
          {matrix.map(row => (
            <>
              <div key={`${row.topicId}-label`} className="bg-white p-3 flex items-center">
                <span className="text-sm text-stone-700 font-medium">{row.topicName}</span>
              </div>
              {(['investor', 'scientist', 'policy'] as const).map(group => {
                const signal = row[group];
                const isSelected = selectedCell?.topicId === row.topicId && selectedCell?.group === group;
                return (
                  <button
                    key={`${row.topicId}-${group}`}
                    onClick={() => setSelectedCell(isSelected ? null : { topicId: row.topicId, group })}
                    className={`p-3 text-center transition-all ${strengthColors[signal.strength]} ${
                      isSelected ? 'ring-2 ring-amber-500 ring-inset' : ''
                    } hover:opacity-80`}
                  >
                    <p className="text-sm font-medium">
                      {signal.strength === 'none' ? '—' : signal.selectedCount > 0 ? `${signal.selectedCount} sel` : `${signal.mentionCount} rev`}
                    </p>
                    {signal.averageConceptRating > 0 && (
                      <p className="text-xs opacity-75">{signal.averageConceptRating}★</p>
                    )}
                  </button>
                );
              })}
              <div key={`${row.topicId}-align`} className="bg-white p-3 flex items-center justify-center">
                <AlignmentBadge score={row.alignmentScore} />
              </div>
            </>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4">
          <span className="text-xs text-stone-500">Signal strength:</span>
          {Object.entries(strengthColors).map(([strength, cls]) => (
            <span key={strength} className={`text-xs px-2 py-0.5 rounded ${cls}`}>
              {strength}
            </span>
          ))}
        </div>
      </div>

      {/* Cell detail */}
      {selectedSignal && selectedCell && selectedTopic && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h4 className="text-sm font-medium text-stone-700 mb-2">
            {selectedTopic.topicName} / {selectedCell.group.charAt(0).toUpperCase() + selectedCell.group.slice(1)}s
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm text-stone-600">
            <div>
              <p className="text-xs text-stone-500 uppercase">Selected as topic</p>
              <p className="font-medium">{selectedSignal.selectedCount} time{selectedSignal.selectedCount !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 uppercase">Concepts reviewed</p>
              <p className="font-medium">{selectedSignal.mentionCount}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 uppercase">Avg concept rating</p>
              <p className="font-medium">{selectedSignal.averageConceptRating > 0 ? `${selectedSignal.averageConceptRating}★` : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Narrative */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h3 className="text-sm font-medium text-stone-700 mb-3">Triangulation Narrative</h3>
        {triangulationAnalysis ? (
          <div>
            <div className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
              {triangulationAnalysis.content}
            </div>
            <p className="text-xs text-stone-400 mt-3">
              Generated {new Date(triangulationAnalysis.generatedAt).toLocaleDateString()} from {triangulationAnalysis.sessionCount} sessions
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-stone-500 mb-3">
              Generate an AI narrative that identifies where investor demand, scientific priority, and policy viability align or diverge across your interviews.
            </p>
            <button
              onClick={() => onRunAnalysis({ type: 'triangulation' })}
              disabled={isAnalyzing}
              className="text-sm bg-stone-700 hover:bg-stone-800 text-white px-4 py-2 rounded-lg font-medium disabled:bg-stone-400 transition-colors"
            >
              {isAnalyzing ? 'Generating...' : 'Generate Triangulation Narrative'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
