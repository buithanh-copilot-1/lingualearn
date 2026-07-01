/** Filters meaningless / non-learner tokens from vocabulary lists. */

/** Real 2-letter English words worth keeping */
export const TWO_LETTER_WHITELIST = new Set([
  'go', 'no', 'hi', 'ok', 'oh', 'ex', 'vs', 'mr', 'ms', 'dr', 're', 'um',
]);

/** Tech abbreviations, roman numerals, and scraped noise — not ESL vocabulary */
export const BLOCKLIST = new Set([
  'ii', 'iii', 'iv', 'vi', 'aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'mm', 'pp', 'ss',
  'www', 'faq', 'url', 'xml', 'pdf', 'php', 'sql', 'ftp', 'css', 'html', 'usb',
  'gmt', 'usd', 'eur', 'rss', 'dvd', 'cd', 'tv', 'pc', 'ebay', 'yahoo', 'cnet',
  'msn', 'aol', 'ibm', 'xbox', 'ipod', 'nfl', 'nba', 'hiv', 'dsl', 'pda', 'voip',
  'nasa', 'gcc', 'asp', 'amd', 'usc', 'bmw', 'mit', 'crm', 'api', 'http', 'iso',
  'lcd', 'vhs', 'gps', 'pdt', 'edt', 'pst', 'cst', 'utc', 'mhz', 'rpm', 'tvs',
  'usr', 'cvs', 'llc', 'plc', 'pdt', 'gmt', 'xbox', 'ipod', 'nbc', 'cbs', 'abc',
]);

export function meaningIsUntranslated(word, meaning) {
  if (!meaning) return true;
  const w = word.toLowerCase();
  const m = meaning.replace(/[.\s]/g, '').toLowerCase();
  return m === w || m === `${w}.`;
}

/** @param {string} word @param {{ meaning?: string } | null} [entry] */
export function isJunkWord(word, entry = null) {
  const w = word.toLowerCase();

  if (/^([a-z])\1+$/.test(w)) return true;
  if (BLOCKLIST.has(w)) return true;
  if (w.length === 2 && !TWO_LETTER_WHITELIST.has(w)) return true;
  if (w.length < 2 || w.length > 24) return true;
  if (/^\d/.test(w)) return true;

  if (entry && meaningIsUntranslated(w, entry.meaning)) {
    if (w.length === 3 && !/[aeiouy]/.test(w)) return true;
  }

  return false;
}
