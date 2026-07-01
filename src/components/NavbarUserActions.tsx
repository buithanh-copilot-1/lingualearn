import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationBell from './NotificationBell';

export function getNavInitials(nameOrEmail?: string | null): string {
  if (!nameOrEmail) return 'U';
  const clean = nameOrEmail.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (clean.includes('@')) {
    return clean.split('@')[0].substring(0, 2).toUpperCase();
  }
  const words = clean.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
}

interface AvatarMenuProps {
  compact?: boolean;
  onNavigate?: () => void;
}

export function NavbarUserActions({ compact = false, onNavigate }: AvatarMenuProps) {
  const { tr } = useLanguage();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const initials = getNavInitials(user?.displayName || user?.email);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (isLoading) {
    return (
      <div className="navbar-user-actions" aria-hidden>
        <span className="navbar-user-skeleton" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="navbar-user-actions">
        <Link to="/auth" className="btn btn-sm btn-primary navbar-login-btn" onClick={onNavigate}>
          {tr.nav.login}
        </Link>
      </div>
    );
  }

  return (
    <div className="navbar-user-actions">
      <NotificationBell />
      <div className="nav-avatar-wrapper" ref={wrapperRef}>
        <button
          type="button"
          className="nav-avatar-btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          title={user?.displayName || user?.email || tr.nav.profile}
        >
          <div className={`nav-avatar-circle ${compact ? 'small' : ''}`}>{initials}</div>
        </button>

        {open && (
          <div className="avatar-dropdown" role="menu">
            <div className="dropdown-header">
              <div className="dropdown-name">{user?.displayName || 'User'}</div>
              <div className="dropdown-email">{user?.email}</div>
            </div>
            <div className="dropdown-divider" />
            <Link to="/profile" className="dropdown-item" role="menuitem" onClick={() => { setOpen(false); onNavigate?.(); }}>
              <svg className="dropdown-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {tr.nav.profile}
            </Link>
            <Link to="/settings" className="dropdown-item" role="menuitem" onClick={() => { setOpen(false); onNavigate?.(); }}>
              <svg className="dropdown-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              {tr.nav.settings}
            </Link>
            <div className="dropdown-divider" />
            <button
              type="button"
              className="dropdown-item logout"
              role="menuitem"
              onClick={() => { setOpen(false); void logout(); onNavigate?.(); }}
            >
              <svg className="dropdown-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
  );
}
