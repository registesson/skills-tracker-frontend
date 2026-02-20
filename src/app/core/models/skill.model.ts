export enum SkillLevel {
    BEGINNER = 'BEGINNER',
    ELEMENTARY = 'ELEMENTARY',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT'
}

export enum SkillCategory {
    PROGRAMMING = 'PROGRAMMING',
    FRAMEWORK = 'FRAMEWORK',
    DATABASE = 'DATABASE',
    DEVOPS = 'DEVOPS',
    ARCHITECTURE = 'ARCHITECTURE',
    SOFT_SKILLS = 'SOFT_SKILLS',
    TOOLS = 'TOOLS',
    LANGUAGE = 'LANGUAGE',
    OTHER = 'OTHER'
  }
  
  export interface Skill {
    id: string;
    name: string;
    description?: string;
    category: SkillCategory;
    currentLevel: SkillLevel;
    targetLevel?: SkillLevel;
    createdAt: string;
    updatedAt: string;
    totalLearningSessions: number;
    totalLearningHours: number;
  }

  export interface CreateSkillRequest {
    name: string;
    description?: string;
    category: SkillCategory;
    currentLevel: SkillLevel;
    targetLevel?: SkillLevel;
  }

  export interface UpdateSkillRequest {
    name: string;
    description?: string;
    category: SkillCategory;
    currentLevel: SkillLevel;
    targetLevel?: SkillLevel;
  }

  
