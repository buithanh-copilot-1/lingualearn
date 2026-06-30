import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import type { Locale } from '../types';

export default function Settings() {
  const { progress, updateSettings, exportProgress, importProgress } = useProgress();
  const { tr, locale, setLocale } = useLanguage();
  const { isAuthenticated, apiEnabled, logout, user } = useAuth();
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
          <label>{tr.settings.reviewsPerDay}</label>
          <input
            type="number" min={5} max={100}
            value={settings.dailyReviewGoal}
            onChange={(e) => updateSettings({ dailyReviewGoal: +e.target.value })}
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

      {apiEnabled && (
        <div className="settings-section">
          <h3>{tr.auth.syncEnabled}</h3>
          {isAuthenticated ? (
            <>
              <p className="settings-hint">{tr.auth.loggedInAs} {user?.email}</p>
              <button type="button" className="btn btn-outline btn-block" onClick={() => logout()}>
                {tr.auth.logout}
              </button>
            </>
          ) : (
            <div className="settings-actions">
              <Link to="/login" className="btn btn-primary btn-block">{tr.auth.login}</Link>
              <Link to="/register" className="btn btn-outline btn-block">{tr.auth.register}</Link>
            </div>
          )}
        </div>
      )}

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
