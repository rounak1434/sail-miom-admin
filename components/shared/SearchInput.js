'use client';
import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

export default function SearchInput({ placeholder = 'Search...', onSearch, className, defaultValue = '' }) {
  const [value, setValue] = useState(defaultValue);
  const debouncedValue = useDebounce(value, 300);
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Skip the mount fire: the initial value already lives in the filter store,
    // so calling onSearch here would needlessly reset pagination to page 1.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (typeof onSearch === 'function') {
      onSearch(debouncedValue);
    }
  }, [debouncedValue]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm border border-sail-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sail-primary/20 focus:border-sail-primary transition-colors"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
