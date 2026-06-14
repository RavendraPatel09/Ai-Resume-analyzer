import { Injectable, Logger } from '@nestjs/common';
import { Prisma, MemoryType } from '@acm/database';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AiService } from '../ai/ai.service';

export interface UpsertMemoryInput {
  userId: string;
  type: MemoryType;
  key: string;
  content: string;
  data?: Prisma.InputJsonValue;
  importance?: number;
  source?: string;
}

/**
 * AI Memory Center — long-term memory store.
 * Writes a human-readable memory + structured data + a pgvector embedding so the
 * chatbot and Next Action Engine can recall relevant context without the user
 * repeating themselves.
 */
@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  /** Idempotent upsert keyed by (userId, key). Re-embeds on content change. */
  async remember(input: UpsertMemoryInput) {
    const { userId, key, content } = input;
    const record = await this.prisma.memoryEntry.upsert({
      where: { userId_key: { userId, key } },
      create: {
        userId,
        key,
        type: input.type,
        content,
        data: input.data ?? {},
        importance: input.importance ?? 5,
        source: input.source ?? 'system',
      },
      update: {
        content,
        data: input.data ?? {},
        importance: input.importance ?? undefined,
        type: input.type,
      },
    });

    // Best-effort embedding (don't block the request if embeddings are down).
    this.embedMemory(record.id, content).catch((e) =>
      this.logger.warn(`Embedding failed for memory ${record.id}: ${e.message}`),
    );
    return record;
  }

  /** Recall the most relevant memories for a query using vector similarity. */
  async recall(userId: string, query: string, limit = 8) {
    try {
      const vector = await this.ai.embed(query);
      const literal = `[${vector.join(',')}]`;
      // Cosine distance via pgvector (<=>). Lower = closer.
      const rows = await this.prisma.$queryRaw<
        Array<{ id: string; type: string; content: string; importance: number }>
      >`
        SELECT id, type, content, importance
        FROM "MemoryEntry"
        WHERE "userId" = ${userId} AND embedding IS NOT NULL
        ORDER BY embedding <=> ${literal}::vector
        LIMIT ${limit}
      `;
      if (rows.length) {
        await this.touch(rows.map((r) => r.id));
        return rows;
      }
    } catch (e) {
      this.logger.warn(`Vector recall fell back to recency: ${(e as Error).message}`);
    }
    // Fallback: most important + recent memories.
    return this.prisma.memoryEntry.findMany({
      where: { userId },
      orderBy: [{ importance: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
      select: { id: true, type: true, content: true, importance: true },
    });
  }

  /** Build a compact MEMORY block to prepend to LLM prompts (RAG context). */
  async buildContext(userId: string, query: string): Promise<string> {
    const memories = await this.recall(userId, query);
    if (!memories.length) return '';
    return [
      'MEMORY (what you already know about this user):',
      ...memories.map((m) => `- [${m.type}] ${m.content}`),
    ].join('\n');
  }

  list(userId: string, type?: MemoryType) {
    return this.prisma.memoryEntry.findMany({
      where: { userId, ...(type ? { type } : {}) },
      orderBy: { updatedAt: 'desc' },
    });
  }

  forget(userId: string, id: string) {
    return this.prisma.memoryEntry.deleteMany({ where: { id, userId } });
  }

  private async embedMemory(id: string, content: string) {
    const vector = await this.ai.embed(content);
    const literal = `[${vector.join(',')}]`;
    await this.prisma.$executeRaw`
      UPDATE "MemoryEntry" SET embedding = ${literal}::vector WHERE id = ${id}
    `;
  }

  private touch(ids: string[]) {
    return this.prisma.memoryEntry.updateMany({
      where: { id: { in: ids } },
      data: { lastUsedAt: new Date() },
    });
  }
}
