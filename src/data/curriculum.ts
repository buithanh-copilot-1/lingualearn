import type { Level } from '../types';

export interface CurriculumUnit {
  id: string;
  title: string;
  titleVi: string;
  level: Level;
  description: string;
  descriptionVi: string;
  lessonIds: string[];
}

/** CEFR-aligned learning path for Vietnamese learners */
export const curriculumUnits: CurriculumUnit[] = [
  {
    id: 'a1-core',
    title: 'A1 — Core Foundations',
    titleVi: 'A1 — Nền tảng cơ bản',
    level: 'beginner',
    description: 'Greetings, numbers, daily life, and essential grammar.',
    descriptionVi: 'Chào hỏi, số đếm, đời sống hàng ngày và ngữ pháp nền.',
    lessonIds: ['l1', 'l11', 'l13', 'l8', 'l3', 'l15', 'l2', 'l12', 'l16', 'l9', 'l14'],
  },
  {
    id: 'a1-grammar',
    title: 'A1 — Grammar Essentials',
    titleVi: 'A1 — Ngữ pháp thiết yếu',
    level: 'beginner',
    description: 'Articles, prepositions, and common sentence patterns.',
    descriptionVi: 'Mạo từ, giới từ và cấu trúc câu thông dụng.',
    lessonIds: ['l20', 'l33', 'l18', 'l19'],
  },
  {
    id: 'a2-elementary',
    title: 'A2 — Elementary Communication',
    titleVi: 'A2 — Giao tiếp sơ cấp',
    level: 'beginner',
    description: 'Phone calls, travel, hotel, and past tenses.',
    descriptionVi: 'Điện thoại, du lịch, khách sạn và thì quá khứ.',
    lessonIds: ['l17', 'l4', 'l7', 'l5', 'l21'],
  },
  {
    id: 'b1-intermediate',
    title: 'B1 — Intermediate Skills',
    titleVi: 'B1 — Kỹ năng trung cấp',
    level: 'intermediate',
    description: 'Workplace English, modals, future plans, and health.',
    descriptionVi: 'Tiếng Anh công việc, modal verbs, kế hoạch tương lai và sức khỏe.',
    lessonIds: ['l22', 'l23', 'l24', 'l25', 'l26'],
  },
  {
    id: 'b2-advanced',
    title: 'B2 — Advanced Fluency',
    titleVi: 'B2 — Thành thạo nâng cao',
    level: 'advanced',
    description: 'Business writing, interviews, news, and complex grammar.',
    descriptionVi: 'Email công việc, phỏng vấn, tin tức và ngữ pháp phức tạp.',
    lessonIds: ['l6', 'l10', 'l27', 'l28', 'l29', 'l30', 'l31', 'l32'],
  },
];

export function getUnitForLesson(lessonId: string): CurriculumUnit | undefined {
  return curriculumUnits.find((u) => u.lessonIds.includes(lessonId));
}
