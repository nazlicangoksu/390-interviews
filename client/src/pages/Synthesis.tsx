import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

interface BarrierFrequency {
  barrierId: string;
  barrierName: string;
  count: number;
}

interface CustomBarrier {
  text: string;
  count: number;
  sessions: string[];
}

interface AggregateData {
  stats: { totalSessions: number };
  barrierFrequencies: BarrierFrequency[];
  customBarriers: CustomBarrier[];
}

interface AISection {
  content: string;
  loading: boolean;
  error: string | null;
}

export default function Synthesis() {
  const navigate = useNavigate();
  const [aggregate, setAggregate] = useState<AggregateData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [insights, setInsights] = useState<AISection>({ content: '', loading: false, error: null });
  const [opportunities, setOpportunities] = useState<AISection>({ content: '', loading: false, error: null });

  useEffect(() => {
    fetch('/api/synthesis/aggregate')
      .then(r => r.json())
      .then(setAggregate)
      .catch(() => setLoadError('Failed to load session data'));
  }, []);

  // Load cached analyses on mount
  useEffect(() => {
    fetch('/api/synthesis/analyses')
      .then(r => r.json())
      .then((analyses: any[]) => {
        for (const a of analyses) {
          if (a.type === 'thematic') {
            setInsights(prev => ({ ...prev, content: a.content }));
          }
          if (a.type === 'paper-section' && a.params?.paperSection === 5) {
            setOpportunities(prev => ({ ...prev, content: a.content }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const generateInsights = useCallback(async () => {
    setInsights({ content: '', loading: true, error: null });
    try {
      const res = await fetch('/api/synthesis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'thematic', params: { participantGroup: 'all' } }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setInsights({ content: data.content, loading: false, error: null });
    } catch (e: any) {
      setInsights({ content: '', loading: false, error: e.message || 'Generation failed' });
    }
  }, []);

  const generateOpportunities = useCallback(async () => {
    setOpportunities({ content: '', loading: true, error: null });
    try {
      const res = await fetch('/api/synthesis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'paper-section', params: { paperSection: 5 } }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setOpportunities({ content: data.content, loading: false, error: null });
    } catch (e: any) {
      setOpportunities({ content: '', loading: false, error: e.message || 'Generation failed' });
    }
  }, []);

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p className="text-red-500 text-center py-12">{loadError}</p>
      </div>
    );
  }

  if (!aggregate) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p className="text-stone-400 text-center py-12">Loading...</p>
      </div>
    );
  }

  const sortedBarriers = [...aggregate.barrierFrequencies].sort((a, b) => b.count - a.count);
  const maxCount = sortedBarriers[0]?.count || 1;

  const markdownComponents = {
    h2: (props: any) => <h3 className="text-lg font-semibold text-stone-800 mt-8 mb-2" {...props} />,
    h3: (props: any) => <h4 className="text-base font-semibold text-stone-700 mt-6 mb-2" {...props} />,
    p: (props: any) => <p className="text-sm text-stone-600 leading-relaxed mb-3" {...props} />,
    strong: (props: any) => <strong className="font-semibold text-stone-800" {...props} />,
    blockquote: (props: any) => (
      <blockquote className="border-l-2 border-amber-400 pl-4 my-3 text-xs text-stone-500 italic" {...props} />
    ),
    ul: (props: any) => <ul className="space-y-1 my-2 ml-4" {...props} />,
    ol: (props: any) => <ol className="space-y-1 my-2 ml-4 list-decimal" {...props} />,
    li: (props: any) => <li className="text-sm text-stone-600" {...props} />,
    hr: () => <hr className="my-8 border-stone-200" />,
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <header className="mb-10">
        <button
          onClick={() => navigate('/')}
          className="text-stone-400 hover:text-stone-600 text-sm mb-4 inline-block"
        >
          &larr; Back to Dashboard
        </button>
        <h1 className="text-3xl font-light text-stone-800 mb-1">
          Research Synthesis
        </h1>
        <p className="text-stone-400 text-sm">
          {aggregate.stats.totalSessions} interview{aggregate.stats.totalSessions !== 1 ? 's' : ''} analyzed
        </p>
      </header>

      {/* Section 1: Barriers */}
      <section className="mb-14">
        <h2 className="text-xl font-medium text-stone-800 mb-4">Barriers to Climate Investment</h2>
        <p className="text-stone-500 text-sm mb-6">
          What participants identified as obstacles to deploying capital into climate solutions.
        </p>

        <div className="space-y-3">
          {sortedBarriers.map((b) => (
            <div key={b.barrierId} className="flex items-center gap-4">
              <div className="w-48 text-sm text-stone-600 shrink-0 text-right">{b.barrierName}</div>
              <div className="flex-1 h-7 bg-stone-100 rounded overflow-hidden">
                <div
                  className="h-full bg-amber-500/70 rounded transition-all"
                  style={{ width: `${(b.count / maxCount) * 100}%` }}
                />
              </div>
              <div className="w-8 text-sm text-stone-400 text-right">{b.count}</div>
            </div>
          ))}
        </div>

        {aggregate.customBarriers.length > 0 && (
          <div className="mt-6 pt-4 border-t border-stone-100">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">
              Participant-added barriers
            </p>
            <div className="flex flex-wrap gap-2">
              {aggregate.customBarriers.map((b, i) => (
                <span key={i} className="text-sm bg-stone-100 text-stone-600 px-3 py-1 rounded-full">
                  {b.text}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Key Insights */}
      <section className="mb-14">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-medium text-stone-800">Key Insights</h2>
          <button
            onClick={generateInsights}
            disabled={insights.loading}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
          >
            {insights.loading ? 'Generating...' : insights.content ? 'Regenerate' : 'Generate'}
          </button>
        </div>
        <p className="text-stone-500 text-sm mb-6">
          Thematic analysis across all interviews, identifying recurring patterns and outlier observations.
        </p>

        {insights.loading && (
          <div className="py-8 text-center">
            <div className="inline-block w-5 h-5 border-2 border-stone-300 border-t-amber-500 rounded-full animate-spin mb-3" />
            <p className="text-stone-400 text-sm">Analyzing {aggregate.stats.totalSessions} interviews...</p>
          </div>
        )}

        {insights.error && (
          <p className="text-red-500 text-sm py-4">{insights.error}</p>
        )}

        {insights.content && (
          <ReactMarkdown components={markdownComponents}>
            {insights.content}
          </ReactMarkdown>
        )}

        {!insights.content && !insights.loading && !insights.error && (
          <div className="py-8 text-center border border-dashed border-stone-200 rounded-xl">
            <p className="text-stone-400 text-sm">Click "Generate" to run AI thematic analysis</p>
          </div>
        )}
      </section>

      {/* Section 3: Design Opportunities */}
      <section className="mb-14">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-medium text-stone-800">Design Opportunities</h2>
          <button
            onClick={generateOpportunities}
            disabled={opportunities.loading}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
          >
            {opportunities.loading ? 'Generating...' : opportunities.content ? 'Regenerate' : 'Generate'}
          </button>
        </div>
        <p className="text-stone-500 text-sm mb-6">
          High-potential opportunity spaces framed as questions, grounded in what participants told us.
        </p>

        {opportunities.loading && (
          <div className="py-8 text-center">
            <div className="inline-block w-5 h-5 border-2 border-stone-300 border-t-amber-500 rounded-full animate-spin mb-3" />
            <p className="text-stone-400 text-sm">Synthesizing opportunities from {aggregate.stats.totalSessions} interviews...</p>
          </div>
        )}

        {opportunities.error && (
          <p className="text-red-500 text-sm py-4">{opportunities.error}</p>
        )}

        {opportunities.content && (
          <ReactMarkdown components={markdownComponents}>
            {opportunities.content}
          </ReactMarkdown>
        )}

        {!opportunities.content && !opportunities.loading && !opportunities.error && (
          <div className="py-8 text-center border border-dashed border-stone-200 rounded-xl">
            <p className="text-stone-400 text-sm">Click "Generate" to identify design opportunities</p>
          </div>
        )}
      </section>
    </div>
  );
}
