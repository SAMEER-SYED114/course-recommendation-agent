export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  category: CourseCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[]; // course IDs
  skillsTaught: string[];
  duration: string;
  tags: string[];
}

export type CourseCategory = 
  | 'foundation'
  | 'programming'
  | 'web-development'
  | 'data-science'
  | 'ai-ml'
  | 'devops';

export interface StudentProfile {
  id: string;
  name: string;
  background: string;
  goals: string;
  knownSkills: string[];
  preferredCategory?: CourseCategory;
}

export interface RecommendedCourse {
  courseId: string;
  course: Course;
  rationale: string;
  order: number;
  phase: string;
  skillsGained: string[];
}

export interface LearningPath {
  profile: StudentProfile;
  courses: RecommendedCourse[];
  overallRationale: string;
  estimatedDuration: string;
  generatedAt: string;
  method: 'ai' | 'rule-based';
}

export interface AgentConfig {
  provider: 'openai' | 'groq';
  apiKey: string;
  model: string;
}

export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  'foundation': 'Foundation',
  'programming': 'Programming',
  'web-development': 'Web Development',
  'data-science': 'Data Science',
  'ai-ml': 'AI & Machine Learning',
  'devops': 'DevOps & Cloud',
};

export const CATEGORY_COLORS: Record<CourseCategory, string> = {
  'foundation': 'bg-slate-100 text-slate-700 border-slate-300',
  'programming': 'bg-blue-50 text-blue-700 border-blue-300',
  'web-development': 'bg-emerald-50 text-emerald-700 border-emerald-300',
  'data-science': 'bg-purple-50 text-purple-700 border-purple-300',
  'ai-ml': 'bg-rose-50 text-rose-700 border-rose-300',
  'devops': 'bg-amber-50 text-amber-700 border-amber-300',
};

export const CATEGORY_DOT_COLORS: Record<CourseCategory, string> = {
  'foundation': 'bg-slate-500',
  'programming': 'bg-blue-500',
  'web-development': 'bg-emerald-500',
  'data-science': 'bg-purple-500',
  'ai-ml': 'bg-rose-500',
  'devops': 'bg-amber-500',
};

export const CATEGORY_ACCENT: Record<CourseCategory, string> = {
  'foundation': 'border-slate-400',
  'programming': 'border-blue-400',
  'web-development': 'border-emerald-400',
  'data-science': 'border-purple-400',
  'ai-ml': 'border-rose-400',
  'devops': 'border-amber-400',
};

export const DIFFICULTY_LABELS = {
  beginner: { label: 'Beginner', color: 'bg-green-100 text-green-700' },
  intermediate: { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: 'Advanced', color: 'bg-red-100 text-red-700' },
};
