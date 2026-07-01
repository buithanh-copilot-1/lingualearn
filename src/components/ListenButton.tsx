import type { MouseEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSpeechState } from '../hooks/useSpeech';
import { playSpeech } from '../utils/speech';
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

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (stopPropagation) e.stopPropagation();
    void playSpeech(text, { audioUrl, id: speechId });
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={`listen-btn listen-btn-icon ${isSpeaking ? 'listen-btn-active' : ''} ${className}`}
        aria-label={label}
        aria-pressed={isSpeaking}
        onClick={handleClick}
      >
        <SoundWave active={isSpeaking} size="sm" />
      </button>
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
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={btnClass}
      aria-pressed={isSpeaking}
      onClick={handleClick}
    >
      <SoundWave active={isSpeaking} size={variant === 'large' ? 'md' : 'sm'} />
      <span className="listen-btn-label">
        {isSpeaking ? tr.common.listening : label}
      </span>
    </button>
  );
}
