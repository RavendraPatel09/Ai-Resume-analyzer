import { Test } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import type { ResumeScoreDto } from '@acm/shared';

describe('RecommendationService', () => {
  let service: RecommendationService;
  const prisma = {
    recommendation: { create: jest.fn().mockResolvedValue({ id: 'rec_1' }) },
  };
  const activity = { log: jest.fn().mockResolvedValue({}) };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RecommendationService,
        { provide: PrismaService, useValue: prisma },
        { provide: ActivityService, useValue: activity },
      ],
    }).compile();
    service = moduleRef.get(RecommendationService);
    jest.clearAllMocks();
  });

  it('targets the weakest resume dimension and flags HIGH priority for low scores', async () => {
    const score: ResumeScoreDto = {
      overall: 55,
      breakdown: { content: 80, formatting: 70, impact: 40, keywords: 65 },
      weakAreas: ['Impact statements are vague'],
      recommendations: [],
    };

    await service.fromResumeScore('user_1', 'resume_1', score);

    expect(prisma.recommendation.create).toHaveBeenCalledTimes(1);
    const arg = prisma.recommendation.create.mock.calls[0][0].data;
    expect(arg.title).toContain('impact');
    expect(arg.priority).toBe('HIGH');
    expect(activity.log).toHaveBeenCalled();
  });
});
