'use client';

import { Bell, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

export function Topbar() {
  const user = useAppStore((s) => s.user);
  return (
    <header className="glass sticky top-0 z-40 mb-6 flex h-14 items-center justify-between rounded-xl px-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search anything…</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white">
          {(user?.name ?? user?.email ?? 'U').slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
