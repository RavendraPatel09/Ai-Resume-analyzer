'use client';

import { motion } from 'framer-motion';
import { FileSearch, ScanLine, Mic, Target, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NextActionCard } from '@/components/dashboard/next-action-card';
import { scoreColor } from '@/lib/utils';
import type { NextActionState } from '@acm/shared';

// Demo data — wire to useQuery(['progress']) / GET /api/progress in production.
const PROGRESS = [
  { month: 'Jan', resume: 58, ats: 49 },
  { month: 'Feb', resume: 64, ats: 57 },
  { month: 'Mar', resume: 71, ats: 66 },
  { month: 'Apr', resume: 78, ats: 74 },
  { month: 'May', resume: 84, ats: 81 },
];

const STATS = [
  { label: 'Resume Score', value: 84, icon: FileSearch },
  { label: 'ATS Score', value: 81, icon: ScanLine },
  { label: 'Interview Score', value: 76, icon: Mic },
  { label: 'Job Match Rate', value: 68, icon: Target },
];

const NEXT_ACTION: NextActionState = {
  currentStatus: 'Resume Score: 84%',
  nextRecommendedStep: {
    title: 'Strengthen your Python projects',
    actionType: 'improve_resume',
    rationale: 'Your impact score is the lowest dimension — quantify outcomes in 2 bullets.',
  },
  futureRecommendations: ['Run an ATS scan for Backend Developer', 'Apply to 5 matched roles'],
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back 👋</h1>
        <p className="text-muted-foreground">Here&apos;s your career momentum this week.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <s.icon className="h-6 w-6 text-primary" />
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <p className={`mt-4 text-3xl font-bold ${scoreColor(s.value)}`}>{s.value}%</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Score progression</CardTitle>
            <CardDescription>Resume vs ATS scores over time</CardDescription>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PROGRESS}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(250 84% 60%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(250 84% 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(199 89% 48%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
                <YAxis stroke="hsl(215 16% 47%)" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(20,20,30,0.9)',
                    border: 'none',
                    borderRadius: 12,
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="resume" stroke="hsl(250 84% 60%)" fill="url(#g1)" />
                <Area type="monotone" dataKey="ats" stroke="hsl(199 89% 48%)" fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <NextActionCard state={NEXT_ACTION} />
      </div>
    </div>
  );
}
