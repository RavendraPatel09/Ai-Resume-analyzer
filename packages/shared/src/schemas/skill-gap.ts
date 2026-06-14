import { z } from 'zod';

export const skillGapRequestSchema = z.object({
  resumeId: z.string().cuid().optional(),
  targetRole: z.string().min(2).max(120),
});

export const skillGapItemSchema = z.object({
  skill: z.string(),
  importance: z.number().min(1).max(10),
  hasSkill: z.boolean(),
  resources: z
    .array(z.object({ title: z.string(), url: z.string().url().optional(), type: z.string() }))
    .default([]),
});

export const skillGapResultSchema = z.object({
  matchedSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  gaps: z.array(skillGapItemSchema).default([]),
  weeksToReady: z.number().int().min(0).optional(),
});

export type SkillGapRequest = z.infer<typeof skillGapRequestSchema>;
export type SkillGapResult = z.infer<typeof skillGapResultSchema>;
