import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessions } from '../hooks/useData';

export default function Dashboard() {
  const navigate = useNavigate();
  const { sessions, isLoading, deleteSession } = useSessions();
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredSessions = sessions.filter((session) => {
    if (filter === 'completed') return session.endTime;
    if (filter === 'in-progress') return !session.endTime;
    return true;
  });

  const completedCount = sessions.filter((s) => s.endTime).length;
  const inProgressCount = sessions.filter((s) => !s.endTime).length;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-light text-stone-800 mb-2">
          Climate Investment Interview Tool
        </h1>
        <p className="text-stone-500">
          Stanford GSB Independent Research - January 2026
        </p>
      </header>

      <div className="mb-8">
        <button
          onClick={() => navigate('/welcome')}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Start New Interview
        </button>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-stone-700">
            Past Sessions
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All ({sessions.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'in-progress'
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-stone-500">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="text-stone-500">No sessions yet. Start your first interview!</p>
        ) : filteredSessions.length === 0 ? (
          <p className="text-stone-500">No {filter === 'completed' ? 'completed' : 'in-progress'} sessions found.</p>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between hover:border-stone-300 transition-colors"
              >
                <div>
                  <p className="font-medium text-stone-800">
                    {session.participantId || 'Anonymous'}
                    {session.participantName && ` - ${session.participantName}`}
                  </p>
                  <p className="text-sm text-stone-500">
                    {session.participantRole} • {session.organizationType}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    {formatDate(session.startTime)}
                    {session.endTime && ' - Completed'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500 mr-4">
                    {Object.keys(session.conceptFeedback || {}).length} concepts •{' '}
                    {session.sessionConcepts?.length || 0} session concepts
                  </span>
                  <button
                    onClick={() => navigate(`/summary/${session.id}`)}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this session?')) {
                        deleteSession(session.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-600 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
