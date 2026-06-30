import type { Level } from '../types';

export interface PlacementQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  level: Level;
  explanation: string;
}

/** 12 questions — 4 per level — to suggest starting CEFR level */
export const placementQuestions: PlacementQuestion[] = [
  { id: 'p1', level: 'beginner', question: 'Good morning! How ___ you?', options: ['is', 'are', 'am', 'be'], correctIndex: 1, explanation: 'With "you" use "are": How are you?' },
  { id: 'p2', level: 'beginner', question: 'I ___ from Vietnam.', options: ['is', 'am', 'are', 'be'], correctIndex: 1, explanation: 'I am from...' },
  { id: 'p3', level: 'beginner', question: 'What does "delicious" mean?', options: ['Expensive', 'Tasty', 'Cold', 'Fast'], correctIndex: 1, explanation: 'Delicious = tasty, good to eat.' },
  { id: 'p4', level: 'beginner', question: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'is go'], correctIndex: 1, explanation: 'He/she/it → goes.' },
  { id: 'p5', level: 'intermediate', question: 'I ___ here since 2020.', options: ['live', 'lived', 'have lived', 'am living'], correctIndex: 2, explanation: 'since + point in time → Present Perfect.' },
  { id: 'p6', level: 'intermediate', question: 'If it rains, I ___ at home.', options: ['stay', 'will stay', 'would stay', 'stayed'], correctIndex: 1, explanation: 'First Conditional: will + verb.' },
  { id: 'p7', level: 'intermediate', question: 'Which is correct?', options: ['He is knowing the answer.', 'He knows the answer.', 'He know the answer.', 'He knowing the answer.'], correctIndex: 1, explanation: '"Know" is stative — no continuous form.' },
  { id: 'p8', level: 'intermediate', question: 'The meeting is ___ Monday.', options: ['at', 'in', 'on', 'by'], correctIndex: 2, explanation: 'Days → on Monday.' },
  { id: 'p9', level: 'advanced', question: 'If I ___ harder, I would have passed.', options: ['study', 'studied', 'had studied', 'have studied'], correctIndex: 2, explanation: 'Third Conditional: If + past perfect.' },
  { id: 'p10', level: 'advanced', question: 'The report ___ by the team yesterday.', options: ['wrote', 'was written', 'was wrote', 'writing'], correctIndex: 1, explanation: 'Past passive: was + past participle.' },
  { id: 'p11', level: 'advanced', question: 'He said he ___ tired.', options: ['is', 'was', 'will be', 'be'], correctIndex: 1, explanation: 'Reported speech backshifts present to past.' },
  { id: 'p12', level: 'advanced', question: 'What does "leverage" mean in business?', options: ['To fire staff', 'To use strategically for advantage', 'To merge companies', 'To borrow money only'], correctIndex: 1, explanation: 'Leverage = use resources for maximum impact.' },
];

export function suggestLevel(scores: { beginner: number; intermediate: number; advanced: number }): Level {
  const { beginner, intermediate, advanced } = scores;
  if (advanced >= 3) return 'advanced';
  if (intermediate >= 3) return 'intermediate';
  if (beginner >= 3) return 'beginner';
  if (advanced >= 2) return 'intermediate';
  if (intermediate >= 2) return 'beginner';
  return 'beginner';
}
