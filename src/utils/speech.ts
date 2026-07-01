export type SpeechStatus = 'idle' | 'playing' | 'paused';

export interface SpeechState {
  id: string | null;
  status: SpeechStatus;
}

type SpeechListener = (state: SpeechState) => void;

const listeners = new Set<SpeechListener>();
let state: SpeechState = { id: null, status: 'idle' };

let currentAudio: HTMLAudioElement | null = null;
// Whether a speechSynthesis utterance is currently loaded (playing or paused).
// We avoid calling cancel() unless we actually mean to discard it, since
// cancel() makes the utterance unresumable.
let hasUtterance = false;

function notify() {
  listeners.forEach((fn) => fn(state));
}

function setState(next: SpeechState) {
  state = next;
  notify();
}

export function subscribeSpeech(listener: SpeechListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSpeechState(): SpeechState {
  return state;
}

/** @deprecated Use getSpeechState().id */
export function getActiveSpeechId() {
  return state.id;
}

/** Fully discard any current/paused playback and forget the resume position. */
function resetPlayback() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (hasUtterance && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  hasUtterance = false;
  setState({ id: null, status: 'idle' });
}

/**
 * Pause playback in place (audio currentTime / TTS position preserved) so a
 * later playSpeech() call with the same id resumes from here instead of
 * restarting from the beginning.
 */
export function stopSpeech() {
  if (state.status !== 'playing') return;
  if (currentAudio) {
    currentAudio.pause();
  } else if (hasUtterance && 'speechSynthesis' in window) {
    window.speechSynthesis.pause();
  }
  setState({ ...state, status: 'paused' });
}

/** Fully stop and reset playback, discarding any resume position. */
export function resetSpeech() {
  resetPlayback();
}

function speakTts(text: string, id: string): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      setState({ id: null, status: 'idle' });
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.onend = () => {
      hasUtterance = false;
      if (state.id === id) setState({ id: null, status: 'idle' });
      resolve();
    };
    utterance.onerror = () => {
      hasUtterance = false;
      if (state.id === id) setState({ id: null, status: 'idle' });
      resolve();
    };
    hasUtterance = true;
    window.speechSynthesis.speak(utterance);
  });
}

export async function playSpeech(
  text: string,
  options?: { audioUrl?: string; id?: string },
): Promise<void> {
  const id = options?.id ?? text;

  // Resume exactly where playback was paused, instead of starting over.
  if (state.id === id && state.status === 'paused') {
    if (currentAudio) {
      setState({ id, status: 'playing' });
      try {
        await currentAudio.play();
      } catch {
        resetPlayback();
      }
      return;
    }
    if (hasUtterance && 'speechSynthesis' in window) {
      setState({ id, status: 'playing' });
      window.speechSynthesis.resume();
      return;
    }
  }

  // Starting something new (or the previous resource is gone) — discard
  // whatever was playing/paused before and start fresh.
  resetPlayback();
  setState({ id, status: 'playing' });

  if (options?.audioUrl) {
    try {
      const audio = new Audio(options.audioUrl);
      currentAudio = audio;
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('audio failed'));
        void audio.play().catch(reject);
      });
      if (state.id === id) setState({ id: null, status: 'idle' });
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
