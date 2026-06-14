'use client';

import { motion } from 'framer-motion';
import { Sparkles, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * Consistent "coming together" surface for feature pages whose UI is scaffolded.
 * Each feature's backend slice + Zod contract already exists; this renders the
 * page shell, the planned capabilities, and the wired API endpoint.
 */
export function FeaturePlaceholder({
  icon: Icon,
  title,
  description,
  capabilities,
  endpoint,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  capabilities: string[];
  endpoint: string;
}) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="glass flex h-12 w-12 items-center justify-center rounded-xl">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {capabilities.map((c, i) => (
          <motion.div
            key={c}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{c}</span>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-secondary/40">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Wired endpoint</p>
        <code className="text-sm text-primary">{endpoint}</code>
      </Card>
    </div>
  );
}
