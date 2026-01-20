export interface Topic {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface ConceptDetail {
  title: string;
  description: string;
}

export interface Concept {
  id: string;
  name: string;
  tagline: string;
  category: string;
  layer: string;
  image: string;
  topics: string[];
  details: ConceptDetail[];
}

export interface ConceptFeedback {
  rating: number;
  notes: string;
  modifications: string;
  timestamp: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  relatedConceptId?: string;
  timestamp: string;
}

export interface Session {
  id: string;
  participantId: string;
  participantName?: string;
  participantRole: string;
  organizationType: string;
  referralSource?: string;
  consentGiven: boolean;
  startTime: string;
  endTime?: string;
  selectedTopics: string[];
  customTopics: string[];
  conceptFeedback: Record<string, ConceptFeedback>;
  newIdeas: Idea[];
  notes: string;
}
