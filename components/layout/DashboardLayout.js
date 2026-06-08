'use client';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }) {
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen } = useUiStore();
  return (
    <div className="min-h-screen bg-sail-bg">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar />
      <Topbar />
      <main
        className={cn(
          'transition-all duration-300 pt-16',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        )}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
