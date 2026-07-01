import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Profile() {
  const { user, updateProfile, logout, isAuthenticated } = useAuth();
  const { locale } = useLanguage();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect to Auth if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  function getInitials(nameOrEmail?: string | null): string {
    if (!nameOrEmail) return 'U';
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

  const initials = getInitials(user.displayName || user.email);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage(locale === 'vi' ? 'Tên hiển thị không được để trống' : 'Display name cannot be empty');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    try {
      await updateProfile(displayName);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update profile');
      setStatus('error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="page profile-page">
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1>{locale === 'vi' ? 'Thông tin cá nhân' : 'Personal Profile'}</h1>
        <p>{locale === 'vi' ? 'Quản lý tài khoản và thông tin học tập của bạn.' : 'Manage your account and study details.'}</p>
      </div>

      <div className="profile-container" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div className="card-pop" style={{
          background: 'var(--surface)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}>
          {/* Avatar Area */}
          <div className="profile-avatar-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div className="nav-avatar-circle" style={{ width: '80px', height: '80px', fontSize: '1.75rem', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}>
              {initials}
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: '0' }}>
                {user.displayName || (locale === 'vi' ? 'Học viên LinguaLearn' : 'LinguaLearn Student')}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{user.email}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={(e) => void handleSave(e)} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="settings-goal-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {locale === 'vi' ? 'Tên hiển thị:' : 'Display Name:'}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: 'var(--bg)',
                  fontFamily: 'inherit',
                  color: 'var(--text)'
                }}
              />
            </div>

            <div className="settings-goal-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Email (ID):
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: 'rgba(226, 232, 240, 0.5)',
                  color: 'var(--text-muted)',
                  cursor: 'not-allowed',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
              🗓️ {locale === 'vi' ? 'Thành viên từ:' : 'Member since:'} <strong>{formatDate(user.createdAt)}</strong>
            </div>

            {/* Status alerts */}
            {status === 'success' && (
              <div style={{ color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '6px' }}>
                ✓ {locale === 'vi' ? 'Cập nhật thông tin thành công!' : 'Profile updated successfully!'}
              </div>
            )}
            {status === 'error' && (
              <div style={{ color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '6px' }}>
                × {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn btn-primary btn-block"
              style={{ padding: '0.75rem', fontSize: '0.95rem', fontWeight: 700 }}
            >
              {status === 'loading'
                ? (locale === 'vi' ? 'Đang lưu...' : 'Saving...')
                : (locale === 'vi' ? 'Lưu thay đổi' : 'Save Changes')}
            </button>
          </form>

          {/* Action Divider */}
          <div style={{ width: '100%', height: '1px', background: 'var(--border)' }} />

          {/* Logout Button */}
          <button
            type="button"
            className="btn btn-outline btn-block"
            onClick={() => void handleLogout()}
            style={{
              padding: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--danger)',
              borderColor: 'var(--danger)',
              background: 'transparent'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            🚪 {locale === 'vi' ? 'Đăng xuất tài khoản' : 'Sign Out Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
