export interface LearningSession {
    id: string;
    skill: string;
    date: string;
    duration: number;
    notes?: string;
    resources?: string;
    totalDuration: number;
  }
  
  export interface CreateLearningSessionRequest {
    skillId: string;
    sessionDate: string;
    durationMinutes: number;
    notes?: string;
    resourcesUsed?: string;
  }