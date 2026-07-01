import { useEffect, useState } from 'react';
import { getActiveSpeechId, subscribeSpeech } from '../utils/speech';

export function useSpeechState(id?: string) {
  const [activeId, setActiveId] = useState<string | null>(getActiveSpeechId);

  useEffect(() => subscribeSpeech(setActiveId), []);

  return {
    activeId,
    isSpeaking: id ? activeId === id : activeId !== null,
  };
}
