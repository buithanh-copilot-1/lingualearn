import type { GrammarTopic } from '../types';

export const grammarTopics: GrammarTopic[] = [
  {
    id: 'g1',
    title: 'Present Simple',
    description: 'The foundation of English — used for habits, facts, and routines.',
    level: 'beginner',
    rules: [
      'Use for daily routines: "I wake up at 7 AM."',
      'Use for general truths: "The sun rises in the east."',
      'Add -s/-es for he/she/it: "He plays tennis."',
      'Use do/does for questions and negatives.',
    ],
    examples: [
      { sentence: 'She works in a hospital.', explanation: 'Third person singular — add -s to the verb.' },
      { sentence: 'Do they live in Hanoi?', explanation: 'Question form with "do" + base verb.' },
      { sentence: 'I don\'t eat meat.', explanation: 'Negative with "don\'t" + base verb.' },
    ],
  },
  {
    id: 'g2',
    title: 'Present Continuous',
    description: 'Describe actions happening right now or temporary situations.',
    level: 'beginner',
    rules: [
      'Form: am/is/are + verb-ing',
      'Use for actions happening now: "I am studying."',
      'Use for temporary situations: "She is staying with friends."',
      'Some verbs (know, like, want) are NOT used in continuous form.',
    ],
    examples: [
      { sentence: 'They are watching a movie.', explanation: 'Action in progress right now.' },
      { sentence: 'Is it raining outside?', explanation: 'Question with "is" + verb-ing.' },
      { sentence: 'He isn\'t working today.', explanation: 'Negative with "isn\'t" + verb-ing.' },
    ],
  },
  {
    id: 'g3',
    title: 'Past Simple',
    description: 'Talk about completed actions at a specific time in the past.',
    level: 'intermediate',
    rules: [
      'Regular verbs: add -ed (worked, played, watched).',
      'Irregular verbs must be memorized (went, saw, bought).',
      'Use with time expressions: yesterday, last week, in 2019.',
      'Questions: Did + subject + base verb?',
    ],
    examples: [
      { sentence: 'We visited Paris last summer.', explanation: 'Regular verb with -ed ending.' },
      { sentence: 'She didn\'t come to the party.', explanation: 'Negative with "didn\'t" + base verb.' },
      { sentence: 'Did you enjoy the concert?', explanation: 'Question form in Past Simple.' },
    ],
  },
  {
    id: 'g4',
    title: 'Present Perfect',
    description: 'Connect the past with the present — experiences and recent events.',
    level: 'intermediate',
    rules: [
      'Form: have/has + past participle',
      'Use for life experiences: "I have visited Japan."',
      'Use for recent actions with present relevance: "She has just arrived."',
      'Time expressions: ever, never, already, yet, just, since, for.',
    ],
    examples: [
      { sentence: 'I have lived here for 5 years.', explanation: 'Action started in past, continues to present.' },
      { sentence: 'Have you ever tried sushi?', explanation: 'Asking about life experience.' },
      { sentence: 'He hasn\'t finished his homework yet.', explanation: 'Negative — action not completed.' },
    ],
  },
  {
    id: 'g5',
    title: 'Conditionals (If clauses)',
    description: 'Express hypothetical situations and their consequences.',
    level: 'advanced',
    rules: [
      'Zero Conditional: If + present, present — general truths.',
      'First Conditional: If + present, will — real future possibility.',
      'Second Conditional: If + past, would — unreal present/future.',
      'Third Conditional: If + past perfect, would have — unreal past.',
    ],
    examples: [
      { sentence: 'If it rains, I will stay home.', explanation: 'First Conditional — real possibility.' },
      { sentence: 'If I were rich, I would travel the world.', explanation: 'Second Conditional — hypothetical.' },
      { sentence: 'If I had studied harder, I would have passed.', explanation: 'Third Conditional — regret about past.' },
    ],
  },
];
