import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ApiError, api } from '../api';
import EntryForm from '../components/EntryForm';
import type { FormValues } from '../components/EntryForm';
import ParseInput from '../components/ParseInput';
import { fromInputs, inr, todayStr } from '../format';
import type { Category, ParseResult, Source, TransactionInput } from '../types';

type Step = 'input' | 'parsing' | 'review' | 'saving';

interface Review {
  values: FormValues;
  aiFilled: Set<string>;
  missing: Set<string>;
  details: Record<string, unknown>;
  rawInput: string;
  source: Source;
  warnings: string[];
}

const EMPTY: FormValues = { amount: '', direction: 'debit', merchant: '', date: todayStr(), time: '', category: '', paymentMethod: '', description: '' };

const manualReview = (): Review => ({
  values: { ...EMPTY, date: todayStr() }, aiFilled: new Set(), missing: new Set(), details: {}, rawInput: '', source: 'manual', warnings: [],
});

function fromParse(r: ParseResult): Review {
  const f = r.fields!;
  return {
    values: {
      amount: f.amount != null ? String(f.amount) : '',
      direction: f.direction ?? 'debit',
      merchant: f.merchant ?? '',
      date: f.date ?? todayStr(),
      time: f.time ?? '',
      category: f.category ?? '',
      paymentMethod: f.paymentMethod ?? '',
      description: f.description ?? '',
    },
    aiFilled: new Set(r.aiFilled),
    missing: new Set(f.date ? r.missing : [...r.missing, 'date']),
    details: f.details,
    rawInput: r.rawInput,
    source: r.source,
    warnings: r.warnings,
  };
}

export default function AddEntry() {
  const [step, setStep] = useState<Step>('input');
  const [text, setText] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [notTx, setNotTx] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [saved, setSaved] = useState('');
  const [duplicate, setDuplicate] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => { api.categories().then(setCategories).catch((e: Error) => setError(e.message)); }, []);

  async function run(call: () => Promise<ParseResult>) {
    setStep('parsing'); setError(''); setNotTx(false); setSaved(''); setDuplicate(false);
    try {
      const r = await call();
      if (!r.isTransaction) { setNotTx(true); setStep('input'); return; }
      setReview(fromParse(r));
      setFormKey((k) => k + 1);
      setStep('review');
    } catch (e) {
      setError((e as Error).message);
      setStep('input');
    }
  }

  const manual = () => { setReview(manualReview()); setFormKey((k) => k + 1); setSaved(''); setDuplicate(false); setError(''); setNotTx(false); setStep('review'); };

  async function save(v: FormValues) {
    if (!review) return;
    const payload: TransactionInput = {
      amount: Number(v.amount),
      direction: v.direction,
      merchant: v.merchant,
      occurredAt: fromInputs(v.date, v.time),
      description: v.description,
      category: v.category,
      paymentMethod: v.paymentMethod || 'Other',
      source: review.source,
      aiParsed: review.aiFilled.size > 0,
      details: review.details,
      ...(review.rawInput ? { rawInput: review.rawInput } : {}),
    };
    setStep('saving'); setError(''); setDuplicate(false);
    try {
      await api.create(payload);
      setSaved(`Saved ${inr.format(payload.amount)}${payload.merchant ? ` at ${payload.merchant}` : ''}`);
      setText(''); setReview(null); setStep('input');
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) setDuplicate(true);
      else setError((e as Error).message);
      setStep('review');
    }
  }

  const banners = (
    <>
      {saved && (
        <div className="banner ok" role="status">
          {saved}
          <div className="actions"><Link to="/history">View history</Link></div>
        </div>
      )}
      {duplicate && (
        <div className="banner error" role="alert">
          You already saved this message. <Link to="/history">Open history</Link>
        </div>
      )}
    </>
  );

  if (step === 'review' || step === 'saving') {
    return (
      <>
        <div className="page-head"><h1>Review entry</h1></div>
        {banners}
        {error && <div className="banner error" role="alert">{error}</div>}
        {review!.warnings.length > 0 && (
          <div className="banner warn" role="status"><ul>{review!.warnings.map((w) => <li key={w}>{w}</li>)}</ul></div>
        )}
        <div className="split">
          <div className="card">
            <EntryForm key={formKey} initial={review!.values} aiFilled={review!.aiFilled} missing={review!.missing}
              categories={categories} details={review!.details} submitLabel="Save entry" saving={step === 'saving'}
              onSubmit={save} onCancel={() => { setStep('input'); setDuplicate(false); setError(''); }} />
          </div>
          {review!.rawInput && (
            <details className="raw-panel" open>
              <summary>Original text</summary>
              <pre>{review!.rawInput}</pre>
            </details>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head"><h1>Add entry</h1></div>
      {banners}
      {notTx && (
        <div className="banner warn" role="status">
          This looks like an OTP or promotion, not a transaction.
          <div className="actions">
            <button className="small" onClick={manual}>Enter manually</button>
            <button className="small" onClick={() => setNotTx(false)}>Edit text</button>
          </div>
        </div>
      )}
      <ParseInput text={text} setText={setText} busy={step === 'parsing'} error={error}
        onParseText={() => run(() => api.parse(text, 'sms'))}
        onParseFile={(blob, name) => run(() => api.parseFile(blob, name))}
        onManual={manual} />
    </>
  );
}
