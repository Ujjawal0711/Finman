import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { inr } from '../../format';
import type { CategoryPoint } from '../../types';

export default function CategoryPieChart({ data }: { data: CategoryPoint[] }) {
  const total = data.reduce((s, d) => s + d.total, 0);
  if (total === 0) return <p className="muted">No spending in this period.</p>;
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="category" innerRadius={60} outerRadius={100} paddingAngle={1}>
            {data.map((d) => <Cell key={d.category} fill={d.color} />)}
          </Pie>
          <Tooltip formatter={(v) => inr.format(Number(v))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-total">
        <span className="hint">Total</span>
        <span className="big">{inr.format(total)}</span>
      </div>
    </div>
  );
}
