'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useComplaintsChart } from '@/hooks/useDashboard';
import { COLORS } from '@/constants/colors';
import { TableSkeleton } from '@/components/shared/LoadingSpinner';

const periods = ['week', 'month', 'year'];

export default function ComplaintsChart() {
  const [period, setPeriod] = useState('week');
  const { data, isLoading } = useComplaintsChart(period);

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h3 className="font-semibold text-sail-text-primary">Complaints Over Time</h3>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-xs font-medium capitalize transition-all ${period === p ? 'bg-white shadow-sm text-sail-primary' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="section-card-body">
        {isLoading ? <TableSkeleton rows={4} cols={3} /> : (
          <ResponsiveContainer width="100%" height={220} minHeight={220}>
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#718096' }} />
              <YAxis tick={{ fontSize: 11, fill: '#718096' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="open" name="Open" fill={COLORS.error} radius={[3, 3, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill={COLORS.success} radius={[3, 3, 0, 0]} />
              <Bar dataKey="breached" name="Breached" fill={COLORS.warning} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
