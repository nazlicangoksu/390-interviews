import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

export default function InvestmentCheck() {
  const navigate = useNavigate();
  const { session, setInvestmentStatus } = useSession();

  const handleChoice = (hasInvested: boolean) => {
    setInvestmentStatus(hasInvested);
    if (hasInvested) {
      navigate('/topics');
    } else {
      navigate('/barriers');
    }
  };

  if (!session) {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <header className="mb-8 text-center">
        <div className="text-sm text-stone-500 mb-2">Step 1 of 3</div>
        <h1 className="text-3xl font-light text-stone-800 mb-4">
          Have you already invested in climate?
        </h1>
        <p className="text-stone-600">
          This helps us tailor the session to your experience level.
        </p>
      </header>

      <div className="space-y-4">
        <button
          onClick={() => handleChoice(true)}
          className="w-full p-6 rounded-xl border-2 border-stone-200 hover:border-green-400 hover:bg-green-50 text-left transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl group-hover:bg-green-200 transition-colors">
              <span role="img" aria-label="checkmark">&#10003;</span>
            </div>
            <div>
              <p className="font-medium text-lg text-stone-800">
                Yes, I've made climate investments
              </p>
              <p className="text-stone-500 text-sm">
                I'll explore concepts organized by climate themes
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleChoice(false)}
          className="w-full p-6 rounded-xl border-2 border-stone-200 hover:border-amber-400 hover:bg-amber-50 text-left transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl group-hover:bg-amber-200 transition-colors">
              <span role="img" aria-label="thinking">?</span>
            </div>
            <div>
              <p className="font-medium text-lg text-stone-800">
                Not yet
              </p>
              <p className="text-stone-500 text-sm">
                I'll explore what's been holding me back and see concepts that address those barriers
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-8">
        <button
          onClick={() => navigate('/welcome')}
          className="px-6 py-3 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
