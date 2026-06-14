'use client';

import { TrendingUp } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

export default function Page() {
  return (
    <FeaturePlaceholder
      icon={TrendingUp}
      title="Progress Tracker"
      description="Track your growth across every metric."
      endpoint="GET /api/progress · GET /api/activity/timeline"
      capabilities={[
        'Resume, ATS & interview score trends',
        'Learning progress and skills mastered',
        'Job-match rate over time',
        'AI Activity Timeline · Kanban · Feed',
      ]}
    />
  );
}
