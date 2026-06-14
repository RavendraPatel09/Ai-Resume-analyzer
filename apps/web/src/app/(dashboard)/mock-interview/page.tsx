'use client';

import { Mic } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

export default function Page() {
  return (
    <FeaturePlaceholder
      icon={Mic}
      title="AI Mock Interview"
      description="Practice HR, technical, behavioral & system design rounds."
      endpoint="POST /api/interviews · /interviews/:id/answer"
      capabilities={[
        'Voice + webcam support with real-time evaluation',
        'Confidence and communication analysis',
        'Technical accuracy scoring per question',
        'Full interview report with ideal answers',
      ]}
    />
  );
}
