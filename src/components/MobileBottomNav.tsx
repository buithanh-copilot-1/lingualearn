import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { getDueWordIds } from '../utils/srs';
import { IconBook, IconStar, IconCompass, IconBell, IconUser } from './BottomNavIcons';

const sideItems = {
  left: [
    { path: '/', labelKey: 'home' as const, Icon: IconBook },
    { path: '/lessons', labelKey: 'lessons' as const, Icon: IconStar },
  ],
  right: [
    { path: '/quiz', labelKey: 'quiz' as const, Icon: IconBell, badge: true },
    { path: '/progress', labelKey: 'stats' as const, Icon: IconUser },
  ],
};

const fabItem = {
  path: '/vocabulary/study?mode=mixed',
  labelKey: 'study' as const,
  Icon: IconCompass,
};

function isActive(pathname: string, path: string): boolean {
  if (path === '/') return pathname === '/';
  const base = path.split('?')[0];
  return pathname === base || pathname.startsWith(`${base}/`);
}

function isFabActive(pathname: string): boolean {
  return pathname.startsWith('/vocabulary/study');
}

function SideNavItem({
  path,
  labelKey,
  Icon,
  badge,
  badgeCount,
}: {
  path: string;
  labelKey: 'home' | 'lessons' | 'quiz' | 'stats';
  Icon: typeof IconBook;
  badge?: boolean;
  badgeCount?: number;
}) {
  const location = useLocation();
  const { tr } = useLanguage();
  const active = isActive(location.pathname, path);

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
  const { progress } = useProgress();
  const dueCount = getDueWordIds(progress).length;
  const fabActive = isFabActive(location.pathname);

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
