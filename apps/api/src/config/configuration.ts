export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.API_PORT ?? 4000),
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me',
    accessTtl: Number(process.env.JWT_ACCESS_TTL ?? 900),
    refreshTtl: Number(process.env.JWT_REFRESH_TTL ?? 1209600),
  },
  ai: {
    defaultProvider: process.env.AI_DEFAULT_PROVIDER ?? 'anthropic',
    defaultModel: process.env.AI_DEFAULT_MODEL ?? 'claude-opus-4-8',
    embeddingModel: process.env.AI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
    openaiKey: process.env.OPENAI_API_KEY ?? '',
    anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
    geminiKey: process.env.GOOGLE_GENAI_API_KEY ?? '',
  },
  aws: {
    region: process.env.AWS_REGION ?? 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET ?? '',
    signedUrlTtl: Number(process.env.S3_SIGNED_URL_TTL ?? 300),
  },
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
});
