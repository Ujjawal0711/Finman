import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import Icon from '../components/Icon';

export default function Login({ onSignedIn }: { onSignedIn: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'' | 'form' | 'demo'>('');
  const [demoEmail, setDemoEmail] = useState<string | null>(null);

  // The demo button appears only when the server has a demo account configured.
  useEffect(() => {
    api.demoInfo().then((d) => setDemoEmail(d.enabled ? d.email : null)).catch(() => {});
  }, []);

  async function signIn(kind: 'form' | 'demo', call: () => Promise<{ email: string }>) {
    setBusy(kind);
    setError('');
    try {
      onSignedIn((await call()).email);
    } catch (err) {
      setError((err as Error).message);
      setBusy('');
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    signIn('form', () => api.login(email, password));
  };

  return (
    <div className="login">
      <div className="login-brand">
        <span className="brand-mark" aria-hidden="true">₹</span>
        <span className="brand-name">FinMan</span>
      </div>
      <form className="card login-card" onSubmit={submit}>
        <h1>Sign in</h1>
        <p className="muted">Your spending, read from the messages your bank already sends.</p>
        {error && <div className="banner error" role="alert"><div>{error}</div></div>}
        <div className="field">
          <label htmlFor="l-email">Email</label>
          <input id="l-email" type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="l-pass">Password</label>
          <input id="l-pass" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="primary" disabled={busy !== ''}>
          <Icon name="lock" size={16} />{busy === 'form' ? 'Signing in…' : 'Sign in'}
        </button>
        {demoEmail && (
          <>
            <div className="login-or" aria-hidden="true"><span>or</span></div>
            <button type="button" className="demo-btn" disabled={busy !== ''} onClick={() => signIn('demo', api.demoLogin)}>
              <Icon name="sparkles" size={16} />{busy === 'demo' ? 'Opening demo…' : 'Try the demo account'}
            </button>
            <p className="hint login-demo-note">No password needed. Signs in as {demoEmail} with sample data.</p>
          </>
        )}
      </form>
    </div>
  );
}
