const QUIZ_LABELS: Record<string, { en: string; vi: string }> = {
  'all': { en: 'All Questions', vi: 'Tất cả câu hỏi' },
  'grammar': { en: 'Grammar Quiz', vi: 'Kiểm tra Ngữ pháp' },
  'conversation': { en: 'Conversation Quiz', vi: 'Kiểm tra Giao tiếp' },
  'vocabulary': { en: 'Vocabulary Quiz', vi: 'Kiểm tra Từ vựng' },
  'beginner': { en: 'Beginner Quiz', vi: 'Kiểm tra Cơ bản' },
  'intermediate': { en: 'Intermediate Quiz', vi: 'Kiểm tra Trung cấp' },
  'advanced': { en: 'Advanced Quiz', vi: 'Kiểm tra Nâng cao' },
};

export function getQuizLabel(quizId: string, locale: 'en' | 'vi'): string {
  const key = quizId.replace('quiz-', '');
  return QUIZ_LABELS[key]?.[locale] ?? quizId;
}
