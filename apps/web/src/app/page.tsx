'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { FEATURE_HIGHLIGHTS } from '@/config/nav';

export default function LandingPage() {
  return (
    <div className="aurora-bg min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="gradient-text text-lg">AI Career Mentor</span>
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="gradient" size="sm">
              <Link href="/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container flex flex-col items-center py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass mb-6 flex items-center gap-2 rounded-full px-4 py-1.5 text-sm"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          Powered by Claude, GPT &amp; Gemini
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl"
        >
          Land your next role with an <span className="gradient-text">AI mentor that remembers you</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          Analyze your resume, beat the ATS, close skill gaps, practice interviews, and follow a
          personalized roadmap — all guided by an AI that tracks every step of your journey.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Button asChild variant="gradient" size="lg">
            <Link href="/register">
              Start free <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="glass" size="lg">
            <Link href="/dashboard">View demo dashboard</Link>
          </Button>
        </motion.div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          {['No credit card', 'PDF / DOCX / TXT', '24/7 mentor'].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container grid gap-6 pb-28 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURE_HIGHLIGHTS.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="glass group rounded-2xl p-6 transition-transform hover:-translate-y-1"
          >
            <f.icon className="mb-4 h-9 w-9 text-primary transition-transform group-hover:scale-110" />
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.blurb}</p>
          </motion.div>
        ))}
      </section>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AI Career Mentor. Built with Next.js 15, NestJS &amp; Prisma.
      </footer>
    </div>
  );
}
