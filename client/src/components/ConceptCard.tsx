import type { Concept, ConceptFeedback, Topic } from '../types';

interface ConceptCardProps {
  concept: Concept;
  feedback?: ConceptFeedback;
  topics: Topic[];
  onClick: () => void;
  onEdit?: () => void;
}

const topicColors: Record<string, string> = {
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  lime: 'bg-lime-50 text-lime-600',
  slate: 'bg-slate-50 text-slate-600',
  orange: 'bg-orange-50 text-orange-600',
  stone: 'bg-stone-50 text-stone-600',
  purple: 'bg-purple-50 text-purple-600',
};

export default function ConceptCard({ concept, feedback, topics, onClick, onEdit }: ConceptCardProps) {
  const hasFeedback = feedback && (feedback.rating > 0 || feedback.notes || feedback.modifications);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border-2 overflow-hidden text-left transition-all hover:shadow-lg cursor-pointer relative group ${
        hasFeedback ? 'border-green-400' : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      {/* Edit Button */}
      {onEdit && (
        <button
          onClick={handleEditClick}
          className="absolute top-2 right-2 z-10 p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          title="Edit concept"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-stone-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      )}
      <div className="h-40 bg-stone-100 overflow-hidden">
        <img
          src={`/images/concepts/${concept.image}`}
          alt={concept.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/concepts/placeholder.png';
          }}
        />
      </div>
      <div className="p-4">
        <div className="text-xs text-stone-400 mb-1">{concept.category}</div>
        <h3 className="font-medium text-stone-800 mb-1 line-clamp-1">{concept.name}</h3>
        <p className="text-sm text-stone-500 line-clamp-2 mb-2">{concept.tagline}</p>

        {/* Topic tags */}
        <div className="flex flex-wrap gap-1">
          {concept.topics.slice(0, 3).map((topicId) => {
            const topic = topics.find((t) => t.id === topicId);
            if (!topic) return null;
            return (
              <span
                key={topicId}
                className={`text-[10px] px-1.5 py-0.5 rounded ${topicColors[topic.color] || topicColors.stone}`}
              >
                {topic.name}
              </span>
            );
          })}
          {concept.topics.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
              +{concept.topics.length - 3}
            </span>
          )}
        </div>

        {hasFeedback && (
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-sm ${star <= (feedback?.rating || 0) ? 'text-amber-500' : 'text-stone-300'}`}
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
