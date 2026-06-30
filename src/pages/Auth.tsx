import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

type Mode = 'login' | 'register';

export default function Auth() {
  const { login, register, error, clearError, isAuthenticated } = useAuth();
  const { tr } = useLanguage();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, displayName || undefined);
      }
      navigate('/', { replace: true });
    } catch {
      /* error shown via context */
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(next: Mode) {
    clearError();
    setMode(next);
  }

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>{mode === 'login' ? tr.auth.loginTitle : tr.auth.registerTitle}</h1>
        <p className="auth-subtitle">
          {mode === 'login' ? tr.auth.loginSubtitle : tr.auth.registerSubtitle}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="displayName">{tr.auth.displayName}</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={tr.auth.displayNamePlaceholder}
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">{tr.auth.email}</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">{tr.auth.password}</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting
              ? tr.auth.submitting
              : mode === 'login'
                ? tr.auth.login
                : tr.auth.register}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? tr.auth.noAccount : tr.auth.hasAccount}{' '}
          <button type="button" className="auth-link" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? tr.auth.register : tr.auth.login}
          </button>
        </p>

        <Link to="/" className="auth-back">{tr.auth.backHome}</Link>
      </div>
    </div>
  );
}
