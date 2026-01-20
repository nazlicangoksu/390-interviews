export interface Topic {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Barrier {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  color: string;
}

export interface BarrierSolution {
  barrierId: string;
  explanation: string;
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
  barrierSolutions?: BarrierSolution[];
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
  hasInvestedInClimate?: boolean;
  selectedTopics: string[];
  customTopics: string[];
  selectedBarriers?: string[];
  customBarriers?: string[];
  conceptFeedback: Record<string, ConceptFeedback>;
  newIdeas: Idea[];
  notes: string;
}
