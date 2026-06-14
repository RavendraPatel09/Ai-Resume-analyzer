# Deployment Guide

## Environments

| Env | Web | API | DB |
|---|---|---|---|
| Local | `pnpm dev` :3000 | :4000 | docker compose (pg+pgvector, redis) |
| Production | Vercel | Container (ECS/Fly/Render/K8s) | Managed Postgres w/ pgvector (RDS, Neon, Supabase) + managed Redis |

## 1. Local (Docker)

```bash
cp .env.example .env
docker compose up -d            # postgres, redis, api, web
# or infra-only while running pnpm dev:
docker compose up -d postgres redis
pnpm db:migrate && pnpm db:seed
```

## 2. Database (production)

- Provision Postgres 16 with the `vector` extension enabled.
- Use a pooler (PgBouncer / Neon pooled URL) for `DATABASE_URL`; set `DIRECT_URL` to the direct connection for migrations.
- Apply migrations on release: `pnpm --filter @acm/database migrate:deploy`.
- Create the pgvector index after first migrate for fast recall:
  ```sql
  CREATE INDEX IF NOT EXISTS memory_embedding_idx
    ON "MemoryEntry" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
  ```

## 3. Web → Vercel

- Import the repo, set **Root Directory** to `apps/web`.
- Build command: `cd ../.. && pnpm --filter @acm/web build`; install: `pnpm install`.
- Env: `NEXT_PUBLIC_API_URL`, `NEXTAUTH_*`, OAuth client IDs, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_LOGROCKET_ID`.

## 4. API → Container

```bash
docker build -f apps/api/Dockerfile -t <registry>/acm-api:<tag> .
docker push <registry>/acm-api:<tag>
# run with env_file=.env, expose 4000, health: /health/ready
```

Deploy on ECS Fargate / Fly.io / Render / Kubernetes. Put it behind an ALB/Ingress with TLS. Scale horizontally (stateless). Point `CORS_ORIGINS` at the Vercel domain.

## 5. Secrets

Store in the platform secret manager (Vercel Encrypted Env, AWS Secrets Manager). Required: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENAI_API_KEY`, AWS S3 creds, `STRIPE_*`, `SENTRY_DSN`.

## 6. CI/CD

- `.github/workflows/ci.yml` — install → prisma generate → lint → typecheck → test → build → docker build (on `main`).
- `.github/workflows/deploy.yml` — on `v*` tag: deploy web (Vercel) + push API image + `migrate:deploy`. Fill in the registry/Vercel secrets.

## 7. Monitoring & rollback

- Sentry (web + api), LogRocket (web). Health checks: `/health/live`, `/health/ready`.
- Rollback: redeploy previous image tag; Prisma migrations are additive — use a down migration or restore from PITR snapshot if needed.
