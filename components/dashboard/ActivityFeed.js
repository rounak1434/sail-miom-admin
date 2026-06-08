'use client';
import { useRecentActivity } from '@/hooks/useDashboard';
import { timeAgo } from '@/lib/utils';
import { CheckCircle2, Upload, UserCheck, AlertCircle, Wrench } from 'lucide-react';

const iconMap = {
  resolved: { icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
  uploaded: { icon: Upload, color: 'text-blue-500 bg-blue-50' },
  assigned: { icon: UserCheck, color: 'text-purple-500 bg-purple-50' },
  created: { icon: AlertCircle, color: 'text-orange-500 bg-orange-50' },
  maintenance: { icon: Wrench, color: 'text-cyan-500 bg-cyan-50' },
};

export default function ActivityFeed() {
  const { data: activities = [], isLoading } = useRecentActivity();

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h3 className="font-semibold text-sail-text-primary">Recent Activity</h3>
      </div>
      <div className="divide-y divide-sail-border">
        {activities.slice(0, 6).map((a, i) => {
          const { icon: Icon, color } = iconMap[a.type] || iconMap.created;
          return (
            <div key={i} className="flex items-start gap-3 px-6 py-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-sail-text-primary leading-snug">{a.message}</p>
                <p className="text-xs text-sail-text-muted mt-0.5">{timeAgo(a.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
