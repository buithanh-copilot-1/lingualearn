import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '../api/notifications';
import type { Locale } from '../types';

export default function Settings() {
  const { progress, updateSettings, exportProgress, importProgress } = useProgress();
  const { user, isAuthenticated, logout } = useAuth();
  const { tr, locale, setLocale } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const { settings } = progress;

  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificationPreferences()
        .then(setPrefs)
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handlePrefChange = async (key: keyof Omit<NotificationPreferences, 'userId'>) => {
    if (!prefs) return;
    const original = { ...prefs };
    const newValue = !prefs[key];
    setPrefs({ ...prefs, [key]: newValue });
    try {
      await updateNotificationPreferences({ [key]: newValue });
    } catch {
      // revert on error
      setPrefs(original);
    }
  };

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

      {isAuthenticated && prefs && (
        <div className="settings-section">
          <h3>{tr.settings.notifications}</h3>
          <div className="settings-toggles">
            <div className="settings-toggle-row">
              <label>{tr.settings.notifStreak}</label>
              <button
                type="button"
                className={`toggle-switch ${prefs.streakReminder ? 'active' : ''}`}
                onClick={() => void handlePrefChange('streakReminder')}
                aria-label="Toggle streak reminders"
              >
                <span className="toggle-slider" />
              </button>
            </div>
            <div className="settings-toggle-row">
              <label>{tr.settings.notifGoal}</label>
              <button
                type="button"
                className={`toggle-switch ${prefs.goalAchieved ? 'active' : ''}`}
                onClick={() => void handlePrefChange('goalAchieved')}
                aria-label="Toggle goal notifications"
              >
                <span className="toggle-slider" />
              </button>
            </div>
            <div className="settings-toggle-row">
              <label>{tr.settings.notifNewContent}</label>
              <button
                type="button"
                className={`toggle-switch ${prefs.newContent ? 'active' : ''}`}
                onClick={() => void handlePrefChange('newContent')}
                aria-label="Toggle new content notifications"
              >
                <span className="toggle-slider" />
              </button>
            </div>
            <div className="settings-toggle-row">
              <label>{tr.settings.notifReview}</label>
              <button
                type="button"
                className={`toggle-switch ${prefs.reviewDue ? 'active' : ''}`}
                onClick={() => void handlePrefChange('reviewDue')}
                aria-label="Toggle review reminders"
              >
                <span className="toggle-slider" />
              </button>
            </div>
            <div className="settings-toggle-row">
              <label>{tr.settings.notifAchievements}</label>
              <button
                type="button"
                className={`toggle-switch ${prefs.achievements ? 'active' : ''}`}
                onClick={() => void handlePrefChange('achievements')}
                aria-label="Toggle achievement notifications"
              >
                <span className="toggle-slider" />
              </button>
            </div>
            <div className="settings-toggle-row">
              <label>{tr.settings.notifSystem}</label>
              <button
                type="button"
                className={`toggle-switch ${prefs.systemNotices ? 'active' : ''}`}
                onClick={() => void handlePrefChange('systemNotices')}
                aria-label="Toggle system notices"
              >
                <span className="toggle-slider" />
              </button>
            </div>
          </div>
        </div>
      )}

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
