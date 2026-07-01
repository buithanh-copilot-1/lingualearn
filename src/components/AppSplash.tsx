import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const MIN_VISIBLE_MS = 650;
const FADE_MS = 450;
const SAFETY_TIMEOUT_MS = 6000;

/**
 * Hides the static splash screen (rendered directly in index.html so it
 * appears instantly, before the JS bundle loads) once the app has finished
 * its initial auth check. Enforces a minimum visible time so the splash
 * doesn't just flash on fast connections.
 */
export default function AppSplash() {
  const { isLoading } = useAuth();
  const mountedAtRef = useRef(Date.now());
  const hiddenRef = useRef(false);

  const hideSplash = () => {
    if (hiddenRef.current) return;
    hiddenRef.current = true;
    const el = document.getElementById('app-splash');
    if (!el) return;
    el.classList.add('app-splash-hidden');
    window.setTimeout(() => el.remove(), FADE_MS);
  };

  useEffect(() => {
    const safety = window.setTimeout(hideSplash, SAFETY_TIMEOUT_MS);
    return () => window.clearTimeout(safety);
  }, []);

  useEffect(() => {
    if (isLoading) return undefined;
    const elapsed = Date.now() - mountedAtRef.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const timer = window.setTimeout(hideSplash, wait);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  return null;
}
