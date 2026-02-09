export type ParticipantGroup = 'investor' | 'scientist' | 'policy';

export interface SynthesisStats {
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
  byGroup: Record<ParticipantGroup, number>;
  byOrganizationType: Record<string, number>;
  byRole: Record<string, number>;
  dateRange: { earliest: string; latest: string };
}

export interface ConceptRanking {
  conceptId: string;
  conceptName: string;
  timesReviewed: number;
  averageRating: number;
  ratingsDistribution: number[]; // [count_of_1, count_of_2, ..., count_of_5]
  reviewerGroups: Record<ParticipantGroup, number>;
  sampleNotes: string[];
  sampleModifications: string[];
}

export interface BarrierFrequency {
  barrierId: string;
  barrierName: string;
  count: number;
  byGroup: Record<ParticipantGroup, number>;
  byOrganizationType: Record<string, number>;
}

export interface TopicFrequency {
  topicId: string;
  topicName: string;
  count: number;
  byGroup: Record<ParticipantGroup, number>;
}

export interface CustomItemFrequency {
  text: string;
  count: number;
  sessions: string[];
}

export interface TriangulationSignal {
  mentionCount: number;
  averageConceptRating: number;
  selectedCount: number;
  strength: 'none' | 'low' | 'medium' | 'high';
}

export interface TriangulationCell {
  topicId: string;
  topicName: string;
  investor: TriangulationSignal;
  scientist: TriangulationSignal;
  policy: TriangulationSignal;
  alignmentScore: number;
}

export interface SynthesisAggregate {
  stats: SynthesisStats;
  conceptRankings: ConceptRanking[];
  barrierFrequencies: BarrierFrequency[];
  customBarriers: CustomItemFrequency[];
  topicFrequencies: TopicFrequency[];
  customTopics: CustomItemFrequency[];
  triangulationMatrix: TriangulationCell[];
}

export interface AIAnalysisRequest {
  type: 'thematic' | 'concept-synthesis' | 'decision-framework'
    | 'triangulation' | 'key-quotes' | 'paper-section';
  params?: {
    conceptId?: string;
    participantGroup?: ParticipantGroup;
    paperSection?: 1 | 2 | 3 | 4 | 5;
    sessionIds?: string[];
  };
}

export interface AIAnalysisResult {
  id: string;
  type: AIAnalysisRequest['type'];
  params?: AIAnalysisRequest['params'];
  content: string;
  generatedAt: string;
  sessionCount: number;
  cached: boolean;
}

export interface SynthesisFilters {
  groups: ParticipantGroup[];
  completed: 'all' | 'completed' | 'in-progress';
  from?: string;
  to?: string;
}
