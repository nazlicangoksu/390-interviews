import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConcepts, useTopics } from '../hooks/useData';
import { useSession } from '../hooks/useSession';
import ConceptCard from '../components/ConceptCard';
import ConceptModal from '../components/ConceptModal';
import ConceptEditModal from '../components/ConceptEditModal';
import ConceptCreateModal from '../components/ConceptCreateModal';
import type { Concept, ConceptFeedback } from '../types';

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

const topicColors: Record<string, string> = {
  green: 'bg-green-100 text-green-700 border-green-300',
  blue: 'bg-blue-100 text-blue-700 border-blue-300',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  lime: 'bg-lime-100 text-lime-700 border-lime-300',
  slate: 'bg-slate-100 text-slate-700 border-slate-300',
  orange: 'bg-orange-100 text-orange-700 border-orange-300',
  stone: 'bg-stone-100 text-stone-700 border-stone-300',
  purple: 'bg-purple-100 text-purple-700 border-purple-300',
};

export default function Concepts() {
  const navigate = useNavigate();
  const { concepts, updateConceptTopics, updateConcept, uploadConceptImage, refetchConcepts, createConcept } = useConcepts();
  const { topics } = useTopics();
  const { session, setConceptFeedback, endSession, isSaving } = useSession();
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [editingConcept, setEditingConcept] = useState<Concept | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'reviewed' | 'not-reviewed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicFilters, setSelectedTopicFilters] = useState<string[]>([]);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const toggleTopicFilter = (topicId: string) => {
    setSelectedTopicFilters((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTopicFilters([]);
    setReviewFilter('all');
  };

  // Filter concepts based on all criteria
  const filteredConcepts = useMemo(() => {
    let result = concepts;

    // Filter by keyword search (name or tagline)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (concept) =>
          concept.name.toLowerCase().includes(query) ||
          concept.tagline.toLowerCase().includes(query)
      );
    }

    // Filter by selected topic filters
    if (selectedTopicFilters.length > 0) {
      result = result.filter((concept) =>
        concept.topics.some((t) => selectedTopicFilters.includes(t))
      );
    }

    // Filter by review status
    if (reviewFilter === 'reviewed') {
      result = result.filter((c) => session?.conceptFeedback?.[c.id]);
    } else if (reviewFilter === 'not-reviewed') {
      result = result.filter((c) => !session?.conceptFeedback?.[c.id]);
    }

    return result;
  }, [concepts, searchQuery, selectedTopicFilters, session?.conceptFeedback, reviewFilter]);

  const handleSaveFeedback = (feedback: ConceptFeedback) => {
    if (selectedConcept) {
      setConceptFeedback(selectedConcept.id, feedback);
    }
  };

  const handleAddTopic = async (conceptId: string, topicId: string) => {
    const concept = concepts.find((c) => c.id === conceptId);
    if (concept) {
      const newTopics = [...concept.topics, topicId];
      await updateConceptTopics(conceptId, newTopics);
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

  const reviewedCount = Object.keys(session.conceptFeedback || {}).length;
  const totalCount = filteredConcepts.length;
  const hasActiveFilters = searchQuery || selectedTopicFilters.length > 0 || reviewFilter !== 'all';

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-light text-stone-800 mb-2">
            Explore Investment Concepts
          </h1>
          <p className="text-stone-600">
            Click on each concept to learn more and share your reactions.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-light text-stone-800">
            {reviewedCount} / {concepts.length}
          </div>
          <div className="text-sm text-stone-500">concepts reviewed</div>
          {isSaving && <div className="text-xs text-amber-600 mt-1">Saving...</div>}
        </div>
      </header>

      {/* Search & Filters */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6 space-y-4">
        {/* Keyword Search */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or tagline..."
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Topic Filters */}
        <div>
          <div className="text-sm font-medium text-stone-600 mb-2">Filter by Topic:</div>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => toggleTopicFilter(topic.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  selectedTopicFilters.includes(topic.id)
                    ? topicColors[topic.color] || topicColors.stone
                    : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                {topic.name}
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

      {/* Results count and Add button */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-stone-500">
          Showing {totalCount} of {concepts.length} concepts
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Add New Concept
        </button>
      </div>

      {/* Concept Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {filteredConcepts.map((concept) => (
          <ConceptCard
            key={concept.id}
            concept={concept}
            feedback={session.conceptFeedback?.[concept.id]}
            topics={topics}
            onClick={() => setSelectedConcept(concept)}
            onEdit={() => setEditingConcept(concept)}
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
          onClick={() => navigate('/topics')}
          className="px-6 py-3 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
        >
          Back to Topics
        </button>
        <button
          onClick={() => setShowEndConfirm(true)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          End Session
        </button>
      </div>

      {/* View Modal */}
      {selectedConcept && (
        <ConceptModal
          concept={selectedConcept}
          feedback={session.conceptFeedback?.[selectedConcept.id]}
          topics={topics}
          onSave={handleSaveFeedback}
          onAddTopic={handleAddTopic}
          onClose={() => setSelectedConcept(null)}
        />
      )}

      {/* Edit Modal */}
      {editingConcept && (
        <ConceptEditModal
          concept={editingConcept}
          topics={topics}
          onSave={async (concept) => {
            const result = await updateConcept(concept.id, concept);
            await refetchConcepts();
            return result;
          }}
          onUploadImage={uploadConceptImage}
          onClose={() => setEditingConcept(null)}
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
            const result = await createConcept(conceptData);
            if (result) {
              await refetchConcepts();
            }
            return result;
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
