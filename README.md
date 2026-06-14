# AI Career Mentor

Production-grade AI SaaS that helps people land their next role: resume analysis, ATS optimization, skill-gap detection, job matching, AI mock interviews, a 24/7 mentor chatbot with long-term memory, recruiter insights, career roadmaps, a resume builder, and a cover-letter generator.

> **Status:** Foundation / vertical-slice scaffold. The architecture, database schema, design system, auth, AI gateway, and several end-to-end features (Resume Analyzer, ATS, Memory, Activity, Recommendations) are implemented. The remaining feature pages are scaffolded with their backend contracts wired. See [`PROGRESS.md`](./PROGRESS.md) for the exact done/remaining breakdown.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind, shadcn-style UI, Framer Motion, TanStack Query, Zustand |
| Backend | NestJS 10, Node 20, REST + OpenAPI |
| Database | PostgreSQL 16 + **pgvector**, Prisma ORM |
| AI | Claude (default), OpenAI GPT, Gemini — unified gateway with fallback, structured output, RAG via pgvector |
| Auth | JWT (access+refresh) + Argon2, OAuth-ready (Google/GitHub), NextAuth-compatible schema |
| Infra | Docker / docker-compose, Turborepo, GitHub Actions CI, Vercel (web) + container (API) |
| Monitoring | Sentry + LogRocket hooks |

## Monorepo layout

```
.
├── apps/
│   ├── api/        # NestJS backend (modules, AI gateway, auth, RBAC)
│   └── web/        # Next.js 15 frontend (16 pages, design system)
├── packages/
│   ├── database/   # Prisma schema + client + seed (the single source of truth)
│   └── shared/     # Zod contracts + shared types used by web AND api
├── docker-compose.yml
├── turbo.json
└── .github/workflows/   # CI + deploy
```

## Quick start

```bash
# 0) Prereqs: Node 20+, pnpm 9+, Docker
corepack enable && corepack prepare pnpm@9.12.0 --activate

# 1) Install
pnpm install

# 2) Env
cp .env.example .env        # fill in AI keys + secrets

# 3) Infra (Postgres+pgvector, Redis)
pnpm docker:up              # or: docker compose up -d postgres redis

# 4) Database
pnpm db:generate
pnpm db:migrate
pnpm db:seed                # admin@aicareermentor.dev / admin12345

# 5) Run everything (web :3000, api :4000)
pnpm dev
```

- Web → http://localhost:3000
- API docs (Swagger) → http://localhost:4000/api/docs
- Prisma Studio → `pnpm db:studio`

## Key docs

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system design, AI/RAG, memory, security
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — Docker, Vercel, AWS, migrations
- [`PROGRESS.md`](./PROGRESS.md) — what's built, what's next (resume-driven roadmap)

## License

Proprietary — © AI Career Mentor.
