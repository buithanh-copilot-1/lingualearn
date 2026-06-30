import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';

const navItems = [
  { path: '/', labelKey: 'home' as const },
  { path: '/lessons', labelKey: 'lessons' as const },
  { path: '/vocabulary', labelKey: 'vocabulary' as const },
  { path: '/grammar', labelKey: 'grammar' as const },
  { path: '/quiz', labelKey: 'quiz' as const },
  { path: '/progress', labelKey: 'progress' as const },
];

export default function Navbar() {
  const location = useLocation();
  const { tr } = useLanguage();
  const { isAuthenticated, apiEnabled, logout } = useAuth();
  const { progress } = useProgress();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">LinguaLearn</span>
        </Link>

        <ul className="nav-links desktop-nav">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))
                    ? 'active'
                    : ''
                }
              >
                {tr.nav[item.labelKey]}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
              {tr.nav.settings}
            </Link>
          </li>
          {apiEnabled && (
            <li>
              {isAuthenticated ? (
                <button type="button" className="nav-auth-btn" onClick={() => logout()}>
                  {tr.auth.logout}
                </button>
              ) : (
                <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
                  {tr.auth.login}
                </Link>
              )}
            </li>
          )}
        </ul>

        <div className="mobile-header-actions">
          {progress.streak > 0 && (
            <Link to="/progress" className="mobile-streak-chip" aria-label={`${progress.streak} day streak`}>
              <span aria-hidden>🔥</span>
              <span>{progress.streak}</span>
            </Link>
          )}
          <Link
            to="/settings"
            className={`mobile-icon-btn${location.pathname === '/settings' ? ' active' : ''}`}
            aria-label={tr.nav.settings}
          >
            ⚙️
          </Link>
        </div>
      </div>
    </header>
  );
}
