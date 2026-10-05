import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { api } from '../api';
import TransactionTable from '../components/TransactionTable';
import { inr, showDate } from '../format';
import type { Category, Page, Transaction } from '../types';

const LIMIT = 20;

export default function History() {
  const [params, setParams] = useSearchParams();
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const category = params.get('category') ?? '';
  const q = params.get('q') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [search, setSearch] = useState(q);
  const [data, setData] = useState<Page<Transaction> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const colors = useMemo(() => new Map(categories.map((c) => [c.name, c.color])), [categories]);
  const filtered = Boolean(from || to || category || q);

  const update = useCallback((changes: Record<string, string>, resetPage = true) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(changes)) v ? next.set(k, v) : next.delete(k);
      if (resetPage) next.delete('page');
      return next;
    }, { replace: true });
  }, [setParams]);

  useEffect(() => { api.categories().then(setCategories).catch(() => {}); }, []);

  // debounce the search box by 300 ms
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => update({ q: search }), 300);
    return () => clearTimeout(t);
  }, [search, q, update]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (from) query.from = from;
      if (to) query.to = to;
      if (category) query.category = category;
      if (q) query.q = q;
      setData(await api.list(query));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, from, to, category, q]);

  useEffect(() => { load(); }, [load]);

  async function remove(t: Transaction) {
    if (!window.confirm(`Delete ${inr.format(t.amount)} at ${t.merchant || t.category} on ${showDate(t.occurredAt)}?`)) return;
    setDeleting(t._id);
    try {
      await api.remove(t._id);
      if (data && data.items.length === 1 && page > 1) update({ page: String(page - 1) }, false);
      else await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  const clear = () => { setSearch(''); setParams({}, { replace: true }); };
  const start = data ? (data.page - 1) * LIMIT + 1 : 0;
  const end = data ? start + data.items.length - 1 : 0;

  return (
    <>
      <div className="page-head"><h1>History</h1><Link className="button primary" to="/add">Add entry</Link></div>

      <div className="card">
        <div className="filters">
          <div className="field"><label htmlFor="h-from">From</label>
            <input id="h-from" type="date" value={from} onChange={(e) => update({ from: e.target.value })} /></div>
          <div className="field"><label htmlFor="h-to">To</label>
            <input id="h-to" type="date" value={to} onChange={(e) => update({ to: e.target.value })} /></div>
          <div className="field"><label htmlFor="h-cat">Category</label>
            <select id="h-cat" value={category} onChange={(e) => update({ category: e.target.value })}>
              <option value="">All</option>
              {categories.map((c) => <option key={c._id}>{c.name}</option>)}
            </select></div>
          <div className="field"><label htmlFor="h-q">Search</label>
            <input id="h-q" type="search" placeholder="Merchant or description" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <button onClick={clear} disabled={!filtered && !search}>Clear</button>
        </div>

        {error && (
          <div className="banner error" role="alert">
            {error} <button className="link" onClick={load}>Retry</button>
          </div>
        )}

        {!data && loading && <p className="muted" role="status">Loading...</p>}

        {data && data.total === 0 && !loading && (
          filtered ? (
            <div className="empty"><p>Nothing matches these filters.</p><button onClick={clear}>Clear filters</button></div>
          ) : (
            <div className="empty"><p>No transactions yet.</p><Link className="button primary" to="/add">Add entry</Link></div>
          )
        )}

        {data && data.items.length > 0 && (
          <>
            <TransactionTable items={data.items} colors={colors} loading={loading} deleting={deleting} onDelete={remove} />
            <div className="pager">
              <span className="muted">Showing {start} to {end} of {data.total}</span>
              <div className="actions">
                <button disabled={page <= 1 || loading} onClick={() => update({ page: String(page - 1) }, false)}>Prev</button>
                <button disabled={page >= data.pages || loading} onClick={() => update({ page: String(page + 1) }, false)}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
