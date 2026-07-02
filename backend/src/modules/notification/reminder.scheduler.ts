import { checkAndSendVocabReminders } from './notification.service.js';

const CHECK_INTERVAL_MS = 60_000;

/** Polls every minute for users whose configured vocabulary reminder time has arrived. */
export function startReminderScheduler() {
  setInterval(() => {
    checkAndSendVocabReminders().catch((err) => {
      console.error('Vocab reminder check failed:', err);
    });
  }, CHECK_INTERVAL_MS);
}
