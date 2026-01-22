import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

// Generate participant ID based on PT date
function generateParticipantId(): string {
  const now = new Date();
  // Convert to PT (Pacific Time)
  const ptDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const month = String(ptDate.getMonth() + 1).padStart(2, '0');
  const day = String(ptDate.getDate()).padStart(2, '0');
  const hours = String(ptDate.getHours()).padStart(2, '0');
  const minutes = String(ptDate.getMinutes()).padStart(2, '0');
  return `P${month}${day}-${hours}${minutes}`;
}

export default function Welcome() {
  const navigate = useNavigate();
  const { createSession } = useSession();
  const [formData, setFormData] = useState({
    participantName: '',
    participantRole: '',
    organizationType: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSession({
        ...formData,
        participantId: generateParticipantId(),
        consentGiven: true,
      });
      navigate('/notes');
    } catch (err) {
      console.error('Failed to create session:', err);
      alert('Failed to create session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-light text-stone-800 mb-4">
          Welcome to the Climate Investment Study
        </h1>
        <p className="text-stone-600 text-lg">
          Thank you for participating in this Stanford GSB research project exploring
          climate investment preferences among family offices and high-net-worth individuals.
        </p>
      </header>

      <div className="bg-stone-100 rounded-xl p-6 mb-8">
        <h2 className="font-medium text-stone-700 mb-2">About This Session</h2>
        <p className="text-stone-600 text-sm">
          We'll explore a series of innovative climate investment concepts together.
          There are no right or wrong answers—we're interested in your genuine reactions,
          concerns, and ideas. The session typically takes 45-60 minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Name (Optional)
          </label>
          <input
            type="text"
            placeholder="First name only"
            value={formData.participantName}
            onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Role *
          </label>
          <select
            required
            value={formData.participantRole}
            onChange={(e) => setFormData({ ...formData, participantRole: e.target.value })}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Select your role</option>
            <option value="Family Office CIO">Family Office CIO</option>
            <option value="Foundation Director">Foundation Director</option>
            <option value="HNWI Investor">HNWI Investor</option>
            <option value="Wealth Advisor">Wealth Advisor</option>
            <option value="Investment Manager">Investment Manager</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Organization Type *
          </label>
          <select
            required
            value={formData.organizationType}
            onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Select organization type</option>
            <option value="Single Family Office">Single Family Office</option>
            <option value="Multi-Family Office">Multi-Family Office</option>
            <option value="Private Foundation">Private Foundation</option>
            <option value="Wealth Management Firm">Wealth Management Firm</option>
            <option value="Individual Investor">Individual Investor</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            {isSubmitting ? 'Starting...' : 'Begin Interview'}
          </button>
        </div>
      </form>
    </div>
  );
}
