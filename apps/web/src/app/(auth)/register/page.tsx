'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { registerSchema } from '@acm/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, setAccessToken, unwrap } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get('name')),
      email: String(form.get('email')),
      password: String(form.get('password')),
    };
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setLoading(true);
    try {
      const data = await unwrap<{ accessToken: string; refreshToken: string; user: any }>(
        api.post('/auth/register', payload),
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
        <h1 className="mb-1 text-2xl font-bold">Create your account</h1>
        <p className="mb-6 text-sm text-muted-foreground">Start free — no credit card required.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input name="name" required placeholder="Full name"
            className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input name="email" type="email" required placeholder="you@example.com"
            className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input name="password" type="password" required placeholder="Password (8+ chars, 1 number, 1 uppercase)"
            className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <Button variant="gradient" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
