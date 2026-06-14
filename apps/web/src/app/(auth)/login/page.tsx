'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, setAccessToken, unwrap } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const data = await unwrap<{ accessToken: string; refreshToken: string; user: any }>(
        api.post('/auth/login', {
          email: form.get('email'),
          password: form.get('password'),
        }),
      );
      setAccessToken(data.accessToken);
      localStorage.setItem('acm_rt', data.refreshToken);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="aurora-bg flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 font-bold">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="gradient-text text-lg">AI Career Mentor</span>
        </Link>
        <h1 className="mb-1 text-2xl font-bold">Welcome back</h1>
        <p className="mb-6 text-sm text-muted-foreground">Sign in to continue your journey.</p>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <Button variant="glass" type="button">Google</Button>
          <Button variant="glass" type="button">GitHub</Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <Button variant="gradient" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
