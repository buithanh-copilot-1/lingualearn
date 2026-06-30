const IMMERSIVE_ROUTES = ['/placement', '/login', '/register'];

export function isImmersiveRoute(pathname: string): boolean {
  if (IMMERSIVE_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith('/vocabulary/study')) return true;
  if (/^\/lessons\/[^/]+/.test(pathname)) return true;
  if (/^\/grammar\/[^/]+\/practice/.test(pathname)) return true;
  return false;
}

export function isAuthRoute(pathname: string): boolean {
  return pathname === '/login' || pathname === '/register' || pathname === '/placement';
}
