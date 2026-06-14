import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { PrismaService } from '../../common/prisma/prisma.service';

export type AiProvider = 'anthropic' | 'openai' | 'gemini';

export interface CompleteOptions {
  system?: string;
  prompt: string;
  provider?: AiProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  feature: string; // for usage metering
  userId?: string;
}

/**
 * Central AI gateway. Every feature calls through here so we get:
 *  - provider routing + automatic fallback (Claude → OpenAI → Gemini)
 *  - structured (schema-validated) output
 *  - token/cost metering written to AiUsageRecord
 *  - one place to add caching, retries, and guardrails.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private gemini?: GoogleGenerativeAI;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const a = this.config.get<string>('ai.anthropicKey');
    const o = this.config.get<string>('ai.openaiKey');
    const g = this.config.get<string>('ai.geminiKey');
    if (a) this.anthropic = new Anthropic({ apiKey: a });
    if (o) this.openai = new OpenAI({ apiKey: o });
    if (g) this.gemini = new GoogleGenerativeAI(g);
  }

  /** Free-form text completion with provider fallback. */
  async complete(opts: CompleteOptions): Promise<string> {
    const order = this.providerOrder(opts.provider);
    let lastErr: unknown;
    for (const provider of order) {
      const started = Date.now();
      try {
        const { text, tokensIn, tokensOut } = await this.callProvider(provider, opts);
        await this.meter({
          provider,
          model: opts.model ?? this.defaultModel(provider),
          feature: opts.feature,
          userId: opts.userId,
          tokensIn,
          tokensOut,
          latencyMs: Date.now() - started,
          success: true,
        });
        return text;
      } catch (err) {
        lastErr = err;
        this.logger.warn(`Provider ${provider} failed: ${(err as Error).message}. Falling back.`);
      }
    }
    throw new ServiceUnavailableException(
      `All AI providers failed: ${(lastErr as Error)?.message ?? 'unknown'}`,
    );
  }

  /**
   * Structured completion: forces JSON, validates against a zod schema, and
   * retries once with a repair prompt if validation fails.
   */
  async completeStructured<T>(opts: CompleteOptions, schema: z.ZodSchema<T>): Promise<T> {
    const jsonInstruction =
      '\n\nRespond with ONLY valid minified JSON matching the requested schema. No prose, no markdown fences.';
    const raw = await this.complete({ ...opts, prompt: opts.prompt + jsonInstruction });
    const parsed = this.tryParse(raw);
    const result = schema.safeParse(parsed);
    if (result.success) return result.data;

    // One repair attempt.
    const repair = await this.complete({
      ...opts,
      prompt: `Your previous output failed validation: ${result.error.message}\nFix it and return ONLY valid JSON.\nPrevious output:\n${raw}`,
    });
    return schema.parse(this.tryParse(repair));
  }

  /** Generate an embedding vector for RAG / AI Memory similarity search. */
  async embed(text: string): Promise<number[]> {
    if (!this.openai) throw new ServiceUnavailableException('Embeddings require OPENAI_API_KEY');
    const res = await this.openai.embeddings.create({
      model: this.config.get<string>('ai.embeddingModel')!,
      input: text.slice(0, 8000),
    });
    return res.data[0].embedding;
  }

  // --- internals ---

  private providerOrder(preferred?: AiProvider): AiProvider[] {
    const def = (preferred ?? this.config.get<AiProvider>('ai.defaultProvider')) as AiProvider;
    const all: AiProvider[] = ['anthropic', 'openai', 'gemini'];
    return [def, ...all.filter((p) => p !== def)].filter((p) => this.available(p));
  }

  private available(p: AiProvider) {
    return (p === 'anthropic' && this.anthropic) ||
      (p === 'openai' && this.openai) ||
      (p === 'gemini' && this.gemini)
      ? true
      : false;
  }

  private defaultModel(provider: AiProvider) {
    if (provider === 'anthropic') return this.config.get<string>('ai.defaultModel')!;
    if (provider === 'openai') return 'gpt-4o';
    return 'gemini-1.5-pro';
  }

  private async callProvider(provider: AiProvider, opts: CompleteOptions) {
    const model = opts.model ?? this.defaultModel(provider);
    const maxTokens = opts.maxTokens ?? 2048;

    if (provider === 'anthropic') {
      const res = await this.anthropic!.messages.create({
        model,
        max_tokens: maxTokens,
        temperature: opts.temperature ?? 0.4,
        system: opts.system,
        messages: [{ role: 'user', content: opts.prompt }],
      });
      const text = res.content.filter((c) => c.type === 'text').map((c: any) => c.text).join('');
      return { text, tokensIn: res.usage.input_tokens, tokensOut: res.usage.output_tokens };
    }

    if (provider === 'openai') {
      const res = await this.openai!.chat.completions.create({
        model,
        temperature: opts.temperature ?? 0.4,
        max_tokens: maxTokens,
        messages: [
          ...(opts.system ? [{ role: 'system' as const, content: opts.system }] : []),
          { role: 'user' as const, content: opts.prompt },
        ],
      });
      return {
        text: res.choices[0]?.message?.content ?? '',
        tokensIn: res.usage?.prompt_tokens ?? 0,
        tokensOut: res.usage?.completion_tokens ?? 0,
      };
    }

    // gemini
    const gModel = this.gemini!.getGenerativeModel({ model });
    const res = await gModel.generateContent(
      [opts.system, opts.prompt].filter(Boolean).join('\n\n'),
    );
    return {
      text: res.response.text(),
      tokensIn: res.response.usageMetadata?.promptTokenCount ?? 0,
      tokensOut: res.response.usageMetadata?.candidatesTokenCount ?? 0,
    };
  }

  private tryParse(raw: string): unknown {
    const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
      throw new Error('AI did not return parseable JSON');
    }
  }

  private async meter(data: {
    provider: string;
    model: string;
    feature: string;
    userId?: string;
    tokensIn: number;
    tokensOut: number;
    latencyMs: number;
    success: boolean;
  }) {
    try {
      await this.prisma.aiUsageRecord.create({
        data: { ...data, costCents: this.estimateCostCents(data) },
      });
    } catch (e) {
      this.logger.error('Failed to record AI usage', e as Error);
    }
  }

  /** Rough cost estimate; tune per real provider pricing. */
  private estimateCostCents(d: { tokensIn: number; tokensOut: number }) {
    return (d.tokensIn / 1000) * 0.3 + (d.tokensOut / 1000) * 1.5;
  }
}
