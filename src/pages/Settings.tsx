import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Locale } from '../types';

export default function Settings() {
  const { progress, updateSettings, exportProgress, importProgress } = useProgress();
  const { user, isAuthenticated, logout } = useAuth();
  const { tr, locale, setLocale } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const { settings } = progress;

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await importProgress(file);
    alert(ok ? tr.progress.importSuccess : tr.progress.importError);
    e.target.value = '';
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{tr.settings.title}</h1>
        <p>{tr.settings.subtitle}</p>
      </div>

      <div className="settings-section">
        <h3>{tr.settings.account}</h3>
        {isAuthenticated && user ? (
          <div className="account-info">
            <p><strong>{tr.settings.signedInAs}</strong> {user.email}</p>
            <p className="muted-text">{tr.settings.syncNote}</p>
            <button className="btn btn-outline btn-block" onClick={() => void logout()}>
              {tr.nav.logout}
            </button>
          </div>
        ) : (
          <div className="account-info">
            <p className="muted-text">{tr.settings.guestNote}</p>
            <Link to="/auth" className="btn btn-primary btn-block">{tr.nav.login}</Link>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>{tr.settings.language}</h3>
        <div className="settings-options">
          {(['en', 'vi'] as Locale[]).map((l) => (
            <button
              key={l}
              className={`settings-option ${locale === l ? 'active' : ''}`}
              onClick={() => setLocale(l)}
            >
              {l === 'en' ? tr.settings.english : tr.settings.vietnamese}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>{tr.settings.dailyGoals}</h3>
        <div className="settings-goal-row">
          <label>{tr.settings.lessonsPerDay}</label>
          <input
            type="number" min={1} max={10}
            value={settings.dailyLessonGoal}
            onChange={(e) => updateSettings({ dailyLessonGoal: +e.target.value })}
          />
        </div>
        <div className="settings-goal-row">
          <label>{tr.settings.wordsPerDay}</label>
          <input
            type="number" min={1} max={50}
            value={settings.dailyWordGoal}
            onChange={(e) => updateSettings({ dailyWordGoal: +e.target.value })}
          />
        </div>
        <div className="settings-goal-row">
          <label>{tr.settings.quizzesPerDay}</label>
          <input
            type="number" min={1} max={10}
            value={settings.dailyQuizGoal}
            onChange={(e) => updateSettings({ dailyQuizGoal: +e.target.value })}
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>{tr.settings.data}</h3>
        <div className="settings-actions">
          <button className="btn btn-outline btn-block" onClick={exportProgress}>
            {tr.progress.export}
          </button>
          <button className="btn btn-outline btn-block" onClick={() => fileRef.current?.click()}>
            {tr.progress.import}
          </button>
          <input ref={fileRef} type="file" accept=".json" hidden onChange={handleImport} />
        </div>
      </div>
    </div>
  );
}
