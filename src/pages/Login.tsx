import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { mergeProgressData } from '../utils/mergeProgress';
import type { UserProgress } from '../types';
import { syncFullProgress } from '../api/client';

export default function Login() {
  const { login, apiEnabled } = useAuth();
  const { tr } = useLanguage();
  const { progress } = useProgress();
  const auth = tr.auth;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!apiEnabled) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>{auth.apiNotConfigured}</h2>
          <Link to="/" className="btn btn-primary">{auth.backHome}</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const serverProgress = await login(email, password) as UserProgress;
      const merged = mergeProgressData(progress, serverProgress);
      await syncFullProgress(merged);
      localStorage.setItem('lingualearn-progress', JSON.stringify(merged));
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : auth.loginFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1>{auth.loginTitle}</h1>
        <p>{auth.loginSubtitle}</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            {auth.email}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            {auth.password}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="current-password" />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? '...' : auth.login}
          </button>
        </form>
        <p className="auth-switch">
          {auth.noAccount} <Link to="/register">{auth.register}</Link>
        </p>
      </div>
    </div>
  );
}
