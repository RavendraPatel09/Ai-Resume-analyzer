import { PrismaClient, Role, SubscriptionTier } from '@prisma/client';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient();

// NOTE: dev-only weak hash placeholder. The API hashes with argon2 in real auth.
function devHash(pw: string) {
  return 'dev$' + createHash('sha256').update(pw).digest('hex');
}

const CANONICAL_SKILLS = [
  ['JavaScript', 'Programming'],
  ['TypeScript', 'Programming'],
  ['Python', 'Programming'],
  ['React', 'Frontend'],
  ['Next.js', 'Frontend'],
  ['Node.js', 'Backend'],
  ['NestJS', 'Backend'],
  ['PostgreSQL', 'Database'],
  ['AWS', 'Cloud'],
  ['Docker', 'DevOps'],
  ['Kubernetes', 'DevOps'],
  ['System Design', 'Architecture'],
  ['Communication', 'Soft Skill'],
  ['Leadership', 'Soft Skill'],
];

async function main() {
  console.log('🌱 Seeding AI Career Mentor...');

  // Skills taxonomy
  for (const [name, category] of CANONICAL_SKILLS) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await prisma.skill.upsert({
      where: { slug },
      update: {},
      create: { name, slug, category },
    });
  }

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aicareermentor.dev' },
    update: {},
    create: {
      email: 'admin@aicareermentor.dev',
      name: 'Platform Admin',
      role: Role.ADMIN,
      passwordHash: devHash('admin12345'),
      emailVerified: new Date(),
      subscription: { create: { tier: SubscriptionTier.ENTERPRISE } },
      profile: { create: { headline: 'Administrator' } },
    },
  });

  // Demo user
  const demo = await prisma.user.upsert({
    where: { email: 'demo@aicareermentor.dev' },
    update: {},
    create: {
      email: 'demo@aicareermentor.dev',
      name: 'Demo User',
      role: Role.USER,
      passwordHash: devHash('demo12345'),
      emailVerified: new Date(),
      subscription: { create: { tier: SubscriptionTier.PRO } },
      profile: {
        create: {
          headline: 'Aspiring Backend Engineer',
          currentRole: 'Junior Developer',
          desiredRole: 'Backend Developer',
          yearsExperience: 2,
          careerGoals: ['Become a senior backend engineer', 'Master system design'],
        },
      },
    },
  });

  console.log(`✅ Seeded admin=${admin.email} demo=${demo.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
