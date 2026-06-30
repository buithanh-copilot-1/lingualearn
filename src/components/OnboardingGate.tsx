import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';
import { isApiConfigured, syncFullProgress } from '../api/client';

const PUBLIC_PATHS = ['/placement', '/login', '/register'];

export function OnboardingGate() {
  const { progress } = useProgress();
  const location = useLocation();

  if (!progress.settings.onboardingComplete && !PUBLIC_PATHS.includes(location.pathname)) {
    return <Navigate to="/placement" replace />;
  }

  return <Outlet />;
}

export function ProgressSync() {
  const { progress } = useProgress();
  const { isAuthenticated } = useAuth();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isApiConfigured()) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      syncFullProgress(progress).catch(() => undefined);
    }, 2000);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [progress, isAuthenticated]);

  return null;
}
