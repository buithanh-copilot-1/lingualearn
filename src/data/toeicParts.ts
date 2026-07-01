import type { ToeicPartInfo } from '../types';

// Official TOEIC Listening & Reading format (2026 standard — unchanged since the 2016 revision).
// Source: ETS Global / official examinee handbook.
export const toeicParts: ToeicPartInfo[] = [
  {
    id: 'part1',
    skill: 'listening',
    name: 'Photographs',
    nameVi: 'Mô tả tranh',
    officialCount: 6,
    officialMinutes: 0,
    description: 'Listen to four statements about a picture and choose the one that best describes it.',
    descriptionVi: 'Nghe 4 câu mô tả một bức tranh và chọn câu mô tả đúng nhất.',
  },
  {
    id: 'part2',
    skill: 'listening',
    name: 'Question-Response',
    nameVi: 'Hỏi - Đáp',
    officialCount: 25,
    officialMinutes: 0,
    description: 'Listen to a question or statement and choose the best response from three options.',
    descriptionVi: 'Nghe một câu hỏi/câu nói và chọn phản hồi phù hợp nhất trong 3 lựa chọn.',
  },
  {
    id: 'part3',
    skill: 'listening',
    name: 'Conversations',
    nameVi: 'Đoạn hội thoại',
    officialCount: 39,
    officialMinutes: 0,
    description: 'Listen to short conversations between two or three people and answer 3 questions per conversation.',
    descriptionVi: 'Nghe các đoạn hội thoại ngắn giữa 2-3 người và trả lời 3 câu hỏi cho mỗi đoạn.',
  },
  {
    id: 'part4',
    skill: 'listening',
    name: 'Short Talks',
    nameVi: 'Bài nói ngắn',
    officialCount: 30,
    officialMinutes: 0,
    description: 'Listen to short talks by a single speaker and answer 3 questions per talk.',
    descriptionVi: 'Nghe các bài nói ngắn của một người và trả lời 3 câu hỏi cho mỗi bài.',
  },
  {
    id: 'part5',
    skill: 'reading',
    name: 'Incomplete Sentences',
    nameVi: 'Hoàn thành câu',
    officialCount: 30,
    officialMinutes: 0,
    description: 'Choose the word or phrase that best completes each sentence.',
    descriptionVi: 'Chọn từ/cụm từ phù hợp nhất để hoàn thành câu.',
  },
  {
    id: 'part6',
    skill: 'reading',
    name: 'Text Completion',
    nameVi: 'Hoàn thành đoạn văn',
    officialCount: 16,
    officialMinutes: 0,
    description: 'Choose the word, phrase, or sentence that best completes each blank in a passage.',
    descriptionVi: 'Chọn từ, cụm từ hoặc câu phù hợp nhất để điền vào chỗ trống trong đoạn văn.',
  },
  {
    id: 'part7',
    skill: 'reading',
    name: 'Reading Comprehension',
    nameVi: 'Đọc hiểu',
    officialCount: 54,
    officialMinutes: 0,
    description: 'Read single, double, or triple passages and answer comprehension questions.',
    descriptionVi: 'Đọc một, hai hoặc ba văn bản liên quan và trả lời câu hỏi đọc hiểu.',
  },
];

export const toeicPartMap: Record<string, ToeicPartInfo> = Object.fromEntries(
  toeicParts.map((p) => [p.id, p]),
);

export const TOEIC_LISTENING_MINUTES = 45;
export const TOEIC_READING_MINUTES = 75;
export const TOEIC_TOTAL_QUESTIONS = 200;
export const TOEIC_MAX_SECTION_SCORE = 495;
