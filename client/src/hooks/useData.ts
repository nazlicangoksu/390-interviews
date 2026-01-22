import { useState, useEffect } from 'react';
import type { Topic, Concept, Session, Barrier } from '../types';

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/topics')
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return { topics, isLoading, error };
}

export function useBarriers() {
  const [barriers, setBarriers] = useState<Barrier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/barriers')
      .then((res) => res.json())
      .then((data) => {
        setBarriers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return { barriers, isLoading, error };
}

export function useConcepts() {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/concepts')
      .then((res) => res.json())
      .then((data) => {
        setConcepts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const updateConceptTopics = async (conceptId: string, topics: string[]) => {
    try {
      const res = await fetch(`/api/concepts/${conceptId}/topics`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics }),
      });
      if (res.ok) {
        const updated = await res.json();
        setConcepts((prev) =>
          prev.map((c) => (c.id === conceptId ? updated.concept : c))
        );
      }
    } catch (err) {
      console.error('Failed to update concept topics:', err);
    }
  };

  const updateConcept = async (conceptId: string, conceptData: Concept) => {
    try {
      const res = await fetch(`/api/concepts/${conceptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conceptData),
      });
      if (res.ok) {
        const updated = await res.json();
        setConcepts((prev) =>
          prev.map((c) => (c.id === conceptId ? updated.concept : c))
        );
        return updated.concept;
      }
      return null;
    } catch (err) {
      console.error('Failed to update concept:', err);
      return null;
    }
  };

  const uploadConceptImage = async (conceptId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`/api/concepts/${conceptId}/image`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setConcepts((prev) =>
          prev.map((c) => (c.id === conceptId ? updated.concept : c))
        );
        return updated.image;
      }
      return null;
    } catch (err) {
      console.error('Failed to upload concept image:', err);
      return null;
    }
  };

  const refetchConcepts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/concepts');
      const data = await res.json();
      setConcepts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createConcept = async (conceptData: Omit<Concept, 'id' | 'image'> & { id?: string; image?: string }) => {
    try {
      // Generate ID from name if not provided
      const id = conceptData.id || conceptData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newConcept = { ...conceptData, id, image: conceptData.image || '' };

      const res = await fetch('/api/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConcept),
      });
      if (res.ok) {
        const data = await res.json();
        setConcepts((prev) => [...prev, data.concept]);
        return data.concept;
      }
      return null;
    } catch (err) {
      console.error('Failed to create concept:', err);
      return null;
    }
  };

  return { concepts, isLoading, error, updateConceptTopics, updateConcept, uploadConceptImage, refetchConcepts, createConcept };
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setSessions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const deleteSession = async (id: string) => {
    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  return { sessions, isLoading, error, refetch: fetchSessions, deleteSession };
}
