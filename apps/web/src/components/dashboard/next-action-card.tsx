'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { NextActionState } from '@acm/shared';

/**
 * Surfaces the Next Action Engine output: current status → next step → future.
 * In production this is fed by GET /api/recommendations/next-action.
 */
export function NextActionCard({ state }: { state: NextActionState }) {
  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-primary">
          <Sparkles className="h-4 w-4" /> AI Next Action
        </div>
        <CardTitle className="text-xl">{state.currentStatus}</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Next recommended step</p>
          <p className="mt-1 font-semibold">{state.nextRecommendedStep.title}</p>
          <p className="text-sm text-muted-foreground">{state.nextRecommendedStep.rationale}</p>
        </div>
        {state.futureRecommendations.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">After that</p>
            <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
              {state.futureRecommendations.map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <ArrowRight className="h-3.5 w-3.5" /> {r}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button variant="gradient" className="w-full">
          {state.nextRecommendedStep.title} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
