import { useEffect, useState } from 'react';
import { speechManager, type SpeechStatus } from '../utils/speech';

export function useSpeech() {
  const [state, setState] = useState<{ status: SpeechStatus; text: string }>(() => ({
    status: speechManager.getStatus(),
    text: speechManager.getCurrentText(),
  }));

  useEffect(() => speechManager.subscribe((status, text) => {
    setState({ status, text });
  }), []);

  return {
    status: state.status,
    text: state.text,
    isSupported: speechManager.isSupported(),
    isActive: state.status === 'loading' || state.status === 'playing' || state.status === 'paused',
    speak: speechManager.speak.bind(speechManager),
    stop: speechManager.stop.bind(speechManager),
    pause: speechManager.pause.bind(speechManager),
    resume: speechManager.resume.bind(speechManager),
    togglePause: speechManager.togglePause.bind(speechManager),
  };
}
