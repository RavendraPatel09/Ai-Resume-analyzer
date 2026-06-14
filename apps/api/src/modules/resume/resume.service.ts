import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ProcessingStatus, FileType, ActivityType, MemoryType } from '@acm/database';
import {
  parsedResumeSchema,
  resumeScoreSchema,
  AI_FEATURE,
  type ParsedResumeDto,
} from '@acm/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { MemoryService } from '../memory/memory.service';
import { ActivityService } from '../activity/activity.service';
import { RecommendationService } from '../recommendation/recommendation.service';
import {
  RESUME_PARSE_SYSTEM,
  resumeParsePrompt,
  RESUME_SCORE_SYSTEM,
  resumeScorePrompt,
} from '../ai/prompts';
import { extractText } from './text-extractor';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private memory: MemoryService,
    private activity: ActivityService,
    private recommendations: RecommendationService,
  ) {}

  list(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(userId: string, id: string) {
    const resume = await this.prisma.resume.findFirst({ where: { id, userId } });
    if (!resume) throw new NotFoundException('Resume not found');
    return resume;
  }

  /**
   * Full ingest pipeline: extract text → AI parse → AI score → persist →
   * write memory → log activity → generate next-action recommendation.
   */
  async ingest(params: {
    userId: string;
    title: string;
    buffer: Buffer;
    mimeType: string;
    fileUrl?: string;
  }) {
    const { userId, title, buffer, mimeType, fileUrl } = params;
    const fileType = this.mapFileType(mimeType);

    const resume = await this.prisma.resume.create({
      data: { userId, title, fileType, fileUrl, status: ProcessingStatus.PROCESSING },
    });

    const started = Date.now();
    try {
      const rawText = await extractText(buffer, mimeType);

      const parsed = await this.ai.completeStructured<ParsedResumeDto>(
        {
          system: RESUME_PARSE_SYSTEM,
          prompt: resumeParsePrompt(rawText),
          feature: AI_FEATURE.RESUME_PARSE,
          userId,
        },
        parsedResumeSchema,
      );

      const score = await this.ai.completeStructured(
        {
          system: RESUME_SCORE_SYSTEM,
          prompt: resumeScorePrompt(rawText),
          feature: AI_FEATURE.RESUME_SCORE,
          userId,
        },
        resumeScoreSchema,
      );

      const updated = await this.prisma.resume.update({
        where: { id: resume.id },
        data: {
          status: ProcessingStatus.COMPLETED,
          rawText,
          fullName: parsed.fullName,
          email: parsed.email,
          phone: parsed.phone,
          location: parsed.location,
          summary: parsed.summary,
          parsed: parsed as object,
          score: score.overall,
          scoreBreakdown: score.breakdown,
          weakAreas: score.weakAreas,
          recommendations: score.recommendations,
        },
      });

      await this.syncSkills(userId, resume.id, parsed.skills);

      // AI Memory: persist the durable facts.
      await this.memory.remember({
        userId,
        type: MemoryType.RESUME,
        key: `resume:${resume.id}`,
        content: `Resume "${title}" scored ${score.overall}/100. Skills: ${parsed.skills.slice(0, 15).join(', ')}. Weak areas: ${score.weakAreas.join('; ')}.`,
        data: { resumeId: resume.id, score: score.overall, skills: parsed.skills },
        importance: 8,
        source: 'resume',
      });

      // Activity timeline entry.
      await this.activity.log({
        userId,
        type: ActivityType.RESUME_SCORED,
        title: `Analyzed resume "${title}"`,
        description: `Score ${score.overall}/100`,
        confidenceScore: 0.9,
        entityType: 'resume',
        entityId: resume.id,
        durationMs: Date.now() - started,
        input: { title, fileType },
        output: { score: score.overall, weakAreas: score.weakAreas },
      });

      // Next Action Engine: produce a recommendation from the weakest area.
      await this.recommendations.fromResumeScore(userId, resume.id, score);

      return updated;
    } catch (err) {
      this.logger.error(`Resume ingest failed for ${resume.id}`, (err as Error).stack);
      await this.prisma.resume.update({
        where: { id: resume.id },
        data: { status: ProcessingStatus.FAILED },
      });
      await this.activity.log({
        userId,
        type: ActivityType.RESUME_PARSED,
        title: `Failed to analyze "${title}"`,
        status: 'FAILED',
        errorMessage: (err as Error).message,
        entityType: 'resume',
        entityId: resume.id,
      });
      throw err;
    }
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.prisma.resume.delete({ where: { id } });
    return { id };
  }

  private async syncSkills(userId: string, resumeId: string, skills: string[]) {
    for (const name of skills.slice(0, 50)) {
      const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      if (!slug) continue;
      const skill = await this.prisma.skill.upsert({
        where: { slug },
        update: {},
        create: { name: name.trim(), slug },
      });
      await this.prisma.userSkill.upsert({
        where: { userId_skillId: { userId, skillId: skill.id } },
        update: { resumeId },
        create: { userId, skillId: skill.id, resumeId, source: 'resume' },
      });
    }
  }

  private mapFileType(mime: string): FileType {
    if (mime.includes('pdf')) return FileType.PDF;
    if (mime.includes('word') || mime.includes('officedocument')) return FileType.DOCX;
    return FileType.TXT;
  }
}
