'use client';

import { Settings } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

export default function Page() {
  return (
    <FeaturePlaceholder
      icon={Settings}
      title="Settings"
      description="Account, security & preferences."
      endpoint="GET/PATCH /api/users/me"
      capabilities={[
        'Profile & career preferences',
        'Connected accounts (Google, GitHub)',
        'Theme, notifications & data export',
        'Subscription & billing management',
      ]}
    />
  );
}
