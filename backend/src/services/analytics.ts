import { TZ } from '../config/env.js';
import { Transaction } from '../models/Transaction.js';

// '2026-10-05' to '2026-10-05' becomes [04 Oct 18:30Z, 05 Oct 18:30Z): exactly one IST day
export function istDayRange(from: string, to: string) {
  const start = new Date(`${from}T00:00:00+05:30`);
  const end = new Date(`${to}T00:00:00+05:30`);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export const todayIst = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());

export async function dailySpending(from: string, to: string) {
  const { start, end } = istDayRange(from, to);
  const rows = await Transaction.aggregate<{ day: string; total: number; count: number }>([
    { $match: { direction: 'debit', occurredAt: { $gte: start, $lt: end } } },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$occurredAt', timezone: TZ } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
    } },
    { $project: { _id: 0, day: '$_id', total: { $round: ['$total', 2] }, count: 1 } },
  ]);

  // fill days with no spending so the chart shows gaps as zero bars
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out: { day: string; total: number; count: number }[] = [];
  for (const d = new Date(`${from}T12:00:00Z`); d.toISOString().slice(0, 10) <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = d.toISOString().slice(0, 10);
    out.push(byDay.get(day) ?? { day, total: 0, count: 0 });
  }
  return out;
}

export function categoryBreakdown(from: string, to: string) {
  const { start, end } = istDayRange(from, to);
  return Transaction.aggregate([
    { $match: { direction: 'debit', occurredAt: { $gte: start, $lt: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: 'name', as: 'cat' } },
    { $project: {
        _id: 0, category: '$_id', count: 1,
        total: { $round: ['$total', 2] },
        color: { $ifNull: [{ $first: '$cat.color' }, '#9ca3af'] },
    } },
    { $sort: { total: -1 } },
  ]);
}
