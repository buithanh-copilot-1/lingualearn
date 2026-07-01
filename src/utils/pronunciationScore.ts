export type WordMatchStatus = 'correct' | 'wrong' | 'missing' | 'extra';

export interface WordToken {
  word: string;
  status: WordMatchStatus;
}

export interface PronunciationResult {
  score: number;
  expected: string;
  spoken: string;
  expectedTokens: WordToken[];
  spokenTokens: WordToken[];
  matchedWords: number;
  totalWords: number;
}

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/[^\w\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function wordsMatch(expected: string, spoken: string): boolean {
  if (expected === spoken) return true;
  const maxDist = expected.length <= 4 ? 1 : 2;
  return levenshtein(expected, spoken) <= maxDist;
}

type AlignOp = 'match' | 'substitute' | 'insert' | 'delete';

interface AlignStep {
  op: AlignOp;
  expected?: string;
  spoken?: string;
}

/** Word-level alignment via edit distance backtracking */
function alignWords(expected: string[], spoken: string[]): AlignStep[] {
  const m = expected.length;
  const n = spoken.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (wordsMatch(expected[i - 1], spoken[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const steps: AlignStep[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsMatch(expected[i - 1], spoken[j - 1])) {
      steps.unshift({ op: 'match', expected: expected[i - 1], spoken: spoken[j - 1] });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      steps.unshift({ op: 'substitute', expected: expected[i - 1], spoken: spoken[j - 1] });
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      steps.unshift({ op: 'delete', expected: expected[i - 1] });
      i--;
    } else {
      steps.unshift({ op: 'insert', spoken: spoken[j - 1] });
      j--;
    }
  }

  return steps;
}

export function scorePronunciation(expected: string, spoken: string): PronunciationResult {
  const expWords = normalizeWords(expected);
  const saidWords = normalizeWords(spoken);

  if (expWords.length === 0) {
    return {
      score: 0,
      expected,
      spoken,
      expectedTokens: [],
      spokenTokens: saidWords.map((word) => ({ word, status: 'extra' as const })),
      matchedWords: 0,
      totalWords: 0,
    };
  }

  if (saidWords.length === 0) {
    return {
      score: 0,
      expected,
      spoken,
      expectedTokens: expWords.map((word) => ({ word, status: 'missing' as const })),
      spokenTokens: [],
      matchedWords: 0,
      totalWords: expWords.length,
    };
  }

  const steps = alignWords(expWords, saidWords);
  const expectedTokens: WordToken[] = [];
  const spokenTokens: WordToken[] = [];
  let matchedWords = 0;

  for (const step of steps) {
    if (step.op === 'match') {
      matchedWords++;
      expectedTokens.push({ word: step.expected!, status: 'correct' });
      spokenTokens.push({ word: step.spoken!, status: 'correct' });
    } else if (step.op === 'substitute') {
      expectedTokens.push({ word: step.expected!, status: 'wrong' });
      spokenTokens.push({ word: step.spoken!, status: 'wrong' });
    } else if (step.op === 'delete') {
      expectedTokens.push({ word: step.expected!, status: 'missing' });
    } else if (step.op === 'insert') {
      spokenTokens.push({ word: step.spoken!, status: 'extra' });
    }
  }

  const score = Math.round((matchedWords / expWords.length) * 100);

  return {
    score,
    expected,
    spoken,
    expectedTokens,
    spokenTokens,
    matchedWords,
    totalWords: expWords.length,
  };
}

export function scoreLabel(score: number): 'excellent' | 'good' | 'fair' | 'needsWork' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  return 'needsWork';
}
