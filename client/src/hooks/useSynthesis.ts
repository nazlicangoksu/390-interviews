import { useState, useEffect, useCallback } from 'react';
import type { SynthesisAggregate, SynthesisFilters, AIAnalysisResult, AIAnalysisRequest } from '../types/synthesis';

const defaultFilters: SynthesisFilters = {
  groups: ['investor', 'scientist', 'policy'],
  completed: 'all',
};

export function useSynthesis() {
  const [aggregate, setAggregate] = useState<SynthesisAggregate | null>(null);
  const [analyses, setAnalyses] = useState<AIAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [filters, setFilters] = useState<SynthesisFilters>(defaultFilters);
  const [error, setError] = useState<string | null>(null);

  const fetchAggregate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.groups.length < 3) {
        params.set('groups', filters.groups.join(','));
      }
      if (filters.completed !== 'all') {
        params.set('completed', filters.completed);
      }
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);

      const url = `/api/synthesis/aggregate${params.toString() ? `?${params}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch synthesis data');
      const data = await res.json();
      setAggregate(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchAnalyses = useCallback(async () => {
    try {
      const res = await fetch('/api/synthesis/analyses');
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data);
      }
    } catch {
      // Cache might not exist yet
    }
  }, []);

  const runAnalysis = useCallback(async (request: AIAnalysisRequest): Promise<AIAnalysisResult | null> => {
    setIsAnalyzing(true);
    setActiveAnalysis(request.type);
    try {
      const res = await fetch('/api/synthesis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Analysis failed');
      }
      const result = await res.json();
      setAnalyses(prev => {
        const filtered = prev.filter(a => a.id !== result.id);
        return [...filtered, result];
      });
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsAnalyzing(false);
      setActiveAnalysis(null);
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await fetch('/api/synthesis/cache', { method: 'DELETE' });
      setAnalyses([]);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const exportSynthesis = useCallback(async (format: 'markdown' | 'json') => {
    try {
      const res = await fetch(`/api/synthesis/export?format=${format}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `synthesis.${format === 'markdown' ? 'md' : 'json'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchAggregate();
  }, [fetchAggregate]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  return {
    aggregate,
    analyses,
    isLoading,
    isAnalyzing,
    activeAnalysis,
    filters,
    setFilters,
    runAnalysis,
    clearCache,
    exportSynthesis,
    error,
    refetch: fetchAggregate,
  };
}
