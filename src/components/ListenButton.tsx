import type { MouseEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSpeechState } from '../hooks/useSpeech';
import { playSpeech, stopSpeech } from '../utils/speech';
import SoundWave from './SoundWave';

interface Props {
  text: string;
  label: string;
  audioUrl?: string;
  id?: string;
  variant?: 'default' | 'icon' | 'large' | 'outline';
  className?: string;
  stopPropagation?: boolean;
}

export default function ListenButton({
  text,
  label,
  audioUrl,
  id,
  variant = 'default',
  className = '',
  stopPropagation = false,
}: Props) {
  const { tr } = useLanguage();
  const speechId = id ?? (audioUrl ? `audio:${text}` : text);
  const { isSpeaking } = useSpeechState(speechId);

  function handlePlay(e: MouseEvent<HTMLButtonElement>) {
    if (stopPropagation) e.stopPropagation();
    void playSpeech(text, { audioUrl, id: speechId });
  }

  function handleStop(e: MouseEvent<HTMLButtonElement>) {
    if (stopPropagation) e.stopPropagation();
    stopSpeech();
  }

  if (variant === 'icon') {
    return (
      <div className={`listen-btn-group listen-btn-group-icon ${className}`}>
        <button
          type="button"
          className={`listen-btn listen-btn-icon ${isSpeaking ? 'listen-btn-active' : ''}`}
          aria-label={label}
          aria-pressed={isSpeaking}
          onClick={handlePlay}
          disabled={isSpeaking}
        >
          <SoundWave active={isSpeaking} size="sm" />
        </button>
        {isSpeaking && (
          <button
            type="button"
            className="listen-btn listen-btn-icon listen-btn-stop"
            aria-label={tr.common.stop}
            onClick={handleStop}
          >
            ⏹
          </button>
        )}
      </div>
    );
  }

  const btnClass = [
    'listen-btn',
    variant === 'large'
      ? 'listen-btn-lg'
      : variant === 'outline'
        ? 'btn btn-outline'
        : variant === 'default'
          ? 'btn btn-sm btn-outline'
          : '',
    isSpeaking ? 'listen-btn-active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`listen-btn-group ${className}`}>
      <button
        type="button"
        className={btnClass}
        aria-pressed={isSpeaking}
        onClick={handlePlay}
        disabled={isSpeaking}
      >
        <SoundWave active={isSpeaking} size={variant === 'large' ? 'md' : 'sm'} />
        <span className="listen-btn-label">
          {isSpeaking ? tr.common.listening : label}
        </span>
      </button>
      {isSpeaking && (
        <button
          type="button"
          className={`listen-btn listen-btn-stop ${variant === 'outline' || variant === 'default' ? 'btn btn-sm btn-outline' : ''}`}
          onClick={handleStop}
        >
          ⏹ <span className="listen-btn-label">{tr.common.stop}</span>
        </button>
      )}
    </div>
  );
}
