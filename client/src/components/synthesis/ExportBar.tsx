import { useState } from 'react';

interface ExportBarProps {
  onExport: (format: 'markdown' | 'json') => Promise<void>;
  onClearCache: () => Promise<void>;
  sessionCount: number;
  cacheCount: number;
}

export default function ExportBar({ onExport, onClearCache, sessionCount, cacheCount }: ExportBarProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="mt-8 pt-6 border-t border-stone-200 flex items-center justify-between">
      <p className="text-sm text-stone-500">
        Synthesizing {sessionCount} session{sessionCount !== 1 ? 's' : ''}
        {cacheCount > 0 && ` · ${cacheCount} cached analysis result${cacheCount !== 1 ? 's' : ''}`}
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => onExport('markdown')}
          className="text-sm border border-stone-300 text-stone-700 hover:bg-stone-100 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Export Markdown
        </button>
        <button
          onClick={() => onExport('json')}
          className="text-sm border border-stone-300 text-stone-700 hover:bg-stone-100 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Export JSON
        </button>
        {cacheCount > 0 && (
          <>
            {showConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-500">Clear all cached AI results?</span>
                <button
                  onClick={() => { onClearCache(); setShowConfirm(false); }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-sm text-stone-500 hover:text-stone-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="text-sm text-red-500 hover:text-red-600 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear AI Cache
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
