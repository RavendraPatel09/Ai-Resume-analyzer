import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivityType } from '@acm/database';
import { atsResultSchema, AI_FEATURE, type AtsScanRequest } from '@acm/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ActivityService } from '../activity/activity.service';
import { ATS_SYSTEM, atsPrompt } from '../ai/prompts';

@Injectable()
export class AtsService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private activity: ActivityService,
  ) {}

  list(userId: string) {
    return this.prisma.atsScan.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async scan(userId: string, dto: AtsScanRequest) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: dto.resumeId, userId },
    });
    if (!resume) throw new NotFoundException('Resume not found');

    const result = await this.ai.completeStructured(
      {
        system: ATS_SYSTEM,
        prompt: atsPrompt(resume.rawText ?? '', dto.jobDescription),
        feature: AI_FEATURE.ATS_SCAN,
        userId,
      },
      atsResultSchema,
    );

    const scan = await this.prisma.atsScan.create({
      data: {
        userId,
        resumeId: dto.resumeId,
        jobTitle: dto.jobTitle,
        company: dto.company,
        jobDescription: dto.jobDescription,
        atsScore: result.atsScore,
        keywordMatchPercent: result.keywordMatchPercent,
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        formattingIssues: result.formattingIssues,
        suggestions: result.suggestions,
        report: result as object,
      },
    });

    await this.activity.log({
      userId,
      type: ActivityType.ATS_SCAN_COMPLETED,
      title: `ATS scan vs ${dto.jobTitle ?? 'job description'}`,
      description: `ATS score ${result.atsScore}/100, ${result.keywordMatchPercent}% keyword match`,
      confidenceScore: 0.88,
      entityType: 'atsScan',
      entityId: scan.id,
      output: { atsScore: result.atsScore, missing: result.missingKeywords.length },
    });

    return scan;
  }
}
