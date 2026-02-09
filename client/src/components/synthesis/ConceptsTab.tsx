import { useState } from 'react';
import type { ConceptRanking, AIAnalysisResult, AIAnalysisRequest } from '../../types/synthesis';

interface ConceptsTabProps {
  conceptRankings: ConceptRanking[];
  analyses: AIAnalysisResult[];
  onRunAnalysis: (request: AIAnalysisRequest) => Promise<AIAnalysisResult | null>;
  isAnalyzing: boolean;
}

type SortKey = 'averageRating' | 'timesReviewed' | 'conceptName';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'opacity-100' : 'opacity-20'}>
          ★
        </span>
      ))}
      <span className="text-xs text-stone-500 ml-1">({rating})</span>
    </span>
  );
}

export default function ConceptsTab({ conceptRankings, analyses, onRunAnalysis, isAnalyzing }: ConceptsTabProps) {
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('timesReviewed');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...conceptRankings].sort((a, b) => {
    const mul = sortDir === 'desc' ? -1 : 1;
    if (sortBy === 'conceptName') return mul * a.conceptName.localeCompare(b.conceptName);
    return mul * ((a[sortBy] as number) - (b[sortBy] as number));
  });

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(key);
      setSortDir('desc');
    }
  };

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className={`text-xs font-medium uppercase tracking-wide ${
        sortBy === sortKey ? 'text-stone-800' : 'text-stone-500'
      } hover:text-stone-800`}
    >
      {label} {sortBy === sortKey && (sortDir === 'desc' ? '↓' : '↑')}
    </button>
  );

  const getConceptAnalysis = (conceptId: string) => {
    return analyses.find(a => a.type === 'concept-synthesis' && a.params?.conceptId === conceptId);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-stone-100 bg-stone-50">
          <div className="col-span-5"><SortHeader label="Concept" sortKey="conceptName" /></div>
          <div className="col-span-2 text-center"><SortHeader label="Reviewed" sortKey="timesReviewed" /></div>
          <div className="col-span-3 text-center"><SortHeader label="Avg Rating" sortKey="averageRating" /></div>
          <div className="col-span-2 text-center">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">Groups</span>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="px-5 py-8 text-center text-stone-500">No concept feedback recorded yet.</div>
        ) : (
          sorted.map(concept => {
            const isExpanded = expandedConcept === concept.conceptId;
            const analysis = getConceptAnalysis(concept.conceptId);

            return (
              <div key={concept.conceptId} className="border-b border-stone-100 last:border-b-0">
                <button
                  onClick={() => setExpandedConcept(isExpanded ? null : concept.conceptId)}
                  className="w-full grid grid-cols-12 gap-4 px-5 py-3 hover:bg-stone-50 transition-colors text-left"
                >
                  <div className="col-span-5">
                    <p className="text-sm font-medium text-stone-800">{concept.conceptName}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm text-stone-600">{concept.timesReviewed}</span>
                  </div>
                  <div className="col-span-3 text-center">
                    {concept.averageRating > 0 ? (
                      <Stars rating={concept.averageRating} />
                    ) : (
                      <span className="text-xs text-stone-400">No ratings</span>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-center gap-1">
                    {concept.reviewerGroups.investor > 0 && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center" title="Investors">
                        {concept.reviewerGroups.investor}
                      </span>
                    )}
                    {concept.reviewerGroups.scientist > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center" title="Scientists">
                        {concept.reviewerGroups.scientist}
                      </span>
                    )}
                    {concept.reviewerGroups.policy > 0 && (
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center" title="Policy">
                        {concept.reviewerGroups.policy}
                      </span>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 space-y-4 bg-stone-50">
                    {concept.ratingsDistribution.some(d => d > 0) && (
                      <div>
                        <h4 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Rating Distribution</h4>
                        <div className="flex items-end gap-1 h-12">
                          {concept.ratingsDistribution.map((count, i) => {
                            const max = Math.max(...concept.ratingsDistribution);
                            const h = max > 0 ? (count / max) * 100 : 0;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                                <div className="w-full bg-amber-400 rounded-t" style={{ height: `${h}%`, minHeight: count > 0 ? 4 : 0 }} />
                                <span className="text-xs text-stone-500">{i + 1}★</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {concept.sampleNotes.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Feedback Notes</h4>
                        <div className="space-y-2">
                          {concept.sampleNotes.map((note, i) => (
                            <div key={i} className="text-sm text-stone-600 bg-white rounded-lg p-3 border border-stone-200 whitespace-pre-wrap">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {concept.sampleModifications.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Suggested Modifications</h4>
                        <div className="space-y-2">
                          {concept.sampleModifications.map((mod, i) => (
                            <div key={i} className="text-sm text-stone-600 bg-white rounded-lg p-3 border border-amber-200 whitespace-pre-wrap">
                              {mod}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      {analysis ? (
                        <div>
                          <h4 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">AI Synthesis</h4>
                          <div className="text-sm text-stone-700 bg-white rounded-lg p-4 border border-stone-200 whitespace-pre-wrap">
                            {analysis.content}
                          </div>
                          <p className="text-xs text-stone-400 mt-1">
                            Generated {new Date(analysis.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRunAnalysis({
                              type: 'concept-synthesis',
                              params: { conceptId: concept.conceptId },
                            });
                          }}
                          disabled={isAnalyzing}
                          className="text-sm text-amber-600 hover:text-amber-700 font-medium disabled:text-stone-400"
                        >
                          {isAnalyzing ? 'Analyzing...' : 'Generate AI Synthesis'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
