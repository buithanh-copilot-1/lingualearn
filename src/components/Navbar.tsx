import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

function getInitials(nameOrEmail?: string | null): string {
  if (!nameOrEmail) return 'U';
  // Remove Vietnamese diacritics / tone marks
  const clean = nameOrEmail.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (clean.includes('@')) {
    const parts = clean.split('@')[0];
    return parts.substring(0, 2).toUpperCase();
  }
  const words = clean.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
}

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

  const initials = getInitials(user?.displayName || user?.email);

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

        <div className="navbar-right">
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
                      <svg className="dropdown-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {tr.nav.profile}
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <svg className="dropdown-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      {tr.nav.settings}
                    </Link>
                    <div className="dropdown-divider" />
                    <button
                      type="button"
                      className="dropdown-item logout"
                      onClick={() => void logout()}
                    >
                      <svg className="dropdown-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
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
                      <svg className="dropdown-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {tr.nav.profile}
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <svg className="dropdown-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      {tr.nav.settings}
                    </Link>
                    <div className="dropdown-divider" />
                    <button
                      type="button"
                      className="dropdown-item logout"
                      onClick={() => void logout()}
                    >
                      <svg className="dropdown-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
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
