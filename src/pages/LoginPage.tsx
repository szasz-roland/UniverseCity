import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth/AuthContext';
import { btn } from '@/components/ui/buttonStyles';

// How long the success animation plays before the redirect to /planner actually fires.
const SUCCESS_HOLD_MS = 700;

// Colors come from --blob-1..4, which shift per active theme (see index.css) so the
// login page's decoration reads as part of the current theme, not a fixed palette.
const BLOBS: Array<{ color: string; top: string; left: string; size: number }> = [
  { color: 'var(--blob-1)', top: '-8%', left: '-6%', size: 380 },
  { color: 'var(--blob-2)', top: '55%', left: '82%', size: 320 },
  { color: 'var(--blob-3)', top: '78%', left: '-4%', size: 260 },
  { color: 'var(--blob-4)', top: '-10%', left: '78%', size: 300 },
];

export function LoginPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  // Only set while playing the success animation after a fresh submit — lets an
  // already-authenticated visit to /login (e.g. hitting back) redirect instantly,
  // without holding it up for an animation nobody just triggered.
  const [holdRedirect, setHoldRedirect] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && user && !holdRedirect) {
    const from = (location.state as { from?: Location })?.from;
    return <Navigate to={from?.pathname ?? '/planner'} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    // Supabase returns the same generic message for "wrong password" and "no such
    // account" — surfaced as-is, not customized, so this can't be used to enumerate
    // registered emails.
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSucceeded(true);
    setHoldRedirect(true);
    setTimeout(() => setHoldRedirect(false), SUCCESS_HOLD_MS);
  }

  const locked = submitting || succeeded;

  const inp: React.CSSProperties = {
    width: '100%',
    border: '1px solid var(--line2)',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 13,
    fontFamily: 'inherit',
    background: 'var(--input-bg)',
    transition: 'border-color 150ms ease',
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg)',
        padding: 20,
        overflow: 'hidden',
      }}
    >
      {BLOBS.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: b.color,
            opacity: 'var(--blob-opacity)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />
      ))}

      <form
        onSubmit={handleSubmit}
        style={{
          position: 'relative',
          width: 340,
          maxWidth: '100%',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 18,
          padding: '30px 26px 26px',
          boxShadow: '0 20px 60px rgba(43,43,51,.12)',
          animation: 'loginCardEnter 500ms cubic-bezier(.22,1,.36,1)',
          transition: 'opacity 400ms ease 250ms, transform 400ms ease 250ms',
          opacity: succeeded ? 0 : 1,
          transform: succeeded ? 'translateY(-10px) scale(0.98)' : 'none',
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'var(--lav)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2.5" y="3.5" width="15" height="14" rx="2.5" stroke="var(--lav-ink)" strokeWidth="1.4" />
            <path d="M2.5 8H17.5" stroke="var(--lav-ink)" strokeWidth="1.4" />
            <path d="M6.5 2V5M13.5 2V5" stroke="var(--lav-ink)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>

        <div className="disp" style={{ fontSize: 23, fontWeight: 600, marginBottom: 4 }}>
          Tanrend
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 22 }}>
          Üzemmérnök informatikus · Bejelentkezés
        </div>

        <label style={{ display: 'block', marginBottom: 13 }}>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 6 }}>E-mail</div>
          <input
            type="email"
            autoComplete="username"
            required
            disabled={locked}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inp}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 18 }}>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 6 }}>Jelszó</div>
          <input
            type="password"
            autoComplete="current-password"
            required
            disabled={locked}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inp}
          />
        </label>

        {error && (
          <div
            role="alert"
            style={{
              fontSize: 12.5,
              color: 'var(--danger-ink)',
              background: 'var(--danger-bg)',
              borderRadius: 8,
              padding: '8px 10px',
              marginBottom: 14,
              animation: 'loginErrorShake 350ms ease',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="submit"
            disabled={locked}
            style={
              succeeded
                ? {
                    ...btn(true),
                    width: 44,
                    height: 44,
                    padding: 0,
                    borderRadius: 22,
                    background: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'width 420ms cubic-bezier(.34,1.56,.64,1), border-radius 420ms ease',
                    animation: 'loginSuccessPop 420ms cubic-bezier(.34,1.56,.64,1)',
                  }
                : {
                    ...btn(true),
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'width 420ms cubic-bezier(.34,1.56,.64,1), background-color 150ms ease',
                  }
            }
          >
            {succeeded ? (
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8.5L6.2 11.5L13 4.5"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : submitting ? (
              'Bejelentkezés…'
            ) : (
              'Bejelentkezés'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
