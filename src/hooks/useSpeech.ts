import { useEffect, useState } from 'react';
import { getSpeechState, subscribeSpeech, type SpeechState } from '../utils/speech';

export function useSpeechState(id?: string) {
  const [state, setState] = useState<SpeechState>(getSpeechState);

  useEffect(() => subscribeSpeech(setState), []);

  const isMatch = id ? state.id === id : state.id !== null;

  return {
    activeId: state.id,
    isSpeaking: isMatch && state.status === 'playing',
    isPaused: isMatch && state.status === 'paused',
  };
}
