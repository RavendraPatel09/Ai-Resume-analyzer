'use client';

import { Eye } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

export default function Page() {
  return (
    <FeaturePlaceholder
      icon={Eye}
      title="Recruiter Insights"
      description="See yourself the way recruiters do."
      endpoint="POST /api/recruiter-insights"
      capabilities={[
        'Recruiter-side perspective on your profile',
        'Market demand & hiring trends for your target role',
        'Salary trends and benchmarks',
        'Honest resume weaknesses to fix first',
      ]}
    />
  );
}
