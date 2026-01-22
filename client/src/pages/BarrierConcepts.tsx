import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConcepts, useBarriers, useTopics } from '../hooks/useData';
import { useSession } from '../hooks/useSession';
import ConceptCreateModal from '../components/ConceptCreateModal';
import type { Concept, ConceptFeedback, Barrier, SessionConcept } from '../types';

const barrierColors: Record<string, string> = {
  red: 'bg-red-100 text-red-700 border-red-300',
  orange: 'bg-orange-100 text-orange-700 border-orange-300',
  purple: 'bg-purple-100 text-purple-700 border-purple-300',
  blue: 'bg-blue-100 text-blue-700 border-blue-300',
  amber: 'bg-amber-100 text-amber-700 border-amber-300',
  green: 'bg-green-100 text-green-700 border-green-300',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  slate: 'bg-slate-100 text-slate-700 border-slate-300',
  stone: 'bg-stone-200 text-stone-700 border-stone-400',
  teal: 'bg-teal-100 text-teal-700 border-teal-300',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  pink: 'bg-pink-100 text-pink-700 border-pink-300',
};

function ConfirmEndModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-medium text-stone-800 mb-4">End Session?</h3>
        <p className="text-stone-600 mb-6">
          This will complete the interview and save all feedback. You can view this session later from the dashboard.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Continue Interview
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}

interface BarrierConceptModalProps {
  concept: Concept;
  feedback?: ConceptFeedback;
  barriers: Barrier[];
  selectedBarrierIds: string[];
  onSave: (feedback: ConceptFeedback) => void;
  onClose: () => void;
}

