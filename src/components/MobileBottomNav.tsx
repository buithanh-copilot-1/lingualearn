import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSrs } from '../hooks/useSrs';
import { isDue } from '../utils/srs';
import { resolveBottomNavTab, type BottomNavTab } from '../utils/bottomNav';
import { IconHome, IconLessons, IconLearn, IconReview, IconUser } from './BottomNavIcons';

const sideItems = {
  left: [
    { tab: 'home' as const, path: '/', labelKey: 'home' as const, Icon: IconHome },
    { tab: 'lessons' as const, path: '/lessons', labelKey: 'lessons' as const, Icon: IconLessons },
  ],
  right: [
    { tab: 'review' as const, path: '/review', labelKey: 'review' as const, Icon: IconReview, badge: true },
    { tab: 'profile' as const, path: '/profile', labelKey: 'profile' as const, Icon: IconUser },
  ],
};

const fabItem = {
  tab: 'learn' as const,
  path: '/practice',
  labelKey: 'practice' as const,
  Icon: IconLearn,
};

function SideNavItem({
  tab,
  path,
  labelKey,
  Icon,
  activeTab,
  badge,
  badgeCount,
}: {
  tab: BottomNavTab;
  path: string;
  labelKey: 'home' | 'lessons' | 'review' | 'profile';
  Icon: typeof IconHome;
  activeTab: BottomNavTab | null;
  badge?: boolean;
  badgeCount?: number;
}) {
  const { tr } = useLanguage();
  const active = activeTab === tab;

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
  const activeTab = resolveBottomNavTab(location.pathname);
  const fabActive = activeTab === fabItem.tab;

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <div className="bottom-nav-bar">
        {sideItems.left.map((item) => (
          <SideNavItem key={item.tab} {...item} activeTab={activeTab} />
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
            key={item.tab}
            {...item}
            activeTab={activeTab}
            badgeCount={item.badge ? dueCount : undefined}
          />
        ))}
      </div>
    </nav>
  );
}
