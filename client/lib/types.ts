/**
 * TypeScript types for UmukoziHR Resume Tailor v1.3
 */

// v1.3 Profile Schema

export interface Basics {
  full_name: string;
  headline: string;
  summary: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  links: string[];
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
  keywords: string[];
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  start: string; // YYYY-MM format
  end: string; // YYYY-MM or "present"
  employment_type: string;
  bullets: string[];
}

export interface Education {
  school: string;
  degree: string;
  start: string;
  end: string;
  gpa: string | null;
}

export interface Project {
  name: string;
  url: string;
  stack: string[];
  bullets: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface Award {
  name: string;
  by: string;
  date: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface Preferences {
  regions: ('US' | 'EU' | 'GL')[];
  templates: string[];
}

export interface ProfileV3 {
  basics: Basics;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
  languages: Language[];
  preferences: Preferences;
  version?: number;
  updated_at?: string;
}

// API Response types

export interface ProfileResponse {
  profile: ProfileV3;
  version: number;
  completeness: number;
  updated_at: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  version: number;
  completeness: number;
  message: string;
}

export interface CompletenessResponse {
  completeness: number;
  breakdown: {
    basics: number;
    experience: number;
    education: number;
    projects: number;
    skills: number;
    links: number;
  };
  missing_fields: string[];
}

export interface JDFetchResponse {
  success: boolean;
  jd_text?: string;
  company?: string;
  title?: string;
  region?: string;
  message: string;
}

export interface HistoryItem {
  run_id: string;
  job_id: string;
  company: string;
  title: string;
  region: string;
  status: string;
  profile_version?: number;
  artifacts_urls: {
    resume_pdf?: string;
    cover_letter_pdf?: string;
    resume_tex?: string;
    cover_letter_tex?: string;
    [key: string]: any;
  };
  created_at: string;
}

export interface HistoryResponse {
  runs: HistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

// Helper function to create empty profile
export const createEmptyProfile = (): ProfileV3 => ({
  basics: {
    full_name: '',
    headline: '',
    summary: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    links: []
  },
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  awards: [],
  languages: [],
  preferences: {
    regions: ['US'],
    templates: ['minimal']
  }
});
