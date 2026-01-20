import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBarriers } from '../hooks/useData';
import { useSession } from '../hooks/useSession';

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

export default function Barriers() {
  const navigate = useNavigate();
  const { barriers, isLoading } = useBarriers();
  const { session, setBarriers } = useSession();
  const [selectedBarriers, setSelectedBarriers] = useState<string[]>(
    session?.selectedBarriers || []
  );
  const [customBarrier, setCustomBarrier] = useState('');
  const [customBarriers, setCustomBarriers] = useState<string[]>(
    session?.customBarriers || []
  );

  const toggleBarrier = (barrierId: string) => {
    setSelectedBarriers((prev) =>
      prev.includes(barrierId)
        ? prev.filter((id) => id !== barrierId)
        : [...prev, barrierId]
    );
  };

  const addCustomBarrier = () => {
    if (customBarrier.trim() && !customBarriers.includes(customBarrier.trim())) {
      setCustomBarriers([...customBarriers, customBarrier.trim()]);
      setCustomBarrier('');
    }
  };

  const removeCustomBarrier = (barrier: string) => {
    setCustomBarriers(customBarriers.filter((b) => b !== barrier));
  };

  const handleContinue = () => {
    setBarriers(selectedBarriers, customBarriers);
    navigate('/barrier-concepts');
  };

  if (!session) {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <header className="mb-8">
        <div className="text-sm text-stone-500 mb-2">Step 2 of 3</div>
        <h1 className="text-3xl font-light text-stone-800 mb-2">
          What's holding you back?
        </h1>
        <p className="text-stone-600">
          Select the barriers that resonate most with why you haven't invested in climate yet.
        </p>
      </header>

      {isLoading ? (
        <p className="text-stone-500">Loading barriers...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {barriers.map((barrier) => (
            <button
              key={barrier.id}
              onClick={() => toggleBarrier(barrier.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedBarriers.includes(barrier.id)
                  ? `${barrierColors[barrier.color] || barrierColors.stone} border-current`
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <p className="font-medium">{barrier.name}</p>
              <p className="text-sm opacity-75">{barrier.shortDescription}</p>
            </button>
          ))}
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-medium text-stone-700 mb-3">
          Add Custom Barriers (Optional)
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={customBarrier}
            onChange={(e) => setCustomBarrier(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomBarrier()}
            placeholder="Enter a barrier not listed above"
            className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            onClick={addCustomBarrier}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 rounded-lg text-stone-700 transition-colors"
          >
            Add
          </button>
        </div>
        {customBarriers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customBarriers.map((barrier) => (
              <span
                key={barrier}
                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm"
              >
                {barrier}
                <button
                  onClick={() => removeCustomBarrier(barrier)}
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
          onClick={() => navigate('/investment-check')}
          className="px-6 py-3 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={selectedBarriers.length === 0 && customBarriers.length === 0}
          className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          See Concepts That Address These Barriers
        </button>
      </div>
    </div>
  );
}
