'use client';

import { Mail } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

export default function Page() {
  return (
    <FeaturePlaceholder
      icon={Mail}
      title="Cover Letter Generator"
      description="Tailored cover letters in seconds."
      endpoint="POST /api/cover-letter/generate"
      capabilities={[
        'Professional, personalized & ATS-friendly tones',
        'Generated from your resume + the job description',
        'Fully editable before export',
        'One-click PDF export',
      ]}
    />
  );
}
