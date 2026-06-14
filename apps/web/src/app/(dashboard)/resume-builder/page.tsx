'use client';

import { FileEdit } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

export default function Page() {
  return (
    <FeaturePlaceholder
      icon={FileEdit}
      title="Resume Builder"
      description="Drag-and-drop builder with live preview."
      endpoint="CRUD /api/resumes/:id/versions"
      capabilities={[
        'Professional templates with live preview',
        'AI rewrite & AI bullet generation',
        'Export to PDF and DOCX',
        'Versioning for every iteration',
      ]}
    />
  );
}
