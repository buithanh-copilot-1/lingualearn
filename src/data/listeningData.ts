import type { ComprehensionQuestion } from '../types';

/** Comprehension checks for listening lessons */
export const listeningComprehension: Record<string, ComprehensionQuestion[]> = {
  l7: [
    {
      question: 'What does "boarding" mean at the airport?',
      options: ['Buying a ticket', 'Getting on the plane', 'Checking luggage', 'Going through security'],
      correctIndex: 1,
      explanation: 'Boarding means passengers are getting on the aircraft.',
    },
    {
      question: '"Final call" means:',
      options: ['The flight is cancelled', 'Last chance to board', 'The plane has landed', 'Baggage is ready'],
      correctIndex: 1,
      explanation: 'Final call is the last announcement before the gate closes.',
    },
    {
      question: '"Fasten your seatbelt" is a:',
      options: ['Food order', 'Safety instruction', 'Gate change', 'Delay notice'],
      correctIndex: 1,
      explanation: 'It is a standard safety instruction before takeoff.',
    },
  ],
  l9: [
    {
      question: 'At hotel check-in, you say:',
      options: ['I have a reservation under...', 'I want to buy a room', 'Where is the airport?', 'One ticket please'],
      correctIndex: 0,
      explanation: 'Tell the receptionist your booking name on arrival.',
    },
    {
      question: '"Is breakfast included?" asks about:',
      options: ['Room price', 'Whether meals are part of your stay', 'Checkout time', 'Wi-Fi speed'],
      correctIndex: 1,
      explanation: 'Included means breakfast is part of the room rate.',
    },
    {
      question: '"What time is checkout?" means:',
      options: ['When must I leave the hotel?', 'When does breakfast start?', 'When is the pool open?', 'When can I check in?'],
      correctIndex: 0,
      explanation: 'Checkout time is when you must leave the room.',
    },
  ],
  l27: [
    {
      question: 'News headlines often use:',
      options: ['Past tense only', 'Present tense for recent events', 'Questions only', 'No verbs'],
      correctIndex: 1,
      explanation: 'Headlines use present tense: "Minister resigns" not "resigned".',
    },
    {
      question: '"According to reports" means:',
      options: ['This is definitely false', 'Information comes from news sources', 'The speaker agrees fully', 'It is a joke'],
      correctIndex: 1,
      explanation: 'Journalists use this to cite their information source.',
    },
    {
      question: 'Why listen to multiple news sources?',
      options: ['To waste time', 'To get balanced perspectives', 'To avoid English', 'Only one source is legal'],
      correctIndex: 1,
      explanation: 'Different sources help you understand bias and get fuller context.',
    },
  ],
};

export function getListeningComprehension(lessonId: string): ComprehensionQuestion[] {
  return listeningComprehension[lessonId] ?? [];
}

/** Extract quoted announcement text for TTS from lesson step content */
export function extractListeningScript(line: string): string {
  const quoted = line.match(/^"([^"]+)"/);
  if (quoted) return quoted[1];
  const beforeDash = line.split('—')[0].trim();
  return beforeDash.replace(/^"/, '').replace(/"$/, '');
}
