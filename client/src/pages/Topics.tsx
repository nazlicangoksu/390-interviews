import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTopics } from '../hooks/useData';
import { useSession } from '../hooks/useSession';

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

export default function Topics() {
  const navigate = useNavigate();
  const { topics, isLoading } = useTopics();
  const { session, setTopics } = useSession();
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    session?.selectedTopics || []
  );
  const [customTopic, setCustomTopic] = useState('');
  const [customTopics, setCustomTopics] = useState<string[]>(
    session?.customTopics || []
  );

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const addCustomTopic = () => {
    if (customTopic.trim() && !customTopics.includes(customTopic.trim())) {
      setCustomTopics([...customTopics, customTopic.trim()]);
      setCustomTopic('');
    }
  };

  const removeCustomTopic = (topic: string) => {
    setCustomTopics(customTopics.filter((t) => t !== topic));
  };

  const handleContinue = () => {
    setTopics(selectedTopics, customTopics);
    navigate('/concepts');
  };

  if (!session) {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <header className="mb-8">
        <div className="text-sm text-stone-500 mb-2">Step 1 of 3</div>
        <h1 className="text-3xl font-light text-stone-800 mb-2">
          Select Topics of Interest
        </h1>
        <p className="text-stone-600">
          Which climate investment areas are you most interested in exploring?
          Select all that apply.
        </p>
      </header>

      {isLoading ? (
        <p className="text-stone-500">Loading topics...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedTopics.includes(topic.id)
                  ? `${topicColors[topic.color] || topicColors.stone} border-current`
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <p className="font-medium">{topic.name}</p>
              <p className="text-sm opacity-75">{topic.description}</p>
            </button>
          ))}
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-medium text-stone-700 mb-3">
          Add Custom Topics (Optional)
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomTopic()}
            placeholder="Enter a topic not listed above"
            className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            onClick={addCustomTopic}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 rounded-lg text-stone-700 transition-colors"
          >
            Add
          </button>
        </div>
        {customTopics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customTopics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm"
              >
                {topic}
                <button
                  onClick={() => removeCustomTopic(topic)}
                  className="hover:text-amber-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate('/welcome')}
          className="px-6 py-3 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Continue to Concepts
        </button>
      </div>
    </div>
  );
}
