'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, AlertCircle, FileText, Wrench,
  Users, BarChart2, Settings, ChevronLeft, ChevronRight,
  LogOut, Zap, Bell, ClipboardList
} from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/complaints', label: 'Complaints', icon: AlertCircle },
  { href: '/drawings', label: 'Drawings', icon: FileText },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/work-orders', label: 'Work Orders', icon: ClipboardList },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapse, sidebarOpen, setSidebarOpen } = useUiStore();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-sail-sidebar flex flex-col z-40 transition-all duration-300 shadow-2xl',
        /* mobile: full-width drawer, hidden off-screen when closed */
        'w-64',
        !sidebarOpen ? '-translate-x-full md:translate-x-0' : 'translate-x-0',
        /* desktop: collapse to icon rail */
        sidebarCollapsed ? 'md:w-16' : 'md:w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 min-h-[72px]">
        <div className="flex-shrink-0 w-9 h-9 bg-sail-primary rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <div className="text-white font-bold text-sm leading-tight truncate">SAIL-MIOM</div>
            <div className="text-slate-400 text-xs truncate">Electrical Admin</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(href);
          const item = (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'sidebar-nav-item',
                active ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive',
                sidebarCollapsed ? 'justify-center' : ''
              )}
            >
              <Icon className={cn('flex-shrink-0', sidebarCollapsed ? 'w-5 h-5' : 'w-4.5 h-4.5')} strokeWidth={active ? 2.5 : 2} />
              {!sidebarCollapsed && (
                <span className="flex-1 text-sm">{label}</span>
              )}
              {!sidebarCollapsed && badge && (
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  active ? 'bg-white/20 text-white' : 'bg-sail-orange text-white'
                )}>
                  {badge}
                </span>
              )}
            </Link>
          );
          return sidebarCollapsed ? (
            <Tooltip key={href}>
              <TooltipTrigger
                render={
                  <Link
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'sidebar-nav-item justify-center',
                      active ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive'
                    )}
                  />
                }
              >
                <Icon className="flex-shrink-0 w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                <span>{label}</span>
                {badge && <span className="ml-2 text-xs text-orange-400">({badge})</span>}
              </TooltipContent>
            </Tooltip>
          ) : item;
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-2">
        {!sidebarCollapsed ? (
          <div className="px-2 py-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-sail-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">{getInitials(user?.name || 'U')}</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{user?.name || '—'}</p>
                <p className="text-slate-400 text-xs truncate">{user?.designation || user?.role || ''}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={() => logout()}
                  className="sidebar-nav-item sidebar-nav-item-inactive justify-center w-full"
                />
              }
            >
              <LogOut className="w-5 h-5" />
            </TooltipTrigger>
            <TooltipContent side="right">Sign Out</TooltipContent>
          </Tooltip>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebarCollapse}
          className="flex items-center justify-center w-full mt-1 p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
