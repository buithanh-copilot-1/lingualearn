import { checkAndSendVocabReminders, checkAndSendWordSuggestions } from './notification.service.js';

const CHECK_INTERVAL_MS = 60_000;

/**
 * Polls every minute for:
 *  - users whose configured daily vocabulary reminder time has arrived
 *  - users due for a new-word suggestion push (based on their chosen interval)
 */
export function startReminderScheduler() {
  setInterval(() => {
    checkAndSendVocabReminders().catch((err) => {
      console.error('Vocab reminder check failed:', err);
    });
    checkAndSendWordSuggestions().catch((err) => {
      console.error('Word suggestion check failed:', err);
    });
  }, CHECK_INTERVAL_MS);
}
