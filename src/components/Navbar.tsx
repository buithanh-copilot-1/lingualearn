import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../hooks/useProgress';
import { NavbarUserActions } from './NavbarUserActions';

const navItems = [
  { path: '/', labelKey: 'home' as const },
  { path: '/lessons', labelKey: 'lessons' as const },
  { path: '/vocabulary', labelKey: 'vocabulary' as const },
  { path: '/grammar', labelKey: 'grammar' as const },
  { path: '/quiz', labelKey: 'quiz' as const },
  { path: '/practice', labelKey: 'practice' as const },
  { path: '/toeic', labelKey: 'toeic' as const },
  { path: '/progress', labelKey: 'progress' as const },
];

function isNavActive(pathname: string, path: string): boolean {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function Navbar() {
  const location = useLocation();
  const { tr } = useLanguage();
  const { progress } = useProgress();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden>L</span>
          <span className="logo-text">LinguaLearn</span>
        </Link>

        <div className="navbar-right">
          {progress.streak > 0 && (
            <Link to="/progress" className="navbar-streak-pill" title={tr.home.streak}>
              <span className="navbar-streak-icon" aria-hidden>🔥</span>
              <span className="navbar-streak-value">{progress.streak}</span>
            </Link>
          )}

          <ul className="nav-links desktop-nav">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={isNavActive(location.pathname, item.path) ? 'active' : ''}
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
          </ul>

          <NavbarUserActions compact />
        </div>
      </div>
    </nav>
  );
}