function BarrierConceptModal({
  concept,
  feedback,
  barriers,
  selectedBarrierIds,
  onSave,
  onClose,
}: BarrierConceptModalProps) {
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

  // Get the barrier solutions that match the user's selected barriers
  const relevantSolutions = useMemo(() => {
    if (!concept.barrierSolutions) return [];
    return concept.barrierSolutions.filter((sol) =>
      selectedBarrierIds.includes(sol.barrierId)
    );
  }, [concept.barrierSolutions, selectedBarrierIds]);

  const getBarrierById = (id: string) => barriers.find((b) => b.id === id);

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
              <div className="space-y-4 mb-6">
                {concept.details.map((detail, idx) => (
                  <div key={idx}>
                    <p className="font-medium text-stone-800">{detail.title}</p>
                    <p className="text-sm text-stone-600">{detail.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Image, Barrier Solutions & Feedback */}
            <div>
              <div className="rounded-xl overflow-hidden mb-6 bg-stone-100">
                <img
                  src={`/images/concepts/${concept.image}`}
                  alt={concept.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Why This Works For You */}
              {relevantSolutions.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <h3 className="font-medium text-green-800 mb-3">
                    Why this works for you:
                  </h3>
                  <div className="space-y-3">
                    {relevantSolutions.map((solution) => (
                      <div key={solution.barrierId}>
                        <p className="text-sm text-stone-700">{solution.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  placeholder="Does this concept address your barriers effectively? Any concerns?"
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

interface BarrierConceptCardProps {
  concept: Concept;
  feedback?: ConceptFeedback;
  barriers: Barrier[];
  selectedBarrierIds: string[];
  onClick: () => void;
}

function BarrierConceptCard({
  concept,
  feedback,
  barriers,
  selectedBarrierIds,
  onClick,
}: BarrierConceptCardProps) {
  // Get barriers this concept addresses that match user's selected barriers
  const addressedBarriers = useMemo(() => {
    if (!concept.barrierSolutions) return [];
    return concept.barrierSolutions
      .filter((sol) => selectedBarrierIds.includes(sol.barrierId))
      .map((sol) => barriers.find((b) => b.id === sol.barrierId))
      .filter(Boolean) as Barrier[];
  }, [concept.barrierSolutions, selectedBarrierIds, barriers]);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
        feedback ? 'border-green-400' : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      <div className="h-32 bg-stone-100 relative">
        <img
          src={`/images/concepts/${concept.image}`}
          alt={concept.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {feedback && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Reviewed
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-xs text-stone-400 mb-1">{concept.category}</div>
        <h3 className="font-medium text-stone-800 mb-1">{concept.name}</h3>
        <p className="text-sm text-stone-500 line-clamp-2 mb-3">{concept.tagline}</p>


        {/* Rating if reviewed */}
        {feedback && (
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-sm ${
                  star <= feedback.rating ? 'text-amber-500' : 'text-stone-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BarrierConcepts() {
  const navigate = useNavigate();
  const { concepts } = useConcepts();
  const { barriers } = useBarriers();
  const { topics } = useTopics();
  const { session, setConceptFeedback, endSession, isSaving, updateSession } = useSession();
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'reviewed' | 'not-reviewed'>('all');
  const [selectedBarrierFilters, setSelectedBarrierFilters] = useState<string[]>([]);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const selectedBarrierIds = session?.selectedBarriers || [];

  // Filter concepts to only those that address at least one selected barrier
  const relevantConcepts = useMemo(() => {
    return concepts.filter((concept) => {
      if (!concept.barrierSolutions) return false;
      return concept.barrierSolutions.some((sol) =>
        selectedBarrierIds.includes(sol.barrierId)
      );
    });
  }, [concepts, selectedBarrierIds]);

  // Apply additional filters
  const filteredConcepts = useMemo(() => {
    let result = relevantConcepts;

    // Filter by selected barrier filters (sub-filter within selected barriers)
    if (selectedBarrierFilters.length > 0) {
      result = result.filter((concept) =>
        concept.barrierSolutions?.some((sol) =>
          selectedBarrierFilters.includes(sol.barrierId)
        )
      );
    }

    // Filter by review status
    if (reviewFilter === 'reviewed') {
      result = result.filter((c) => session?.conceptFeedback?.[c.id]);
    } else if (reviewFilter === 'not-reviewed') {
      result = result.filter((c) => !session?.conceptFeedback?.[c.id]);
    }

    return result;
  }, [relevantConcepts, selectedBarrierFilters, session?.conceptFeedback, reviewFilter]);

  const toggleBarrierFilter = (barrierId: string) => {
    setSelectedBarrierFilters((prev) =>
      prev.includes(barrierId)
        ? prev.filter((id) => id !== barrierId)
        : [...prev, barrierId]
    );
  };

  const clearFilters = () => {
    setSelectedBarrierFilters([]);
    setReviewFilter('all');
  };

  const handleSaveFeedback = (feedback: ConceptFeedback) => {
    if (selectedConcept) {
      setConceptFeedback(selectedConcept.id, feedback);
    }
  };

  const handleEndSession = async () => {
    await endSession();
    navigate('/');
  };

  if (!session) {
    navigate('/');
    return null;
  }

  const selectedBarriers = barriers.filter((b) => selectedBarrierIds.includes(b.id));
  const reviewedCount = Object.keys(session.conceptFeedback || {}).length;
  const hasActiveFilters = selectedBarrierFilters.length > 0 || reviewFilter !== 'all';

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <div className="text-sm text-stone-500 mb-2">Step 3 of 3</div>
          <h1 className="text-3xl font-light text-stone-800 mb-2">
            Concepts That Address Your Barriers
          </h1>
          <p className="text-stone-600">
            These concepts specifically address the barriers you identified.
            Click each to learn how it solves your concerns.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-light text-stone-800">
            {reviewedCount} / {relevantConcepts.length}
          </div>
          <div className="text-sm text-stone-500">concepts reviewed</div>
          {isSaving && <div className="text-xs text-amber-600 mt-1">Saving...</div>}
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Add New Concept
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6 space-y-4">
        {/* Barrier Filters */}
        <div>
          <div className="text-sm font-medium text-stone-600 mb-2">Filter by Barrier:</div>
          <div className="flex flex-wrap gap-2">
            {selectedBarriers.map((barrier) => (
              <button
                key={barrier.id}
                onClick={() => toggleBarrierFilter(barrier.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  selectedBarrierFilters.includes(barrier.id)
                    ? barrierColors[barrier.color] || barrierColors.stone
                    : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                {barrier.shortDescription}
              </button>
            ))}
          </div>
        </div>

        {/* Review Status Filter */}
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-stone-600">Status:</div>
          <div className="flex gap-2">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                reviewFilter === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setReviewFilter('reviewed')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                reviewFilter === 'reviewed'
                  ? 'bg-green-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Reviewed
            </button>
            <button
              onClick={() => setReviewFilter('not-reviewed')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                reviewFilter === 'not-reviewed'
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Not Reviewed
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-sm text-amber-600 hover:text-amber-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-stone-500 mb-4">
        Showing {filteredConcepts.length} of {relevantConcepts.length} concepts that address your barriers
      </div>

      {/* Concept Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {filteredConcepts.map((concept) => (
          <BarrierConceptCard
            key={concept.id}
            concept={concept}
            feedback={session.conceptFeedback?.[concept.id]}
            barriers={barriers}
            selectedBarrierIds={selectedBarrierIds}
            onClick={() => setSelectedConcept(concept)}
          />
        ))}
      </div>

      {filteredConcepts.length === 0 && (
        <div className="text-center py-12 text-stone-500">
          No concepts match the current filters.
          <button
            onClick={clearFilters}
            className="block mx-auto mt-2 text-amber-600 hover:text-amber-700"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/barriers')}
          className="px-6 py-3 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
        >
          Back to Barriers
        </button>
        <button
          onClick={() => setShowEndConfirm(true)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Modal */}
      {selectedConcept && (
        <BarrierConceptModal
          concept={selectedConcept}
          feedback={session.conceptFeedback?.[selectedConcept.id]}
          barriers={barriers}
          selectedBarrierIds={selectedBarrierIds}
          onSave={handleSaveFeedback}
          onClose={() => setSelectedConcept(null)}
        />
      )}

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <ConfirmEndModal
          onConfirm={handleEndSession}
          onCancel={() => setShowEndConfirm(false)}
        />
      )}

      {/* Create Concept Modal */}
      {showCreateModal && (
        <ConceptCreateModal
          topics={topics}
          onSave={async (conceptData) => {
            const newSessionConcept: SessionConcept = {
              id: `session-${Date.now()}`,
              name: conceptData.name,
              tagline: conceptData.tagline,
              category: conceptData.category,
              layer: conceptData.layer,
              topics: conceptData.topics,
              details: conceptData.details,
            };
            updateSession({
              sessionConcepts: [...(session?.sessionConcepts || []), newSessionConcept],
            });
            return newSessionConcept;
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
