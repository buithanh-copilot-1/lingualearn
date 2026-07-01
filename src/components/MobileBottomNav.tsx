import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSrs } from '../hooks/useSrs';
import { isDue } from '../utils/srs';
import { IconHome, IconLessons, IconLearn, IconReview, IconUser } from './BottomNavIcons';

const sideItems = {
  left: [
    { path: '/', labelKey: 'home' as const, Icon: IconHome },
    { path: '/lessons', labelKey: 'lessons' as const, Icon: IconLessons },
  ],
  right: [
    { path: '/review', labelKey: 'review' as const, Icon: IconReview, badge: true },
    { path: '/profile', labelKey: 'profile' as const, Icon: IconUser, matchPaths: ['/profile', '/progress', '/settings'] },
  ],
};

const fabItem = {
  path: '/practice',
  labelKey: 'practice' as const,
  Icon: IconLearn,
  matchPaths: ['/practice', '/speaking', '/dictionary', '/idioms', '/quiz', '/vocabulary', '/grammar'],
};

function isActive(pathname: string, path: string, matchPaths?: string[]): boolean {
  if (path === '/') return pathname === '/';
  const paths = matchPaths ?? [path.split('?')[0]];
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function SideNavItem({
  path,
  labelKey,
  Icon,
  badge,
  badgeCount,
  matchPaths,
}: {
  path: string;
  labelKey: 'home' | 'lessons' | 'review' | 'profile';
  Icon: typeof IconHome;
  badge?: boolean;
  badgeCount?: number;
  matchPaths?: string[];
}) {
  const location = useLocation();
  const { tr } = useLanguage();
  const active = isActive(location.pathname, path, matchPaths);

  return (
    <Link
      to={path}
      className={`bottom-nav-item${active ? ' active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      <span className="bottom-nav-icon-wrap">
        <Icon className="bottom-nav-svg" />
        {badge && badgeCount !== undefined && badgeCount > 0 && (
          <span className="bottom-nav-badge" aria-label={`${badgeCount} due`}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </span>
      <span className="bottom-nav-label">{tr.bottom[labelKey]}</span>
    </Link>
  );
}

export default function MobileBottomNav() {
  const location = useLocation();
  const { tr } = useLanguage();
  const { deck } = useSrs();
  const dueCount = Object.values(deck).filter(isDue).length;
  const fabActive = isActive(location.pathname, fabItem.path, fabItem.matchPaths);

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <div className="bottom-nav-bar">
        {sideItems.left.map((item) => (
          <SideNavItem key={item.path} {...item} />
        ))}

        <div className="bottom-nav-fab-slot">
          <Link
            to={fabItem.path}
            className={`bottom-nav-fab${fabActive ? ' active' : ''}`}
            aria-current={fabActive ? 'page' : undefined}
          >
            <span className="bottom-nav-fab-ring">
              <span className="bottom-nav-fab-btn">
                <fabItem.Icon className="bottom-nav-fab-icon" strokeWidth={1.85} />
              </span>
            </span>
            <span className="bottom-nav-fab-label">{tr.bottom[fabItem.labelKey]}</span>
          </Link>
        </div>

        {sideItems.right.map((item) => (
          <SideNavItem
            key={item.path}
            {...item}
            badgeCount={item.badge ? dueCount : undefined}
          />
        ))}
      </div>
    </nav>
  );
}
