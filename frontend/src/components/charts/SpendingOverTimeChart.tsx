import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { inr, shortDay } from '../../format';
import type { DailyPoint } from '../../types';

export default function SpendingOverTimeChart({ data }: { data: DailyPoint[] }) {
  if (data.every((d) => d.total === 0)) return <p className="muted">No spending in this period.</p>;
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis dataKey="day" tickFormatter={shortDay} interval="preserveStartEnd" minTickGap={24} tickLine={false} />
          <YAxis tickFormatter={(v) => '₹' + Number(v).toLocaleString('en-IN')} width={64} tickLine={false} axisLine={false} />
          <Tooltip labelFormatter={(l) => shortDay(String(l))} formatter={(v) => inr.format(Number(v))} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="total" name="Spent" fill="var(--accent)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
