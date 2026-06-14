import { Injectable } from '@nestjs/common';
import {
  RecommendationStatus,
  RecommendationPriority,
  ActivityType,
} from '@acm/database';
import type { ResumeScoreDto, NextActionState } from '@acm/shared';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

/**
 * Next Action Engine. Turns analysis results into prioritized, actionable
 * recommendations and computes the "current status → next step → future" state
 * that proactively guides the user.
 */
@Injectable()
export class RecommendationService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
  ) {}

  list(userId: string, status?: RecommendationStatus) {
    return this.prisma.recommendation.findMany({
      where: { userId, ...(status ? { status } : {}) },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(input: {
    userId: string;
    title: string;
    rationale?: string;
    actionType: string;
    actionPayload?: object;
    priority?: RecommendationPriority;
    nextStepHint?: string;
    confidence?: number;
  }) {
    const rec = await this.prisma.recommendation.create({
      data: {
        userId: input.userId,
        title: input.title,
        rationale: input.rationale,
        actionType: input.actionType,
        actionPayload: input.actionPayload ?? {},
        priority: input.priority ?? RecommendationPriority.MEDIUM,
        nextStepHint: input.nextStepHint,
        confidence: input.confidence,
      },
    });
    await this.activity.log({
      userId: input.userId,
      type: ActivityType.RECOMMENDATION_ISSUED,
      title: `New recommendation: ${input.title}`,
      entityType: 'recommendation',
      entityId: rec.id,
      confidenceScore: input.confidence,
    });
    return rec;
  }

  /** Derive a recommendation from a fresh resume score (weakest dimension). */
  async fromResumeScore(userId: string, resumeId: string, score: ResumeScoreDto) {
    const weakest = Object.entries(score.breakdown).sort((a, b) => a[1] - b[1])[0];
    const [dimension] = weakest;
    return this.create({
      userId,
      title: `Improve your resume's ${dimension}`,
      rationale: score.weakAreas[0] ?? `Your ${dimension} score is the lowest area.`,
      actionType: 'improve_resume',
      actionPayload: { resumeId, dimension },
      priority: score.overall < 60 ? RecommendationPriority.HIGH : RecommendationPriority.MEDIUM,
      nextStepHint:
        score.overall >= 75
          ? 'After this, run an ATS scan against a target job and start applying.'
          : 'After this, re-run the analysis to confirm your score improved.',
      confidence: 0.85,
    });
  }

  async complete(userId: string, id: string) {
    await this.prisma.recommendation.updateMany({
      where: { id, userId },
      data: { status: RecommendationStatus.COMPLETED, completedAt: new Date() },
    });
    return { id, status: RecommendationStatus.COMPLETED };
  }

  async dismiss(userId: string, id: string) {
    await this.prisma.recommendation.updateMany({
      where: { id, userId },
      data: { status: RecommendationStatus.DISMISSED },
    });
    return { id, status: RecommendationStatus.DISMISSED };
  }

  /** Current Status → Next Recommended Step → Future Recommendations. */
  async nextActionState(userId: string): Promise<NextActionState> {
    const [latestResume, pending] = await Promise.all([
      this.prisma.resume.findFirst({
        where: { userId, status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.recommendation.findMany({
        where: { userId, status: RecommendationStatus.PENDING },
        orderBy: { priority: 'desc' },
        take: 4,
      }),
    ]);

    const currentStatus = latestResume?.score
      ? `Resume Score: ${latestResume.score}%`
      : 'No resume analyzed yet';

    const top = pending[0];
    return {
      currentStatus,
      nextRecommendedStep: top
        ? { title: top.title, actionType: top.actionType, rationale: top.rationale ?? '' }
        : {
            title: 'Upload and analyze your resume',
            actionType: 'upload_resume',
            rationale: 'This unlocks personalized guidance across the platform.',
          },
      futureRecommendations: pending.slice(1).map((r) => r.title),
    };
  }
}
