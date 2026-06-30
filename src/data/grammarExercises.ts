import type { GrammarExercise } from '../types';

/** 3 practice questions per grammar topic — active recall after reading rules */
export const grammarExercises: GrammarExercise[] = [
  // g1 Present Simple
  { id: 'ge1', topicId: 'g1', question: 'She ___ to work every day.', options: ['go', 'goes', 'going', 'is go'], correctIndex: 1, explanation: 'He/she/it → add -s: "She goes."' },
  { id: 'ge2', topicId: 'g1', question: 'Which is correct?', options: ['He don\'t like coffee.', 'He doesn\'t likes coffee.', 'He doesn\'t like coffee.', 'He not like coffee.'], correctIndex: 2, explanation: 'Negative: doesn\'t + base verb (no -s).' },
  { id: 'ge3', topicId: 'g1', question: '___ they live in Hanoi?', options: ['Does', 'Do', 'Are', 'Is'], correctIndex: 1, explanation: 'Questions with they/we/you/I use "Do".' },
  // g2 Present Continuous
  { id: 'ge4', topicId: 'g2', question: 'I ___ English right now.', options: ['study', 'am studying', 'studying', 'am study'], correctIndex: 1, explanation: 'Present Continuous: am/is/are + verb-ing.' },
  { id: 'ge5', topicId: 'g2', question: 'Which verb CANNOT use continuous form?', options: ['run', 'know', 'eat', 'wait'], correctIndex: 1, explanation: '"Know" is a stative verb — say "I know", not "I am knowing".' },
  { id: 'ge6', topicId: 'g2', question: 'They ___ TV at the moment.', options: ['watch', 'are watching', 'watches', 'is watching'], correctIndex: 1, explanation: '"At the moment" → Present Continuous with "They are".' },
  // g3 Past Simple
  { id: 'ge7', topicId: 'g3', question: 'Past tense of "buy":', options: ['buyed', 'bought', 'buyed', 'buys'], correctIndex: 1, explanation: '"Buy" is irregular: buy → bought.' },
  { id: 'ge8', topicId: 'g3', question: 'She ___ to the party yesterday.', options: ['don\'t come', 'didn\'t came', 'didn\'t come', 'doesn\'t come'], correctIndex: 2, explanation: 'Past negative: didn\'t + base verb.' },
  { id: 'ge9', topicId: 'g3', question: '___ you see him last week?', options: ['Did', 'Do', 'Were', 'Have'], correctIndex: 0, explanation: 'Past Simple questions start with "Did".' },
  // g4 Present Perfect
  { id: 'ge10', topicId: 'g4', question: 'I ___ here for five years.', options: ['live', 'lived', 'have lived', 'am living'], correctIndex: 2, explanation: 'for + duration → Present Perfect: have lived.' },
  { id: 'ge11', topicId: 'g4', question: 'Have you ever ___ sushi?', options: ['eat', 'ate', 'eaten', 'eating'], correctIndex: 2, explanation: 'Present Perfect: have/has + past participle (eaten).' },
  { id: 'ge12', topicId: 'g4', question: 'She ___ her homework yet.', options: ['didn\'t finish', 'hasn\'t finished', 'doesn\'t finish', 'not finish'], correctIndex: 1, explanation: '"Yet" in negative → Present Perfect: hasn\'t finished.' },
  // g5 Conditionals
  { id: 'ge13', topicId: 'g5', question: 'If it rains, I ___ home.', options: ['stay', 'will stay', 'would stay', 'stayed'], correctIndex: 1, explanation: 'First Conditional: If + present, will + verb.' },
  { id: 'ge14', topicId: 'g5', question: 'If I ___ rich, I would travel.', options: ['am', 'was', 'will be', 'be'], correctIndex: 1, explanation: 'Second Conditional: If + past, would + verb.' },
  { id: 'ge15', topicId: 'g5', question: 'If I ___ harder, I would have passed.', options: ['study', 'studied', 'had studied', 'have studied'], correctIndex: 2, explanation: 'Third Conditional: If + past perfect, would have + participle.' },
  // g6 Articles
  { id: 'ge16', topicId: 'g6', question: 'She is ___ honest person.', options: ['a', 'an', 'the', '—'], correctIndex: 1, explanation: '"Honest" starts with vowel sound → "an".' },
  { id: 'ge17', topicId: 'g6', question: 'I live in ___ Vietnam.', options: ['a', 'an', 'the', '—'], correctIndex: 3, explanation: 'Country names usually take no article: "in Vietnam".' },
  { id: 'ge18', topicId: 'g6', question: 'Can you pass me ___ salt?', options: ['a', 'an', 'the', '—'], correctIndex: 2, explanation: 'Specific salt on the table → "the".' },
  // g7 Modals
  { id: 'ge19', topicId: 'g7', question: 'You ___ wear a seatbelt. It\'s the law.', options: ['can', 'may', 'must', 'might'], correctIndex: 2, explanation: '"Must" = strong obligation/necessity.' },
  { id: 'ge20', topicId: 'g7', question: '___ you help me, please?', options: ['Must', 'Should', 'Could', 'Have to'], correctIndex: 2, explanation: '"Could you...?" is a polite request.' },
  { id: 'ge21', topicId: 'g7', question: 'You ___ eat more vegetables for your health.', options: ['must', 'should', 'can', 'may'], correctIndex: 1, explanation: '"Should" gives advice.' },
  // g8 Future
  { id: 'ge22', topicId: 'g8', question: 'I ___ visit my parents this weekend. (plan)', options: ['will visit', 'am going to visit', 'visit', 'visited'], correctIndex: 1, explanation: 'Planned intention → "going to".' },
  { id: 'ge23', topicId: 'g8', question: 'Look at the clouds — it ___ rain.', options: ['will', 'is going to', 'rains', 'rained'], correctIndex: 1, explanation: 'Prediction with evidence → "going to".' },
  { id: 'ge24', topicId: 'g8', question: 'The phone is ringing. I ___ get it.', options: ['am going to', 'will', 'get', 'getting'], correctIndex: 1, explanation: 'Spontaneous decision → "will".' },
  // g9 Comparatives
  { id: 'ge25', topicId: 'g9', question: 'This book is ___ than that one.', options: ['more good', 'better', 'gooder', 'best'], correctIndex: 1, explanation: 'Good → better (irregular comparative).' },
  { id: 'ge26', topicId: 'g9', question: 'She is the ___ student in the class.', options: ['more smart', 'smartest', 'smarter', 'most smart'], correctIndex: 1, explanation: 'Short adjective superlative: smart → smartest.' },
  { id: 'ge27', topicId: 'g9', question: 'English is as ___ as math.', options: ['important', 'more important', 'most important', 'importanter'], correctIndex: 0, explanation: 'Equal comparison: as + adjective + as.' },
  // g10 Prepositions
  { id: 'ge28', topicId: 'g10', question: 'The meeting is ___ Monday.', options: ['at', 'in', 'on', 'by'], correctIndex: 2, explanation: 'Days → "on Monday".' },
  { id: 'ge29', topicId: 'g10', question: 'I live ___ Ho Chi Minh City.', options: ['at', 'on', 'in', 'to'], correctIndex: 2, explanation: 'Cities → "in".' },
  { id: 'ge30', topicId: 'g10', question: 'She is good ___ speaking English.', options: ['in', 'at', 'on', 'for'], correctIndex: 1, explanation: 'Fixed phrase: "good at".' },
  // g11 Passive
  { id: 'ge31', topicId: 'g11', question: 'The letter ___ yesterday.', options: ['sent', 'was sent', 'was send', 'is sent'], correctIndex: 1, explanation: 'Past passive: was + past participle.' },
  { id: 'ge32', topicId: 'g11', question: 'English ___ worldwide.', options: ['speaks', 'is spoken', 'is speak', 'spoke'], correctIndex: 1, explanation: 'Passive for general truths: is + past participle.' },
  { id: 'ge33', topicId: 'g11', question: 'The report ___ by the manager.', options: ['wrote', 'was written', 'was wrote', 'writing'], correctIndex: 1, explanation: 'Passive with agent: was written by...' },
  // g12 Reported speech
  { id: 'ge34', topicId: 'g12', question: 'He said he ___ tired.', options: ['is', 'was', 'be', 'will be'], correctIndex: 1, explanation: 'Present → past in reported speech: "I am" → he was.' },
  { id: 'ge35', topicId: 'g12', question: 'She asked me ___ I could help.', options: ['that', 'if', 'what', '—'], correctIndex: 1, explanation: 'Yes/no questions → ask + if/whether.' },
  { id: 'ge36', topicId: 'g12', question: 'The teacher told us ___ quiet.', options: ['be', 'to be', 'being', 'are'], correctIndex: 1, explanation: 'Reported command: tell + object + to-infinitive.' },
];

export function getExercisesForTopic(topicId: string): GrammarExercise[] {
  return grammarExercises.filter((e) => e.topicId === topicId);
}

export function getExerciseById(id: string): GrammarExercise | undefined {
  return grammarExercises.find((e) => e.id === id);
}
