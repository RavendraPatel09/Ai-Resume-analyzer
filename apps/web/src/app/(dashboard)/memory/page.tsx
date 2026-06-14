'use client';

import { Brain } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

export default function Page() {
  return (
    <FeaturePlaceholder
      icon={Brain}
      title="AI Memory Center"
      description="Everything the AI remembers about you."
      endpoint="GET /api/memory · GET /api/memory/recall"
      capabilities={[
        'Profile, skills, goals, resumes & interview results',
        'Past recommendations & learning progress',
        'pgvector-backed semantic recall (RAG)',
        'You stay in control — review and forget any memory',
      ]}
    />
  );
}
