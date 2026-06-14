import { z } from 'zod';

export const educationItemSchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  field: z.string().optional(),
  startYear: z.number().int().optional(),
  endYear: z.number().int().optional(),
});

export const experienceItemSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const projectItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  technologies: z.array(z.string()).default([]),
});

/** Schema the LLM must conform to when parsing a resume (structured output). */
export const parsedResumeSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).default([]),
  education: z.array(educationItemSchema).default([]),
  experience: z.array(experienceItemSchema).default([]),
  projects: z.array(projectItemSchema).default([]),
  certifications: z.array(z.string()).default([]),
});

export const resumeScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  breakdown: z.object({
    content: z.number().min(0).max(100),
    formatting: z.number().min(0).max(100),
    impact: z.number().min(0).max(100),
    keywords: z.number().min(0).max(100),
  }),
  weakAreas: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
});

export const createResumeSchema = z.object({
  title: z.string().min(1).max(120).default('Untitled Resume'),
});

export type ParsedResumeDto = z.infer<typeof parsedResumeSchema>;
export type ResumeScoreDto = z.infer<typeof resumeScoreSchema>;
