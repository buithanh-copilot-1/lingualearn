import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const navItems = [
  { path: '/', labelKey: 'home' as const, icon: '🏠' },
  { path: '/lessons', labelKey: 'lessons' as const, icon: '📚' },
  { path: '/vocabulary', labelKey: 'vocabulary' as const, icon: '📝' },
  { path: '/grammar', labelKey: 'grammar' as const, icon: '✏️' },
  { path: '/quiz', labelKey: 'quiz' as const, icon: '🎯' },
  { path: '/practice', labelKey: 'practice' as const, icon: '🎧' },
  { path: '/progress', labelKey: 'progress' as const, icon: '📊' },
];

export default function Navbar() {
  const location = useLocation();
  const { tr } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [avatarMenuOpenMobile, setAvatarMenuOpenMobile] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const avatarRefMobile = useRef<HTMLDivElement>(null);

  const initials = user?.displayName
    ? user.displayName.substring(0, 2).toUpperCase()
    : user?.email.substring(0, 2).toUpperCase() || 'U';

  useEffect(() => {
    setMenuOpen(false);
    setAvatarMenuOpen(false);
    setAvatarMenuOpenMobile(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Click outside listener for desktop avatar dropdown
  useEffect(() => {
    if (!avatarMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [avatarMenuOpen]);

  // Click outside listener for mobile avatar dropdown
  useEffect(() => {
    if (!avatarMenuOpenMobile) return;
    function handleClickOutside(e: MouseEvent) {
      if (avatarRefMobile.current && !avatarRefMobile.current.contains(e.target as Node)) {
        setAvatarMenuOpenMobile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [avatarMenuOpenMobile]);

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
          {isAuthenticated && (
            <li className="nav-notification-item">
              <NotificationBell />
            </li>
          )}
          <li>
            {isAuthenticated ? (
              <div className="nav-avatar-wrapper" ref={avatarRef}>
                <button
                  type="button"
                  className="nav-avatar-btn"
                  onClick={() => setAvatarMenuOpen((o) => !o)}
                  aria-expanded={avatarMenuOpen}
                  title={user?.displayName || user?.email}
                >
                  <div className="nav-avatar-circle">
                    {initials}
                  </div>
                </button>

                {avatarMenuOpen && (
                  <div className="avatar-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-name">{user?.displayName || 'User'}</div>
                      <div className="dropdown-email">{user?.email}</div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item">
                      <span className="dropdown-icon">👤</span>
                      {tr.nav.profile}
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <span className="dropdown-icon">⚙️</span>
                      {tr.nav.settings}
                    </Link>
                    <div className="dropdown-divider" />
                    <button
                      type="button"
                      className="dropdown-item logout"
                      onClick={() => void logout()}
                    >
                      <span className="dropdown-icon">🚪</span>
                      {tr.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className={location.pathname === '/auth' ? 'active' : ''}>
                {tr.nav.login}
              </Link>
            )}
          </li>
        </ul>

        {isAuthenticated && (
          <div className="mobile-nav-actions">
            <NotificationBell />
            <div className="nav-avatar-wrapper" ref={avatarRefMobile}>
              <button
                type="button"
                className="nav-avatar-btn"
                onClick={() => setAvatarMenuOpenMobile((o) => !o)}
                aria-expanded={avatarMenuOpenMobile}
                title={user?.displayName || user?.email}
              >
                <div className="nav-avatar-circle small">
                  {initials}
                </div>
              </button>

              {avatarMenuOpenMobile && (
                <div className="avatar-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{user?.displayName || 'User'}</div>
                    <div className="dropdown-email">{user?.email}</div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item">
                    <span className="dropdown-icon">👤</span>
                    {tr.nav.profile}
                  </Link>
                  <Link to="/settings" className="dropdown-item">
                    <span className="dropdown-icon">⚙️</span>
                    {tr.nav.settings}
                  </Link>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item logout"
                    onClick={() => void logout()}
                  >
                    <span className="dropdown-icon">🚪</span>
                    {tr.nav.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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
          {[
            ...navItems,
            ...(isAuthenticated ? [{ path: '/profile', labelKey: 'profile' as const, icon: '👤' }] : []),
            { path: '/settings', labelKey: 'settings' as const, icon: '⚙️' }
          ].map((item) => (
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
          <li>
            {isAuthenticated ? (
              <button
                type="button"
                className="mobile-nav-auth"
                onClick={() => { void logout(); setMenuOpen(false); }}
              >
                <span className="mobile-nav-icon">🚪</span>
                {tr.nav.logout}
              </button>
            ) : (
              <Link to="/auth" className={location.pathname === '/auth' ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                <span className="mobile-nav-icon">👤</span>
                {tr.nav.login}
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
