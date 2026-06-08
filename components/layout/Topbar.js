'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, User, Lock, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';
import { getInitials } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const getBreadcrumb = (pathname) => {
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((part, i) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
    href: '/' + parts.slice(0, i + 1).join('/'),
  }));
};

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { toggleSidebar } = useUiStore();
  const breadcrumbs = getBreadcrumb(pathname);

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-sail-border z-30 flex items-center px-4 md:px-6 gap-3">
      {/* Hamburger — mobile only */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 text-slate-500 hover:text-sail-primary hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 flex-1 text-sm min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-slate-300">/</span>}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-sail-text-primary">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-sail-text-secondary hover:text-sail-primary transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="w-8 h-8 bg-sail-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{getInitials(user?.name || 'U')}</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-sail-text-primary leading-tight">{user?.name || '—'}</p>
              <p className="text-xs text-sail-text-muted leading-tight">{user?.designation || user?.role || ''}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="flex items-center gap-2" onClick={() => router.push('/settings')}>
              <User className="w-4 h-4" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2" onClick={() => router.push('/settings')}>
              <Lock className="w-4 h-4" /> Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600 flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
