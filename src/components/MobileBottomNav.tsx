import { Link, useLocation } from 'react-router-dom';

const bottomNavItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/lessons', label: 'Lessons', icon: '📚' },
  { path: '/vocabulary', label: 'Words', icon: '📝' },
  { path: '/quiz', label: 'Quiz', icon: '🎯' },
  { path: '/progress', label: 'Stats', icon: '📊' },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {bottomNavItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
