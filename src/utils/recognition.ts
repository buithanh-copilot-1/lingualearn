// Thin wrapper around the Web Speech API (SpeechRecognition) for pronunciation
// practice, plus a simple word-overlap scorer to grade an attempt against a
// target sentence. SpeechRecognition is available in Chromium-based browsers
// (often prefixed as webkitSpeechRecognition) and is gracefully degraded
// elsewhere via isRecognitionSupported().

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>>;
}

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export interface Recognizer {
  start(): void;
  stop(): void;
}

export function createRecognizer(handlers: {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  lang?: string;
}): Recognizer | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = handlers.lang ?? 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript ?? '';
    handlers.onResult(transcript);
  };
  recognition.onerror = (event) => handlers.onError?.(event.error);
  recognition.onend = () => handlers.onEnd?.();

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export interface PronunciationScore {
  score: number; // 0-100
  words: { word: string; matched: boolean }[];
  transcript: string;
}

// Compares a spoken transcript against the target sentence, returning a
// per-word match map (used for highlighting) and an overall percentage.
export function scorePronunciation(target: string, transcript: string): PronunciationScore {
  const targetWords = normalizeWords(target);
  const spoken = normalizeWords(transcript);
  const spokenPool = [...spoken];

  let matchedCount = 0;
  const words = targetWords.map((word) => {
    const idx = spokenPool.indexOf(word);
    const matched = idx !== -1;
    if (matched) {
      spokenPool.splice(idx, 1);
      matchedCount++;
    }
    return { word, matched };
  });

  const score = targetWords.length === 0 ? 0 : Math.round((matchedCount / targetWords.length) * 100);
  return { score, words, transcript };
}
