'use client';

import { ScanLine } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

export default function Page() {
  return (
    <FeaturePlaceholder
      icon={ScanLine}
      title="ATS Scanner"
      description="Match your resume against any job description."
      endpoint="POST /api/ats/scan"
      capabilities={[
        'ATS score (0–100) and keyword-match percentage',
        'Matched vs missing keywords, ranked by importance',
        'Formatting issues with severity and one-click fixes',
        'Optimization suggestions and a visual report',
      ]}
    />
  );
}
