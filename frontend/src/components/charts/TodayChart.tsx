import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { inr } from '../../format';
import type { CategoryPoint } from '../../types';

export default function TodayChart({ data }: { data: CategoryPoint[] }) {
  const total = data.reduce((s, d) => s + d.total, 0);
  if (total === 0) return <p className="muted">No spending today.</p>;
  return (
    <>
      <p className="big">{inr.format(total)}</p>
      <div className="chart-box short">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="category" width={96} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v) => inr.format(Number(v))} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
              {data.map((d) => <Cell key={d.category} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
