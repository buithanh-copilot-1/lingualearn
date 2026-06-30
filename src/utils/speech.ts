export function speakWord(text: string) {
  speakEnglish(text, 0.85);
}

export function speakEnglish(text: string, rate = 0.9) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
