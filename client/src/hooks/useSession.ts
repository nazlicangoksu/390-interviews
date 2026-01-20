import { useState, useCallback, useEffect, useRef } from 'react';
import type { Session, ConceptFeedback, Idea } from '../types';

const STORAGE_KEY = 'ciit_current_session';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedRef = useRef<string>('');

  // Load session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSession(parsed);
      } catch (e) {
        console.error('Failed to parse saved session:', e);
      }
    }
  }, []);

  // Auto-save to localStorage whenever session changes
  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, [session]);

  // Auto-save to server every 30 seconds
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(async () => {
      const currentJson = JSON.stringify(session);
      if (currentJson !== lastSavedRef.current) {
        await saveToServer(session);
        lastSavedRef.current = currentJson;
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [session]);

  const saveToServer = async (sessionData: Session) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sessions/${sessionData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      if (!response.ok) throw new Error('Failed to save session');
    } catch (e) {
      console.error('Failed to save to server:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const createSession = useCallback(async (data: Partial<Session>) => {
    setIsLoading(true);
    try {
      const newSession: Session = {
        id: `session-${Date.now()}`,
        participantId: data.participantId || '',
        participantName: data.participantName,
        participantRole: data.participantRole || '',
        organizationType: data.organizationType || '',
        referralSource: data.referralSource,
        consentGiven: data.consentGiven || false,
        startTime: new Date().toISOString(),
        selectedTopics: [],
        customTopics: [],
        conceptFeedback: {},
        newIdeas: [],
        notes: '',
      };

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });

      if (!response.ok) throw new Error('Failed to create session');

      const created = await response.json();
      setSession(created);
      lastSavedRef.current = JSON.stringify(created);
      return created;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSession = useCallback((updates: Partial<Session>) => {
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  }, []);

  const setTopics = useCallback((topics: string[], customTopics: string[] = []) => {
    updateSession({ selectedTopics: topics, customTopics });
  }, [updateSession]);

  const setConceptFeedback = useCallback((conceptId: string, feedback: ConceptFeedback) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        conceptFeedback: {
          ...prev.conceptFeedback,
          [conceptId]: feedback,
        },
      };
    });
  }, []);

  const addIdea = useCallback((idea: Omit<Idea, 'id' | 'timestamp'>) => {
    const newIdea: Idea = {
      ...idea,
      id: `idea-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        newIdeas: [...prev.newIdeas, newIdea],
      };
    });
  }, []);

  const endSession = useCallback(async () => {
    if (!session) return;
    const endedSession = { ...session, endTime: new Date().toISOString() };
    setSession(endedSession);
    await saveToServer(endedSession);
    localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  const clearSession = useCallback(() => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
    lastSavedRef.current = '';
  }, []);

  const exportSession = useCallback(() => {
    if (!session) return;
    const dataStr = JSON.stringify(session, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${session.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [session]);

  return {
    session,
    isLoading,
    isSaving,
    createSession,
    updateSession,
    setTopics,
    setConceptFeedback,
    addIdea,
    endSession,
    clearSession,
    exportSession,
  };
}
