import { z } from 'zod';

export const atsScanRequestSchema = z.object({
  resumeId: z.string().cuid(),
  jobTitle: z.string().max(160).optional(),
  company: z.string().max(160).optional(),
  jobDescription: z.string().min(20, 'Paste the full job description').max(20000),
});

export const formattingIssueSchema = z.object({
  severity: z.enum(['info', 'warning', 'error']),
  message: z.string(),
  fix: z.string().optional(),
});

export const atsResultSchema = z.object({
  atsScore: z.number().min(0).max(100),
  keywordMatchPercent: z.number().min(0).max(100),
  matchedKeywords: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
  formattingIssues: z.array(formattingIssueSchema).default([]),
  suggestions: z.array(z.string()).default([]),
});

export type AtsScanRequest = z.infer<typeof atsScanRequestSchema>;
export type AtsResult = z.infer<typeof atsResultSchema>;
