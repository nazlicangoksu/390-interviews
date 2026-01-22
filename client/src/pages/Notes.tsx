import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

export default function Notes() {
  const navigate = useNavigate();
  const { session, updateSession, isLoading } = useSession();
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!session) {
      navigate('/');
      return;
    }
    setNotes(session.notes || '');
  }, [session, navigate, isLoading]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const saveNotes = async () => {
    setIsSaving(true);
    updateSession({ notes });
    // Small delay to show saving state
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsSaving(false);
  };

  const handleContinue = async () => {
    await saveNotes();
    navigate('/investment-check');
  };

  if (isLoading || !session) return null;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-light text-stone-800 mb-2">
          Interview Notes
        </h1>
        <p className="text-stone-600">
          Use this space to capture any initial observations, context about the participant,
          or notes you want to reference throughout the interview.
        </p>
      </header>

      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block font-medium text-stone-700">
            Running Notes
          </label>
          {isSaving && (
            <span className="text-xs text-amber-600">Saving...</span>
          )}
        </div>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          onBlur={saveNotes}
          rows={12}
          placeholder="Enter any notes here... These will be saved with the session and visible in the summary."
          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y"
        />
        <p className="text-xs text-stone-400 mt-2">
          Notes auto-save when you click away. You can also access and edit these notes from the session summary.
        </p>
      </div>

      <div className="bg-stone-100 rounded-xl p-4 mb-8">
        <h3 className="font-medium text-stone-700 mb-2">Session Info</h3>
        <div className="text-sm text-stone-600 space-y-1">
          <p><span className="text-stone-500">Participant:</span> {session.participantId}{session.participantName && ` - ${session.participantName}`}</p>
          <p><span className="text-stone-500">Role:</span> {session.participantRole}</p>
          <p><span className="text-stone-500">Organization:</span> {session.organizationType}</p>
        </div>
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
          Continue to Interview
        </button>
      </div>
    </div>
  );
}
