'use client';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function EmptyState({ title = 'No data found', description = 'There is nothing here yet.', icon: Icon = AlertCircle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-sail-text-primary mb-1">{title}</h3>
      <p className="text-sm text-sail-text-muted max-w-xs mb-4">{description}</p>
      {action && (
        <button onClick={action.onClick} className="flex items-center gap-2 px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-medium hover:bg-sail-secondary transition-colors">
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
}
