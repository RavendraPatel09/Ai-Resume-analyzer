import { z } from 'zod';
import { INTERVIEW_TYPES } from '../constants';

export const startInterviewSchema = z.object({
  type: z.enum(INTERVIEW_TYPES),
  role: z.string().max(120).optional(),
  hasVoice: z.boolean().default(false),
  hasWebcam: z.boolean().default(false),
});

export const submitAnswerSchema = z.object({
  questionId: z.string().cuid(),
  answerText: z.string().min(1).max(20000),
  answerAudioUrl: z.string().url().optional(),
});

export const interviewEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  idealAnswer: z.string().optional(),
});

export const interviewReportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  technicalScore: z.number().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
  summary: z.string(),
});

export type StartInterviewInput = z.infer<typeof startInterviewSchema>;
export type InterviewReport = z.infer<typeof interviewReportSchema>;
