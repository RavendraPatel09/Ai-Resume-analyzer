'use client';

import { Bot } from 'lucide-react';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

export default function Page() {
  return (
    <FeaturePlaceholder
      icon={Bot}
      title="Career Chatbot"
      description="Your 24/7 mentor that remembers your goals and history."
      endpoint="POST /api/chat (streams, RAG over AI Memory)"
      capabilities={[
        'Remembers goals, skills, education & past conversations',
        'Career, resume, interview & job-strategy advice',
        'Pulls context from the AI Memory Center automatically',
        'Persistent, searchable conversation history',
      ]}
    />
  );
}
