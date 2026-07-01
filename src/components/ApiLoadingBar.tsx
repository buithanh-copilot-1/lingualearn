import { useEffect, useState } from 'react';
import { useApiActivity } from '../hooks/useApiActivity';

const SHOW_DELAY_MS = 120;
const HIDE_DELAY_MS = 300;
const TRICKLE_MS = 220;

/**
 * Thin progress bar fixed to the top of the screen, shown while any API
 * request (backend, dictionary, translate) is in flight. Mimics the
 * familiar YouTube/GitHub-style top loader: quick trickle up to ~90%
 * while waiting, then a fast jump to 100% and fade-out on completion.
 */
export default function ApiLoadingBar() {
  const active = useApiActivity();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    const showTimer = window.setTimeout(() => {
      setVisible(true);
      setProgress(20);
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(showTimer);
  }, [active]);

  useEffect(() => {
    if (!visible) return undefined;

    if (!active) {
      setProgress(100);
      const hideTimer = window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, HIDE_DELAY_MS);
      return () => window.clearTimeout(hideTimer);
    }

    const trickle = window.setInterval(() => {
      setProgress((p) => (p < 88 ? p + (88 - p) * 0.15 : p));
    }, TRICKLE_MS);
    return () => window.clearInterval(trickle);
  }, [visible, active]);

  if (!visible) return null;

  return (
    <div className="api-loading-bar" role="status" aria-live="polite" aria-label="Loading">
      <div
        className={`api-loading-bar-fill${!active ? ' is-complete' : ''}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
