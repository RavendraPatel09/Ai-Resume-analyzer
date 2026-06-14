'use client';

import { Target } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

export default function Page() {
  return (
    <FeaturePlaceholder
      icon={Target}
      title="Skill Gap Analysis"
      description="See exactly what to learn for your target role."
      endpoint="POST /api/skill-gap/analyze"
      capabilities={[
        'Current skills vs required skills for the role',
        'Missing skills ranked by importance (1–10)',
        'Curated learning resources per skill',
        'Estimated weeks-to-ready + a personalized learning plan',
      ]}
    />
  );
}
