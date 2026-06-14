# Build Progress & Roadmap

> This file is the running record of what's built so you never have to re-explain the project. Update it as features land.

_Last updated: 2026-06-14_

## ✅ Done (foundation + vertical slices)

### Platform / infra
- [x] Turborepo monorepo (pnpm workspaces): `apps/web`, `apps/api`, `packages/database`, `packages/shared`
- [x] Root config: `turbo.json`, `.env.example` (all keys), `.gitignore`, Prettier, `.nvmrc`
- [x] `docker-compose.yml` (Postgres+pgvector, Redis, api, web) + Dockerfiles for api & web
- [x] GitHub Actions CI (lint/typecheck/test/build/docker) + deploy workflow skeleton

### Database (`packages/database`)
- [x] **Complete Prisma schema** — every model in the spec: User/Account/Session, Profile, Subscription/Payment, Resume/ResumeVersion, Skill/UserSkill, SkillGapAnalysis, AtsScan, Job/JobMatch/JobApplication, Interview/InterviewQuestion, CoverLetter, Roadmap/RoadmapMilestone, RecruiterInsight, **MemoryEntry (pgvector)**, **AiActivity**, **Recommendation**, ProgressSnapshot, ChatConversation/ChatMessage, AiUsageRecord, AuditLog
- [x] Prisma client singleton + seed (admin + demo user + skill taxonomy)

### Shared contracts (`packages/shared`)
- [x] Zod schemas: auth, resume (parse+score), ats, skill-gap, interview, career (roadmap/cover-letter/chat/job-match)
- [x] Shared TS types + constants (limits, MIME, AI feature keys)

### Backend (`apps/api`, NestJS)
- [x] App bootstrap: Helmet, CORS allowlist, global ValidationPipe, exception filter, transform interceptor, Swagger, throttler
- [x] **Auth**: register/login/refresh (Argon2 + JWT access/refresh), JWT strategy, global `JwtAuthGuard` + `@Public()`, `RolesGuard` + `@Roles()`
- [x] **AI Gateway**: multi-provider router (Claude/OpenAI/Gemini) w/ fallback, `completeStructured` (Zod + self-repair), embeddings, usage metering; prompt library
- [x] **AI Memory Center**: upsert + pgvector semantic recall + RAG context builder
- [x] **Activity Tracker**: Timeline / Kanban / Feed
- [x] **Next Action Engine**: recommendations + `current → next → future` state
- [x] **Resume slice (canonical, end-to-end)**: upload → extract → AI parse → AI score → persist → memory → activity → recommendation
- [x] **ATS slice (end-to-end)**: scan resume vs JD → structured report → activity
- [x] Health module (`/health/live`, `/health/ready`); sample unit test

### Frontend (`apps/web`, Next.js 15 + React 19)
- [x] Design system: glassmorphism tokens, dark/light, gradient/aurora, Tailwind theme, shadcn-style `Button`/`Card`
- [x] Providers: TanStack Query, next-themes, Toaster; Zustand store; axios API client w/ refresh-on-401
- [x] **Landing page** (animated, responsive, SEO metadata)
- [x] **Auth pages** (login/register wired to API)
- [x] **Dashboard shell** (sidebar with 16 nav items, topbar, theme toggle) + dashboard home (stat cards, Recharts trend, Next Action card)
- [x] **Resume Analyzer** page — real drag-and-drop upload + result UI
- [x] All 16 routes exist; 13 feature pages scaffolded with their wired backend endpoints documented

## 🚧 Next up (build order)
1. **Backend slices** (replicate the Resume pattern): Skill Gap, Job Match, Interview (+ questions/eval), Roadmap, Cover Letter, Recruiter Insights, Chat (streaming + RAG). Modules/contracts/prompts already exist.
2. **NextAuth** wiring on web (Google/GitHub/email) sharing the JWT with the API.
3. **AWS S3** upload service (presigned URLs) + store original resume files.
4. **BullMQ** queue for long AI jobs (interview eval, roadmap) + websocket/SSE progress.
5. **Frontend feature UIs**: build out the 13 scaffolded pages against their endpoints.
6. **Resume Builder**: drag-and-drop editor + PDF/DOCX export.
7. **Mock Interview**: WebRTC voice/webcam capture + real-time eval stream.
8. **Admin dashboard**: users, subscriptions, AI cost/revenue analytics, error overview.
9. **Billing**: Stripe subscriptions + webhooks → `Subscription`/`Payment`.
10. **Testing to 90%**: Vitest (web), Jest (api), Playwright E2E; coverage gates in CI.
11. **Observability**: Sentry + LogRocket init; structured logging.

## Decisions / conventions
- Default LLM: `claude-opus-4-8`; all AI flows through `AiService` (never call SDKs directly in features).
- Every AI feature MUST: write a memory, log an activity, and (where relevant) emit a recommendation.
- Shared Zod schema validates BOTH the LLM output and the client payload — keep them in `packages/shared`.
- Demo creds (seed): `admin@aicareermentor.dev / admin12345`, `demo@aicareermentor.dev / demo12345`.
