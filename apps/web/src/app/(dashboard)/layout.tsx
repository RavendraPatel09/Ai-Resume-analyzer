import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="aurora-bg flex min-h-screen">
      <Sidebar />
      <div className="flex-1 px-4 pb-12 pt-4 sm:px-6">
        <Topbar />
        <main className="mx-auto max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
