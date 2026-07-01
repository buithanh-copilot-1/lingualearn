type SpeechListener = (activeId: string | null) => void;

const listeners = new Set<SpeechListener>();
let activeId: string | null = null;
let currentAudio: HTMLAudioElement | null = null;

function notify() {
  listeners.forEach((fn) => fn(activeId));
}

function setActive(id: string | null) {
  activeId = id;
  notify();
}

export function subscribeSpeech(listener: SpeechListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getActiveSpeechId() {
  return activeId;
}

export function stopSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  setActive(null);
}

function speakTts(text: string, id: string): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      setActive(null);
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.onend = () => {
      if (activeId === id) setActive(null);
      resolve();
    };
    utterance.onerror = () => {
      if (activeId === id) setActive(null);
      resolve();
    };
    window.speechSynthesis.speak(utterance);
  });
}

export async function playSpeech(
  text: string,
  options?: { audioUrl?: string; id?: string },
): Promise<void> {
  const id = options?.id ?? text;
  stopSpeech();
  setActive(id);

  if (options?.audioUrl) {
    try {
      const audio = new Audio(options.audioUrl);
      currentAudio = audio;
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('audio failed'));
        void audio.play().catch(reject);
      });
      if (activeId === id) setActive(null);
      currentAudio = null;
      return;
    } catch {
      currentAudio = null;
    }
  }

  await speakTts(text, id);
}

/** @deprecated Use playSpeech or ListenButton */
export function speakWord(text: string) {
  void playSpeech(text);
}
