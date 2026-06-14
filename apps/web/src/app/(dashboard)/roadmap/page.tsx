'use client';

import { Map } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

export default function Page() {
  return (
    <FeaturePlaceholder
      icon={Map}
      title="Career Roadmap"
      description="Visual 3 / 6 / 12 / 24-month plans."
      endpoint="POST /api/roadmap/generate"
      capabilities={[
        'Milestone-based plans across four horizons',
        'Skills, certifications & projects per milestone',
        'Interview prep checkpoints',
        'Visual roadmap with progress tracking',
      ]}
    />
  );
}
