'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '@/config/nav';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

export function Sidebar() {
  const pathname = usePathname();
  const role = useAppStore((s) => s.user?.role ?? 'USER');

  return (
    <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 overflow-y-auto p-4 lg:flex">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-2 font-bold">
        <Sparkles className="h-6 w-6 text-primary" />
        <span className="gradient-text">Career Mentor</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.filter((i) => !i.adminOnly || role === 'ADMIN').map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className="relative h-[18px] w-[18px]" />
              <span className="relative font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
