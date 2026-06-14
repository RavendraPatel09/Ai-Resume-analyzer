/** Generic API envelope returned by every backend endpoint. */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Result of resume parsing returned to the client. */
export interface ParsedResume {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: string[];
}

export interface EducationItem {
  institution: string;
  degree?: string;
  field?: string;
  startYear?: number;
  endYear?: number;
}

export interface ExperienceItem {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

export interface ProjectItem {
  name: string;
  description?: string;
  technologies: string[];
}

export interface ResumeScore {
  overall: number;
  breakdown: { content: number; formatting: number; impact: number; keywords: number };
  weakAreas: string[];
  recommendations: string[];
}

/** Next Action Engine output. */
export interface NextActionState {
  currentStatus: string;
  nextRecommendedStep: { title: string; actionType: string; rationale: string };
  futureRecommendations: string[];
}
