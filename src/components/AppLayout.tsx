import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';
import { isAuthRoute, isImmersiveRoute } from '../utils/mobileLayout';

export default function AppLayout() {
  const { pathname } = useLocation();
  const immersive = isImmersiveRoute(pathname);
  const authPage = isAuthRoute(pathname);

  return (
    <>
      {!authPage && <Navbar />}
      <main className={`main-content${immersive ? ' main-immersive' : ''}`}>
        <Outlet />
      </main>
      {!authPage && !immersive && <Footer />}
      {!authPage && !immersive && <MobileBottomNav />}
    </>
  );
}
