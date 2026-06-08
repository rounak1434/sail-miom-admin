'use client';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={cn('animate-spin rounded-full border-2 border-slate-200 border-t-sail-primary', sizes[size], className)} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-3" />
        <p className="text-sm text-sail-text-muted">Loading...</p>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-8 bg-slate-100 rounded shimmer" style={{ flex: j === 1 ? 2 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
