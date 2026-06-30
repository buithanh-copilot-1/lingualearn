import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const bottomNavItems = [
  { path: '/', labelKey: 'home' as const, icon: '🏠' },
  { path: '/lessons', labelKey: 'lessons' as const, icon: '📚' },
  { path: '/vocabulary', labelKey: 'words' as const, icon: '📝' },
  { path: '/quiz', labelKey: 'quiz' as const, icon: '🎯' },
  { path: '/progress', labelKey: 'stats' as const, icon: '📊' },
];

function isActive(pathname: string, path: string): boolean {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function MobileBottomNav() {
  const location = useLocation();
  const { tr } = useLanguage();

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <div className="bottom-nav-inner">
        {bottomNavItems.map((item) => {
          const active = isActive(location.pathname, item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item${active ? ' active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="bottom-nav-icon" aria-hidden>{item.icon}</span>
              <span className="bottom-nav-label">{tr.bottom[item.labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
