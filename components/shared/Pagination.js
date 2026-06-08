'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({ page, limit, total, onPageChange, onLimitChange }) {
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const half = Math.floor(maxVisible / 2);
      let startPage = Math.max(1, page - half);
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (startPage > 1) pages.unshift('...');
      if (endPage < totalPages) pages.push('...');
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <div className="flex items-center gap-2 text-sm text-sail-text-secondary">
        <span>Show</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
          className="border border-sail-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sail-primary"
        >
          {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <span>of {total} results</span>
        {total > 0 && <span>({start}–{end})</span>}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, i) => (
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'min-w-[32px] h-8 rounded text-sm font-medium transition-colors',
                p === page
                  ? 'bg-sail-primary text-white shadow-sm'
                  : 'hover:bg-slate-100 text-sail-text-secondary'
              )}
            >
              {p}
            </button>
          )
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
