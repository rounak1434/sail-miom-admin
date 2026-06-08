'use client';
import { AlertCircle, Clock, Wrench, TrendingUp, FileText, BarChart2, Download } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import ComplaintsChart from '@/components/dashboard/ComplaintsChart';
import StatusPieChart from '@/components/dashboard/StatusPieChart';
import LocationBarChart from '@/components/dashboard/LocationBarChart';
import SLAGauge from '@/components/dashboard/SLAGauge';
import RecentComplaints from '@/components/dashboard/RecentComplaints';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useAuthStore } from '@/store/authStore';
import { greetingByTime, formatDate } from '@/lib/utils';
import { getSlaColor } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { user } = useAuthStore();
  const router = useRouter();

  const s = stats || {};
  const slaColor = getSlaColor(s.slaAdherence ?? 0);
  const statusData = s.statusBreakdown ? [
    { name: 'Open', value: s.statusBreakdown.open || 0 },
    { name: 'In Progress', value: s.statusBreakdown.inProgress || 0 },
    { name: 'Resolved', value: s.statusBreakdown.resolved || 0 },
    { name: 'Closed', value: s.statusBreakdown.closed || 0 },
  ] : [];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-sail-text-primary">{greetingByTime()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</h1>
          <p className="text-sail-text-secondary text-sm mt-0.5">{formatDate(new Date(), 'EEEE, MMMM d, yyyy')} · Electrical Department Overview</p>
        </div>
        <button
          onClick={() => router.push('/reports')}
          className="flex items-center gap-2 px-4 py-2 bg-sail-primary text-white rounded-lg text-sm font-semibold hover:bg-sail-secondary transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Generate Report
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          title="Open Complaints"
          value={s.openComplaints ?? 0}
          icon={AlertCircle}
          color="blue"
          onClick={() => router.push('/complaints?status=open')}
        />
        <StatsCard
          title="SLA Breached"
          value={s.slaBreached ?? 0}
          icon={Clock}
          color="red"
          onClick={() => router.push('/complaints?breached=true')}
        />
        <StatsCard
          title="Pending Maintenance"
          value={s.pendingMaintenance ?? 0}
          icon={Wrench}
          color="orange"
          onClick={() => router.push('/maintenance')}
        />
        <StatsCard
          title="SLA Adherence"
          value={`${s.slaAdherence ?? 0}%`}
          icon={TrendingUp}
          color={(s.slaAdherence ?? 0) >= 90 ? 'green' : (s.slaAdherence ?? 0) >= 70 ? 'orange' : 'red'}
          onClick={() => router.push('/reports')}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ComplaintsChart />
        <StatusPieChart data={statusData} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LocationBarChart />
        <SLAGauge percentage={s.slaAdherence ?? 0} met={s.slaMet ?? 0} breached={s.slaBreached ?? 0} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentComplaints />
        <ActivityFeed />
      </div>
    </div>
  );
}
