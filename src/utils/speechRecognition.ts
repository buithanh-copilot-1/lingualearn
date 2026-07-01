export type RecognitionStatus = 'idle' | 'listening' | 'processing' | 'error';

type RecognitionListener = (status: RecognitionStatus, transcript: string) => void;

interface RecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((this: RecognitionInstance, ev: Event) => void) | null;
  onend: ((this: RecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: RecognitionInstance, ev: RecognitionResultEvent) => void) | null;
  onerror: ((this: RecognitionInstance, ev: RecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface RecognitionResultEvent extends Event {
  resultIndex: number;
  results: { length: number; [i: number]: { isFinal: boolean; [j: number]: { transcript: string } } };
}

interface RecognitionErrorEvent extends Event {
  error: string;
}

type RecognitionCtor = new () => RecognitionInstance;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

class SpeechRecognitionManager {
  private listeners = new Set<RecognitionListener>();
  private status: RecognitionStatus = 'idle';
  private transcript = '';
  private recognition: RecognitionInstance | null = null;

  isSupported(): boolean {
    return getRecognitionCtor() !== null;
  }

  getStatus(): RecognitionStatus {
    return this.status;
  }

  getTranscript(): string {
    return this.transcript;
  }

  subscribe(listener: RecognitionListener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.transcript);
    return () => this.listeners.delete(listener);
  }

  private emit(status: RecognitionStatus, transcript?: string) {
    this.status = status;
    if (transcript !== undefined) this.transcript = transcript;
    for (const listener of this.listeners) {
      listener(this.status, this.transcript);
    }
  }

  private ensureRecognition(): RecognitionInstance | null {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return null;

    if (!this.recognition) {
      const recognition = new Ctor();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => this.emit('listening', '');

      recognition.onresult = (event: RecognitionResultEvent) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        this.emit('listening', text.trim());
      };

      recognition.onend = () => {
        if (this.status === 'listening' || this.status === 'processing') {
          this.emit('idle', this.transcript);
        }
      };

      recognition.onerror = (event: RecognitionErrorEvent) => {
        if (event.error === 'aborted' || event.error === 'no-speech') {
          this.emit('idle', this.transcript);
          return;
        }
        this.emit('error', this.transcript);
      };

      this.recognition = recognition;
    }

    return this.recognition;
  }

  start(): boolean {
    const recognition = this.ensureRecognition();
    if (!recognition) return false;

    try {
      this.transcript = '';
      this.emit('listening', '');
      recognition.start();
      return true;
    } catch {
      this.emit('error', '');
      return false;
    }
  }

  stop() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch {
      /* ignore */
    }
  }

  abort() {
    if (!this.recognition) return;
    try {
      this.recognition.abort();
    } catch {
      /* ignore */
    }
    this.transcript = '';
    this.emit('idle', '');
  }
}

export const speechRecognitionManager = new SpeechRecognitionManager();

export function startListening(): boolean {
  return speechRecognitionManager.start();
}

export function stopListening() {
  speechRecognitionManager.stop();
}

export function abortListening() {
  speechRecognitionManager.abort();
}

export function isRecognitionSupported(): boolean {
  return speechRecognitionManager.isSupported();
}
