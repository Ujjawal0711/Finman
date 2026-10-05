import { Link } from 'react-router';
import { inr, showDate } from '../format';
import type { Transaction } from '../types';

interface Props {
  items: Transaction[];
  colors: Map<string, string>;
  loading: boolean;
  deleting: string | null;
  onDelete: (t: Transaction) => void;
}

export default function TransactionTable({ items, colors, loading, deleting, onDelete }: Props) {
  return (
    <div className={`table-wrap${loading ? ' loading' : ''}`} aria-busy={loading}>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Merchant</th><th>Category</th><th>Method</th>
            <th className="amount">Amount</th><th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t._id}>
              <td className="nowrap">{showDate(t.occurredAt)}</td>
              <td className="merchant" title={t.merchant}>
                {t.merchant || <span className="muted">-</span>}{' '}
                {t.aiParsed && <span className="ai-badge" title="Parsed by AI">AI</span>}
              </td>
              <td className="nowrap">
                <span className="dot" style={{ background: colors.get(t.category) ?? '#9ca3af' }} aria-hidden="true" />
                {t.category}
              </td>
              <td>{t.paymentMethod}</td>
              <td className={`amount ${t.direction}`}>
                {t.direction === 'credit' ? '+' : '−'}{inr.format(t.amount)}
              </td>
              <td>
                <div className="actions" style={{ flexWrap: 'nowrap' }}>
                  <Link className="button small" to={`/history/${t._id}/edit`}>Edit</Link>
                  <button className="small danger" disabled={deleting === t._id} onClick={() => onDelete(t)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
