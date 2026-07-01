export type SpeechStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

type StatusListener = (status: SpeechStatus, text: string) => void;

const CANCEL_ERRORS = new Set(['interrupted', 'canceled', 'cancelled']);

class SpeechManager {
  private listeners = new Set<StatusListener>();
  private status: SpeechStatus = 'idle';
  private currentText = '';
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;
  private resumeTimer: ReturnType<typeof setInterval> | null = null;
  private englishVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', () => this.loadVoices());
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  getStatus(): SpeechStatus {
    return this.status;
  }

  getCurrentText(): string {
    return this.currentText;
  }

  isActive(): boolean {
    return this.status === 'loading' || this.status === 'playing' || this.status === 'paused';
  }

  subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.status, this.currentText);
    return () => this.listeners.delete(listener);
  }

  private emit(status: SpeechStatus, text?: string) {
    this.status = status;
    if (text !== undefined) this.currentText = text;
    for (const listener of this.listeners) {
      listener(this.status, this.currentText);
    }
  }

  private loadVoices() {
    if (!this.isSupported()) return;
    const voices = window.speechSynthesis.getVoices();
    this.englishVoice =
      voices.find((v) => v.lang.startsWith('en') && v.localService) ??
      voices.find((v) => v.lang.startsWith('en-US')) ??
      voices.find((v) => v.lang.startsWith('en')) ??
      null;
  }

  private clearPendingTimer() {
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
  }

  private clearResumeTimer() {
    if (this.resumeTimer) {
      clearInterval(this.resumeTimer);
      this.resumeTimer = null;
    }
  }

  /** Chrome/Safari: long utterances can stall without periodic resume */
  private startKeepAlive() {
    this.clearResumeTimer();
    this.resumeTimer = setInterval(() => {
      const synth = window.speechSynthesis;
      if (synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      } else if (!synth.speaking) {
        this.clearResumeTimer();
      }
    }, 8000);
  }

  speak(text: string, rate = 0.9): boolean {
    const trimmed = text.trim();
    if (!this.isSupported() || !trimmed) {
      this.emit('error', trimmed);
      return false;
    }

    this.stopInternal(false);

    this.emit('loading', trimmed);

    // Delay after cancel — required on Chrome/mobile or speak() silently fails
    this.pendingTimer = setTimeout(() => {
      this.pendingTimer = null;
      this.loadVoices();

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      if (this.englishVoice) utterance.voice = this.englishVoice;

      utterance.onstart = () => {
        this.emit('playing', trimmed);
        this.startKeepAlive();
      };

      utterance.onend = () => {
        this.clearResumeTimer();
        this.emit('idle');
      };

      utterance.onerror = (event) => {
        this.clearResumeTimer();
        if (CANCEL_ERRORS.has(event.error)) {
          this.emit('idle');
          return;
        }
        this.emit('error', trimmed);
      };

      window.speechSynthesis.speak(utterance);
    }, 80);

    return true;
  }

  private stopInternal(emitIdle = true) {
    this.clearPendingTimer();
    this.clearResumeTimer();
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
    if (emitIdle) this.emit('idle');
  }

  stop() {
    this.stopInternal(true);
  }

  pause() {
    if (!this.isSupported() || !window.speechSynthesis.speaking) return;
    window.speechSynthesis.pause();
    this.emit('paused');
  }

  resume() {
    if (!this.isSupported() || !window.speechSynthesis.paused) return;
    window.speechSynthesis.resume();
    this.emit('playing');
  }

  togglePause(): boolean {
    if (this.status === 'paused') {
      this.resume();
      return true;
    }
    if (this.status === 'playing') {
      this.pause();
      return false;
    }
    return false;
  }
}

export const speechManager = new SpeechManager();

export function speakEnglish(text: string, rate = 0.9) {
  return speechManager.speak(text, rate);
}

export function speakWord(text: string) {
  return speechManager.speak(text, 0.85);
}

export function stopSpeaking() {
  speechManager.stop();
}

export function pauseSpeaking() {
  speechManager.pause();
}

export function resumeSpeaking() {
  speechManager.resume();
}
