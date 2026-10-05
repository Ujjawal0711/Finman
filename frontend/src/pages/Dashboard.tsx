import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import SpendingOverTimeChart from '../components/charts/SpendingOverTimeChart';
import TodayChart from '../components/charts/TodayChart';
import ExportButtons from '../components/ExportButtons';
import { daysAgoStr, monthBounds, todayStr } from '../format';
import type { CategoryPoint, DailyPoint } from '../types';

interface Slot<T> { data: T | null; error: string; loading: boolean }
const idle = <T,>(): Slot<T> => ({ data: null, error: '', loading: true });

// One request per card, so a failure in one never blanks the page.
function useSlot<T>(fetcher: () => Promise<T>, deps: unknown[]): [Slot<T>, () => void] {
  const [slot, setSlot] = useState<Slot<T>>(idle);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setSlot((s) => ({ ...s, loading: true, error: '' }));
    fetcher().then(
      (data) => live && setSlot({ data, error: '', loading: false }),
      (e: Error) => live && setSlot({ data: null, error: e.message, loading: false }),
    );
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return [slot, () => setTick((t) => t + 1)];
}

function Card({ title, slot, retry, actions, children }: {
  title: string; slot: Slot<unknown>; retry: () => void; actions?: ReactNode; children: ReactNode;
}) {
  return (
    <section className="card">
      <div className="card-head"><h2>{title}</h2>{actions}</div>
      {slot.error ? (
        <div className="banner error" role="alert">{slot.error} <button className="link" onClick={retry}>Retry</button></div>
      ) : slot.loading && !slot.data ? <p className="muted" role="status">Loading...</p> : children}
    </section>
  );
}

export default function Dashboard() {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [month, setMonth] = useState(todayStr().slice(0, 7));

  const [today, retryToday] = useSlot<CategoryPoint[]>(() => api.byCategory(todayStr(), todayStr()), []);
  const [months, retryMonth] = useSlot<CategoryPoint[]>(() => {
    const { from, to } = monthBounds(month);
    return api.byCategory(from, to);
  }, [month]);
  const [daily, retryDaily] = useSlot<DailyPoint[]>(() => api.daily(daysAgoStr(range - 1), todayStr()), [range]);

  return (
    <>
      <div className="page-head"><h1>Dashboard</h1><ExportButtons /></div>
      <div className="grid-2">
        <Card title="Today" slot={today} retry={retryToday}>
          <TodayChart data={today.data ?? []} />
        </Card>
        <Card title="By category" slot={months} retry={retryMonth}
          actions={<input type="month" aria-label="Month" value={month} max={todayStr().slice(0, 7)}
            onChange={(e) => e.target.value && setMonth(e.target.value)} style={{ width: 'auto' }} />}>
          <CategoryPieChart data={months.data ?? []} />
        </Card>
      </div>
      <Card title="Spending over time" slot={daily} retry={retryDaily}
        actions={
          <div className="tabs" style={{ margin: 0 }} role="group" aria-label="Range">
            {([7, 30, 90] as const).map((r) => (
              <button key={r} className="small" aria-pressed={range === r} aria-selected={range === r} onClick={() => setRange(r)}>{r} days</button>
            ))}
          </div>
        }>
        <SpendingOverTimeChart data={daily.data ?? []} />
      </Card>
    </>
  );
}
