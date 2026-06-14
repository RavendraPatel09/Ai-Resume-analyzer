'use client';

import { ShieldCheck } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

export default function Page() {
  return (
    <FeaturePlaceholder
      icon={ShieldCheck}
      title="Admin Dashboard"
      description="Platform administration (ADMIN role required)."
      endpoint="GET /api/admin/* (RBAC: ADMIN)"
      capabilities={[
        'Manage users & subscriptions',
        'Usage, AI cost & revenue analytics',
        'Error monitoring (Sentry) overview',
        'Platform-wide audit log',
      ]}
    />
  );
}
