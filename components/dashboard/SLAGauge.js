'use client';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { COLORS } from '@/constants/colors';

const GAUGE_SIZE = 176; // matches the w-44 / h-44 box (11rem)

export default function SLAGauge({ percentage = 0, met = 0, breached = 0 }) {
  const color = percentage >= 90 ? COLORS.success : percentage >= 70 ? COLORS.warning : COLORS.error;
  const data = [{ value: percentage, fill: color }];

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h3 className="font-semibold text-sail-text-primary">SLA Performance</h3>
      </div>
      <div className="section-card-body flex flex-col items-center">
        <div className="relative" style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}>
          {/* Fixed pixel size — a ResponsiveContainer here measures -1 during SSR. */}
          <RadialBarChart
            width={GAUGE_SIZE}
            height={GAUGE_SIZE}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="100%"
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background={{ fill: '#f0f0f0' }} cornerRadius={6} />
          </RadialBarChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-6">
            <span className="text-3xl font-bold" style={{ color }}>{percentage}%</span>
            <span className="text-xs text-sail-text-muted">SLA Adherence</span>
          </div>
        </div>
        <div className="flex gap-6 mt-2 text-center">
          <div>
            <p className="text-xl font-bold text-green-600">{met}</p>
            <p className="text-xs text-sail-text-muted">Met</p>
          </div>
          <div>
            <p className="text-xl font-bold text-red-600">{breached}</p>
            <p className="text-xs text-sail-text-muted">Breached</p>
          </div>
        </div>
      </div>
    </div>
  );
}
