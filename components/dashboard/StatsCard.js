'use client';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function StatsCard({ title, value, change, icon: Icon, color = 'blue', onClick, subtext }) {
  const colorMap = {
    blue:   { bg: 'bg-blue-50',   text: 'text-sail-primary', iconBg: 'bg-sail-primary' },
    red:    { bg: 'bg-red-50',    text: 'text-red-600',       iconBg: 'bg-red-500' },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',     iconBg: 'bg-green-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600',    iconBg: 'bg-sail-orange' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600',    iconBg: 'bg-purple-500' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className={cn('stat-card cursor-default', onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-sail-text-secondary mb-1">{title}</p>
          <p className={cn('text-3xl font-bold mb-2', c.text)}>{value}</p>
          {subtext && <p className="text-xs text-sail-text-muted">{subtext}</p>}
          {change && (
            <div className="flex items-center gap-1 mt-1">
              {change.direction === 'up' ? (
                <ArrowUp className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-red-500" />
              )}
              <span className={cn('text-xs font-medium', change.direction === 'up' ? 'text-green-600' : 'text-red-600')}>
                {change.value}
              </span>
              <span className="text-xs text-sail-text-muted">{change.label}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', c.iconBg)}>
            <Icon className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}
