'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '@/constants/colors';

const STATUS_COLORS_MAP = {
  Open: COLORS.error,
  'In Progress': COLORS.warning,
  Resolved: COLORS.success,
  Closed: '#718096',
};

export default function StatusPieChart({ data = [] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const hasData = total > 0;
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h3 className="font-semibold text-sail-text-primary">Complaints by Status</h3>
        <span className="text-sm text-sail-text-muted">{total} total</span>
      </div>
      <div className="section-card-body">
        {hasData ? (
          <ResponsiveContainer width="100%" height={220} minHeight={220}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {data.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS_MAP[entry.name] || '#ccc'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px] text-sm text-sail-text-muted">No complaints yet</div>
        )}
      </div>
    </div>
  );
}
