import { useEffect, useId, useRef } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { useLanguage } from '../context/LanguageContext';

interface ListeningPlayerProps {
  script: string;
  stepKey: string;
  autoPlay: boolean;
  onAutoPlayChange: (value: boolean) => void;
}

export default function ListeningPlayer({
  script,
  stepKey,
  autoPlay,
  onAutoPlayChange,
}: ListeningPlayerProps) {
  const { tr } = useLanguage();
  const lt = tr.listening;
  const { status, isSupported, isActive, speak, stop, togglePause } = useSpeech();
  const autoPlayRef = useRef(autoPlay);
  const prevStepKey = useRef(stepKey);
  const toggleId = useId();

  autoPlayRef.current = autoPlay;

  useEffect(() => {
    if (prevStepKey.current === stepKey) return;
    prevStepKey.current = stepKey;
    stop();
    if (autoPlayRef.current && script.trim()) {
      speak(script, 0.82);
    }
  }, [stepKey, script, speak, stop]);

  useEffect(() => () => stop(), [stop]);

  if (!isSupported) {
    return (
      <div className="listening-player listening-player--unsupported">
        <p>{lt.unsupported}</p>
      </div>
    );
  }

  const isPlaying = status === 'playing' || status === 'loading';
  const isPaused = status === 'paused';
  const hasError = status === 'error';

  function handlePlay() {
    if (status === 'loading') return;
    if (isPaused) {
      togglePause();
      return;
    }
    speak(script, 0.82);
  }

  function handleStop() {
    stop();
  }

  function handleToggleAutoPlay(checked: boolean) {
    onAutoPlayChange(checked);
    if (checked && script.trim() && !isActive) {
      speak(script, 0.82);
    }
    if (!checked) {
      stop();
    }
  }

  const statusLabel =
    status === 'loading' ? lt.loading
    : status === 'playing' ? lt.playing
    : status === 'paused' ? lt.paused
    : status === 'error' ? lt.error
    : lt.ready;

  return (
    <div className={`listening-player${isPlaying ? ' listening-player--active' : ''}${hasError ? ' listening-player--error' : ''}`}>
      <div className="listening-player__visual" aria-hidden>
        <span className={`listening-wave${isPlaying ? ' listening-wave--live' : ''}`} />
        <span className={`listening-wave${isPlaying ? ' listening-wave--live' : ''}`} />
        <span className={`listening-wave${isPlaying ? ' listening-wave--live' : ''}`} />
      </div>

      <div className="listening-player__body">
        <p className="listening-player__status" aria-live="polite">{statusLabel}</p>
        <p className="listening-player__script">"{script}"</p>
      </div>

      <div className="listening-player__controls">
        <button
          type="button"
          className="listening-btn listening-btn--primary"
          onClick={handlePlay}
          disabled={status === 'loading'}
          aria-label={isPaused ? lt.resume : lt.play}
        >
          {status === 'loading' ? '…' : isPaused ? '▶️' : isPlaying ? '🔊' : '▶️'}
          <span>{isPaused ? lt.resume : isPlaying ? lt.playing : lt.play}</span>
        </button>

        <button
          type="button"
          className="listening-btn listening-btn--secondary"
          onClick={handleStop}
          disabled={!isActive}
          aria-label={lt.stop}
        >
          ⏹️ <span>{lt.stop}</span>
        </button>

        {isPlaying && (
          <button
            type="button"
            className="listening-btn listening-btn--secondary"
            onClick={() => togglePause()}
            aria-label={lt.pause}
          >
            ⏸️ <span>{lt.pause}</span>
          </button>
        )}
      </div>

      <label className="listening-player__autoplay" htmlFor={toggleId}>
        <input
          id={toggleId}
          type="checkbox"
          checked={autoPlay}
          onChange={(e) => handleToggleAutoPlay(e.target.checked)}
        />
        {lt.autoPlay}
      </label>

      {hasError && (
        <p className="listening-player__hint">{lt.errorHint}</p>
      )}
    </div>
  );
}
