# Architecture

## 1. High-level

```
        ┌───────────────────────────┐         ┌──────────────────────────┐
        │   Next.js 15 (apps/web)    │         │     NestJS (apps/api)     │
        │  RSC + Client islands      │  HTTPS  │  REST /api + OpenAPI      │
        │  TanStack Query + Zustand  │ ──────▶ │  Global JWT + RBAC guards │
        │  Tailwind + shadcn + FM    │         │  Zod validation          │
        └───────────────────────────┘         └────────────┬─────────────┘
                                                            │
              ┌──────────────────────────┬─────────────────┼──────────────────┐
              ▼                          ▼                 ▼                  ▼
      ┌──────────────┐          ┌────────────────┐  ┌────────────┐   ┌──────────────┐
      │ PostgreSQL   │          │  AI Gateway     │  │  Redis     │   │   AWS S3     │
      │ + pgvector   │◀── RAG ──│ Claude/GPT/Gem  │  │ cache/queue│   │  file store  │
      │ Prisma ORM   │          │ structured+FB   │  │  BullMQ    │   │  presigned   │
      └──────────────┘          └────────────────┘  └────────────┘   └──────────────┘
```

The `packages/shared` Zod schemas are the **contract** between web and api — the same `parsedResumeSchema`, `atsResultSchema`, etc. validate LLM output on the server and type the client.

## 2. AI architecture (`apps/api/src/modules/ai`)

- **`AiService`** is the single gateway every feature calls. It provides:
  - **Provider routing + fallback:** `anthropic → openai → gemini` (configurable). If the primary provider errors, it transparently falls back.
  - **Structured output:** `completeStructured(opts, zodSchema)` forces JSON, validates against a Zod schema, and does one self-repair retry on failure. This is how parsing/scoring/ATS return typed data.
  - **Embeddings:** `embed(text)` for RAG / AI Memory similarity.
  - **Metering:** every call writes an `AiUsageRecord` (provider, model, tokens, cost, latency) powering the admin cost/revenue analytics.
- **Prompts** live in `ai/prompts.ts` — versioned, testable, and the injection point for retrieved memory (RAG).
- **Default model:** `claude-opus-4-8` (latest Claude). Swappable per-feature via `CompleteOptions.model`.

## 3. AI Memory Center + RAG (`modules/memory`)

The "most important" subsystem. `MemoryEntry` rows store a human-readable memory, structured `data`, an `importance` weight, and a **pgvector `embedding(1536)`**.

- `remember()` upserts by `(userId, key)` and embeds asynchronously.
- `recall(userId, query)` runs a cosine-distance KNN (`embedding <=> queryVec`) and falls back to importance/recency if embeddings are unavailable.
- `buildContext(userId, query)` produces the `MEMORY:` block prepended to chatbot/next-action prompts so **the user never repeats themselves**.

Every feature writes memories (e.g. the Resume slice stores score + skills), so a returning user's AI already knows what was done, what was recommended, and what's next.

## 4. Activity tracking + Next Action Engine

- **`ActivityService`** logs every AI action to `AiActivity` (type, status, input/output snapshot, confidence, duration). Rendered three ways: **Timeline**, **Kanban** (grouped by status), **Feed** (grouped by day).
- **`RecommendationService`** is the Next Action Engine: it turns analysis results into prioritized `Recommendation` rows and computes the `currentStatus → nextRecommendedStep → futureRecommendations` state shown on the dashboard.

## 5. Request lifecycle (Resume ingest — the canonical slice)

```
POST /api/resumes/upload (multipart, JWT)
  → ResumeController validates file type/size
  → ResumeService.ingest:
      extract text (pdf-parse / mammoth)
      → AiService.completeStructured(parse, parsedResumeSchema)
      → AiService.completeStructured(score, resumeScoreSchema)
      → persist Resume + sync UserSkills
      → MemoryService.remember(resume facts)
      → ActivityService.log(RESUME_SCORED)
      → RecommendationService.fromResumeScore(...)
  → TransformInterceptor wraps { success, data }
```

Replicate this exact shape for ATS (done), Skill Gap, Job Match, Interview, Roadmap, Cover Letter, Recruiter Insights, Chat.

## 6. Security

- **AuthN:** JWT access (15m) + refresh (14d), Argon2 password hashing, OAuth-ready schema (`Account`/`Session`). Global `JwtAuthGuard`; opt out with `@Public()`.
- **AuthZ:** `RolesGuard` + `@Roles(Role.ADMIN)` for RBAC (USER/ADMIN/SUPPORT).
- **Transport/app:** Helmet, strict CORS allowlist, `@nestjs/throttler` rate limiting, global `ValidationPipe` (whitelist + forbid non-whitelisted), Zod validation on bodies.
- **Injection/XSS:** Prisma parameterizes all queries (raw vector queries use tagged-template params); React escapes by default; security headers in `next.config.mjs`.
- **Auditing:** `AuditLog` for sensitive actions; `AiUsageRecord` for cost governance.

## 7. Error handling

- `AllExceptionsFilter` → consistent `{ success:false, error }` envelope; 5xx logged (Sentry hook) without leaking stacks.
- AI calls: provider fallback + structured-output self-repair + metered failures.
- Frontend: TanStack Query retries, axios refresh-on-401 interceptor, toasts, and per-feature fallback UI.

## 8. Performance

- RSC-first rendering, `optimizePackageImports`, code-split client islands, Query caching.
- Postgres indexes on every hot path (`@@index` across the schema); pgvector KNN for memory.
- Stateless API → horizontal scale behind a load balancer; Redis for cache/queues; S3 for files.
