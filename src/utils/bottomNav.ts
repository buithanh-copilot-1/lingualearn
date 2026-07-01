export type BottomNavTab = 'home' | 'lessons' | 'learn' | 'review' | 'profile';

/** Exactly one bottom tab is active per route — matches the menu the user opened. */
export function resolveBottomNavTab(pathname: string): BottomNavTab | null {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/lessons')) return 'lessons';
  if (pathname.startsWith('/review') || pathname.startsWith('/vocabulary/study')) return 'review';
  if (
    pathname.startsWith('/profile') ||
    pathname.startsWith('/progress') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/auth')
  ) {
    return 'profile';
  }
  if (
    pathname.startsWith('/practice') ||
    pathname.startsWith('/speaking') ||
    pathname.startsWith('/dictionary') ||
    pathname.startsWith('/idioms') ||
    pathname.startsWith('/quiz') ||
    pathname.startsWith('/vocabulary') ||
    pathname.startsWith('/grammar') ||
    pathname.startsWith('/toeic')
  ) {
    return 'learn';
  }
  return null;
}

export const bottomNavRoutes: Record<BottomNavTab, string> = {
  home: '/',
  lessons: '/lessons',
  learn: '/practice',
  review: '/review',
  profile: '/profile',
};
