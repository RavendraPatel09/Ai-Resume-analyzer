import { z } from 'zod';
import { ROADMAP_HORIZONS } from '../constants';

export const roadmapRequestSchema = z.object({
  targetRole: z.string().min(2).max(120),
  horizon: z.enum(ROADMAP_HORIZONS),
});

export const coverLetterRequestSchema = z.object({
  resumeId: z.string().cuid().optional(),
  jobTitle: z.string().max(160).optional(),
  company: z.string().max(160).optional(),
  jobDescription: z.string().min(20).max(20000),
  tone: z.enum(['PROFESSIONAL', 'PERSONALIZED', 'ATS_FRIENDLY']).default('PROFESSIONAL'),
});

export const chatMessageSchema = z.object({
  conversationId: z.string().cuid().optional(),
  message: z.string().min(1).max(8000),
});

export const jobMatchRequestSchema = z.object({
  resumeId: z.string().cuid(),
  jobDescription: z.string().min(20).max(20000).optional(),
});

export type RoadmapRequest = z.infer<typeof roadmapRequestSchema>;
export type CoverLetterRequest = z.infer<typeof coverLetterRequestSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
