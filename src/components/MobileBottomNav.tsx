import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSrs } from '../hooks/useSrs';
import { isDue } from '../utils/srs';
import { resolveBottomNavTab, type BottomNavTab } from '../utils/bottomNav';
import { IconHome, IconLessons, IconLearn, IconReview, IconUser } from './BottomNavIcons';

const navTabs: Array<{
  tab: BottomNavTab;
  path: string;
  labelKey: 'home' | 'lessons' | 'practice' | 'review' | 'profile';
  Icon: typeof IconHome;
  badge?: boolean;
}> = [
  { tab: 'home', path: '/', labelKey: 'home', Icon: IconHome },
  { tab: 'lessons', path: '/lessons', labelKey: 'lessons', Icon: IconLessons },
  { tab: 'learn', path: '/practice', labelKey: 'practice', Icon: IconLearn },
  { tab: 'review', path: '/review', labelKey: 'review', Icon: IconReview, badge: true },
  { tab: 'profile', path: '/profile', labelKey: 'profile', Icon: IconUser },
];

function BottomNavTabItem({
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
  labelKey: 'home' | 'lessons' | 'practice' | 'review' | 'profile';
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
      className={`bottom-nav-tab${active ? ' active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      <span className="bottom-nav-tab-ring">
        <span className="bottom-nav-tab-btn">
          <Icon className="bottom-nav-tab-icon" strokeWidth={active ? 2 : 1.65} />
        </span>
        {badge && badgeCount !== undefined && badgeCount > 0 && (
          <span className="bottom-nav-badge" aria-label={`${badgeCount} due`}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </span>
      <span className="bottom-nav-tab-label">{tr.bottom[labelKey]}</span>
    </Link>
  );
}

export default function MobileBottomNav() {
  const location = useLocation();
  const { deck } = useSrs();
  const dueCount = Object.values(deck).filter(isDue).length;
  const activeTab = resolveBottomNavTab(location.pathname);

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <div className="bottom-nav-bar">
        {navTabs.map((item) => (
          <BottomNavTabItem
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
