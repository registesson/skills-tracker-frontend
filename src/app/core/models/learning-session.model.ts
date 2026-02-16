export interface LearningSession {
    id: string;
    skillId: string;
    skillName: string;
    sessionDate: string;
    durationMinutes: number;
    notes?: string;
    resourcesUsed?: string;
    createdAt: string;
  }
  
  export interface CreateLearningSessionRequest {
    skillId: string;
    sessionDate: string;
    durationMinutes: number;
    notes?: string;
    resourcesUsed?: string;
  }