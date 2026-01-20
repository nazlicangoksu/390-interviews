import { useState, useEffect } from 'react';
import type { Concept, ConceptFeedback } from '../types';

interface ConceptModalProps {
  concept: Concept;
  feedback?: ConceptFeedback;
  onSave: (feedback: ConceptFeedback) => void;
  onClose: () => void;
}

export default function ConceptModal({
  concept,
  feedback,
  onSave,
  onClose,
}: ConceptModalProps) {
  const [rating, setRating] = useState(feedback?.rating || 0);
  const [notes, setNotes] = useState(feedback?.notes || '');
  const [modifications, setModifications] = useState(feedback?.modifications || '');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSave = () => {
    onSave({
      rating,
      notes,
      modifications,
      timestamp: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex justify-between items-start">
          <div>
            <div className="text-xs text-stone-400 mb-1">{concept.category}</div>
            <h2 className="text-2xl font-light text-stone-800">{concept.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Details */}
            <div>
              <p className="text-lg text-stone-600 mb-6">{concept.tagline}</p>

              <h3 className="font-medium text-stone-700 mb-3">How it works:</h3>
              <div className="space-y-4">
                {concept.details.map((detail, idx) => (
                  <div key={idx}>
                    <p className="font-medium text-stone-800">{detail.title}</p>
                    <p className="text-sm text-stone-600">{detail.description}</p>
                  </div>
                ))}
              </div>

            </div>

            {/* Right: Image & Feedback */}
            <div>
              <div className="rounded-xl overflow-hidden mb-6 bg-stone-100">
                <img
                  src={`/images/concepts/${concept.image}`}
                  alt={concept.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Interest Level
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-10 h-10 rounded-full border-2 text-lg transition-colors ${
                        star <= rating
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'border-stone-300 text-stone-300 hover:border-amber-300'
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Reactions & Feedback
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What's your initial reaction? Any concerns or questions?"
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Modifications */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Modifications & New Ideas
                </label>
                <textarea
                  value={modifications}
                  onChange={(e) => setModifications(e.target.value)}
                  placeholder="How would you change this? Any new ideas it sparks?"
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
