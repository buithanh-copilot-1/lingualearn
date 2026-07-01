import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const bottomNavItems = [
  { path: '/', labelKey: 'home' as const, icon: '🏠' },
  { path: '/lessons', labelKey: 'lessons' as const, icon: '📚' },
  { path: '/vocabulary', labelKey: 'words' as const, icon: '📝' },
  {
    path: '/practice',
    labelKey: 'practice' as const,
    icon: '🎯',
    matchPaths: ['/practice', '/review', '/speaking', '/dictionary', '/idioms'],
  },
  { path: '/progress', labelKey: 'stats' as const, icon: '📊' },
];

function isNavActive(pathname: string, item: (typeof bottomNavItems)[number]) {
  if (item.path === '/') return pathname === '/';
  const paths = item.matchPaths ?? [item.path];
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default function MobileBottomNav() {
  const location = useLocation();
  const { tr } = useLanguage();

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {bottomNavItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${isNavActive(location.pathname, item) ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{tr.bottom[item.labelKey]}</span>
        </Link>
      ))}
    </nav>
  );
}
