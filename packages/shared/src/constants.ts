export const APP_NAME = 'AI Career Mentor';

export const ACCEPTED_RESUME_MIME = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
} as const;

export const MAX_RESUME_BYTES = 10 * 1024 * 1024; // 10MB

export const INTERVIEW_TYPES = ['HR', 'TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN'] as const;

export const ROADMAP_HORIZONS = [
  'THREE_MONTH',
  'SIX_MONTH',
  'TWELVE_MONTH',
  'TWENTY_FOUR_MONTH',
] as const;

export const SUBSCRIPTION_LIMITS = {
  FREE: { resumeScans: 3, atsScans: 3, interviews: 1, chatMessagesPerDay: 20 },
  PRO: { resumeScans: 100, atsScans: 100, interviews: 30, chatMessagesPerDay: 500 },
  TEAM: { resumeScans: 500, atsScans: 500, interviews: 150, chatMessagesPerDay: 2000 },
  ENTERPRISE: { resumeScans: -1, atsScans: -1, interviews: -1, chatMessagesPerDay: -1 },
} as const;

export const AI_FEATURE = {
  RESUME_PARSE: 'resume.parse',
  RESUME_SCORE: 'resume.score',
  ATS_SCAN: 'ats.scan',
  SKILL_GAP: 'skill_gap.analyze',
  JOB_MATCH: 'job.match',
  INTERVIEW_EVAL: 'interview.evaluate',
  CHAT: 'chat.reply',
  RECRUITER: 'recruiter.insights',
  ROADMAP: 'roadmap.generate',
  COVER_LETTER: 'cover_letter.generate',
} as const;
