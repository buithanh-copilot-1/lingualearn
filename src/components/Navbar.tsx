import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', labelKey: 'home' as const, icon: '🏠' },
  { path: '/lessons', labelKey: 'lessons' as const, icon: '📚' },
  { path: '/vocabulary', labelKey: 'vocabulary' as const, icon: '📝' },
  { path: '/grammar', labelKey: 'grammar' as const, icon: '✏️' },
  { path: '/quiz', labelKey: 'quiz' as const, icon: '🎯' },
  { path: '/progress', labelKey: 'progress' as const, icon: '📊' },
];

export default function Navbar() {
  const location = useLocation();
  const { tr } = useLanguage();
  const { isAuthenticated, apiEnabled, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <nav className="navbar">
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
                className={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)) ? 'active' : ''}
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

        <button
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className="menu-bar" />
          <span className="menu-bar" />
          <span className="menu-bar" />
        </button>
      </div>

      <div
        className={`mobile-menu-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          {[...navItems, { path: '/settings', labelKey: 'settings' as const, icon: '⚙️' }].map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                <span className="mobile-nav-icon">{item.icon}</span>
                {tr.nav[item.labelKey]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
