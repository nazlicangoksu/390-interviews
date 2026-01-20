import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConcepts, useTopics } from '../hooks/useData';
import type { Session } from '../types';

export default function Summary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { concepts } = useConcepts();
  const { topics } = useTopics();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    fetch(`/api/sessions/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Session not found');
        return res.json();
      })
      .then((data) => {
        setSession(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [id, navigate]);

  const exportSession = () => {
    if (!session) return;
    const dataStr = JSON.stringify(session, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${session.participantId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <p className="text-stone-500">Loading session...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <p className="text-red-500 mb-4">{error || 'Session not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="text-amber-600 hover:text-amber-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const reviewedConcepts = Object.entries(session.conceptFeedback || {});
  const selectedTopicNames = session.selectedTopics
    .map((tid) => topics.find((t) => t.id === tid)?.name || tid)
    .join(', ');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-amber-600 hover:text-amber-700 text-sm mb-4 inline-block"
        >
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-light text-stone-800 mb-2">
          Session Summary
        </h1>
        <p className="text-stone-500">
          {session.participantId}
          {session.participantName && ` - ${session.participantName}`}
          <span className="mx-2">•</span>
          {formatDate(session.startTime)}
        </p>
      </header>

      {/* Session Info */}
      <section className="bg-stone-100 rounded-xl p-6 mb-8">
        <h2 className="font-medium text-stone-800 mb-3">Session Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-stone-500">Participant ID:</span>{' '}
            <span className="text-stone-800">{session.participantId}</span>
          </div>
          {session.participantName && (
            <div>
              <span className="text-stone-500">Name:</span>{' '}
              <span className="text-stone-800">{session.participantName}</span>
            </div>
          )}
          <div>
            <span className="text-stone-500">Role:</span>{' '}
            <span className="text-stone-800">{session.participantRole}</span>
          </div>
          <div>
            <span className="text-stone-500">Organization:</span>{' '}
            <span className="text-stone-800">{session.organizationType}</span>
          </div>
          <div>
            <span className="text-stone-500">Topics:</span>{' '}
            <span className="text-stone-800">{selectedTopicNames || 'None selected'}</span>
          </div>
          <div>
            <span className="text-stone-500">Status:</span>{' '}
            <span className={session.endTime ? 'text-green-600' : 'text-amber-600'}>
              {session.endTime ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-3xl font-light text-stone-800">
            {session.selectedTopics.length}
          </div>
          <div className="text-sm text-stone-500">Topics Selected</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-3xl font-light text-stone-800">
            {reviewedConcepts.length}
          </div>
          <div className="text-sm text-stone-500">Concepts Reviewed</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <div className="text-3xl font-light text-stone-800">
            {session.newIdeas?.length || 0}
          </div>
          <div className="text-sm text-stone-500">Ideas Captured</div>
        </div>
      </div>

      {/* Concept Feedback */}
      {reviewedConcepts.length > 0 && (
        <section className="mb-8">
          <h2 className="font-medium text-stone-800 mb-4">Concept Feedback</h2>
          <div className="space-y-3">
            {reviewedConcepts.map(([conceptId, feedback]) => {
              const concept = concepts.find((c) => c.id === conceptId);
              if (!concept) return null;
              return (
                <div
                  key={conceptId}
                  className="bg-white border border-stone-200 rounded-xl p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-stone-800">{concept.name}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= feedback.rating ? 'text-amber-500' : 'text-stone-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {feedback.notes && (
                    <p className="text-sm text-stone-600 mb-2">
                      <span className="font-medium">Reactions:</span> {feedback.notes}
                    </p>
                  )}
                  {feedback.modifications && (
                    <p className="text-sm text-stone-600">
                      <span className="font-medium">Modifications:</span> {feedback.modifications}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Ideas */}
      {session.newIdeas && session.newIdeas.length > 0 && (
        <section className="mb-8">
          <h2 className="font-medium text-stone-800 mb-4">Captured Ideas</h2>
          <div className="space-y-3">
            {session.newIdeas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white border border-stone-200 rounded-xl p-4"
              >
                <p className="font-medium text-stone-800">{idea.title}</p>
                {idea.description && (
                  <p className="text-sm text-stone-600 mt-1">{idea.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
        >
          Back to Dashboard
        </button>
        <button
          onClick={exportSession}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
        >
          Export JSON
        </button>
      </div>
    </div>
  );
}
