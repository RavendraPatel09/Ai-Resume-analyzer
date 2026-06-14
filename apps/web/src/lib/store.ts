import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

interface AppState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'acm-app', partialize: (s) => ({ user: s.user, sidebarOpen: s.sidebarOpen }) },
  ),
);
