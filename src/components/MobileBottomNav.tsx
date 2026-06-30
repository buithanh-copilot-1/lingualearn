import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const bottomNavItems = [
  { path: '/', labelKey: 'home' as const, icon: '🏠' },
  { path: '/lessons', labelKey: 'lessons' as const, icon: '📚' },
  { path: '/vocabulary', labelKey: 'words' as const, icon: '📝' },
  { path: '/quiz', labelKey: 'quiz' as const, icon: '🎯' },
  { path: '/progress', labelKey: 'stats' as const, icon: '📊' },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { tr } = useLanguage();

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {bottomNavItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
              ? 'active'
              : ''
          }`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{tr.bottom[item.labelKey]}</span>
        </Link>
      ))}
    </nav>
  );
}
