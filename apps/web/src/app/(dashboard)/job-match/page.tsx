'use client';

import { Briefcase } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

export default function Page() {
  return (
    <FeaturePlaceholder
      icon={Briefcase}
      title="Job Match Engine"
      description="Find roles that fit your profile."
      endpoint="POST /api/job-match"
      capabilities={[
        'Compatibility score and match % per job',
        'Salary range estimates',
        'Strengths and weaknesses vs each role',
        'Missing qualifications to close',
      ]}
    />
  );
}
