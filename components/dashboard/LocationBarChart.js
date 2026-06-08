'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLocationStats } from '@/hooks/useDashboard';
import { COLORS } from '@/constants/colors';

export default function LocationBarChart() {
  const { data = [], isLoading } = useLocationStats();
  return (
    <div className="section-card">
      <div className="section-card-header">
        <h3 className="font-semibold text-sail-text-primary">Complaints by Location</h3>
      </div>
      <div className="section-card-body">
        <ResponsiveContainer width="100%" height={220} minHeight={220}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#718096' }} />
            <YAxis dataKey="location" type="category" tick={{ fontSize: 11, fill: '#4A5568' }} width={110} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
            <Bar dataKey="total" name="Total" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS.primary} opacity={0.7 + (i % 3) * 0.1} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
