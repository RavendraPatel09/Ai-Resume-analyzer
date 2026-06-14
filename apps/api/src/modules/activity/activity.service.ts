import { Injectable } from '@nestjs/common';
import { Prisma, ActivityType, ActivityStatus } from '@acm/database';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface LogActivityInput {
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  status?: ActivityStatus;
  input?: Prisma.InputJsonValue;
  output?: Prisma.InputJsonValue;
  confidenceScore?: number;
  entityType?: string;
  entityId?: string;
  durationMs?: number;
  errorMessage?: string;
}

/**
 * Powers the "AI Activity Timeline". Every AI action is logged here with its
 * input/output snapshot, confidence, and status, then rendered as Timeline,
 * Kanban, or Activity Feed on the frontend.
 */
@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  log(input: LogActivityInput) {
    return this.prisma.aiActivity.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        description: input.description,
        status: input.status ?? ActivityStatus.SUCCEEDED,
        input: input.input ?? {},
        output: input.output ?? {},
        confidenceScore: input.confidenceScore,
        entityType: input.entityType,
        entityId: input.entityId,
        durationMs: input.durationMs,
        errorMessage: input.errorMessage,
      },
    });
  }

  /** Chronological timeline (most recent first). */
  timeline(userId: string, take = 50) {
    return this.prisma.aiActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  /** Kanban view: activities grouped by status column. */
  async kanban(userId: string) {
    const activities = await this.prisma.aiActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    const columns: Record<ActivityStatus, typeof activities> = {
      QUEUED: [],
      RUNNING: [],
      SUCCEEDED: [],
      FAILED: [],
      CANCELED: [],
    };
    for (const a of activities) columns[a.status].push(a);
    return columns;
  }

  /** Feed grouped by day for the activity feed UI. */
  async feed(userId: string, take = 100) {
    const activities = await this.prisma.aiActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
    });
    const grouped = new Map<string, typeof activities>();
    for (const a of activities) {
      const day = a.createdAt.toISOString().slice(0, 10);
      if (!grouped.has(day)) grouped.set(day, []);
      grouped.get(day)!.push(a);
    }
    return Array.from(grouped, ([date, items]) => ({ date, items }));
  }
}
