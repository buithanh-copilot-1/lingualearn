import type { VocabWord } from '../types';

const GENERIC_EXAMPLE = /^I learned "[^"]+" — it means /i;
const GENERIC_ACHIEVE = /^I want to .+ my English every day\./i;

export function isGenericExample(example: string): boolean {
  return GENERIC_EXAMPLE.test(example) || GENERIC_ACHIEVE.test(example);
}

/** Build a clearer example when seed data only has a placeholder sentence. */
export function resolveExample(word: VocabWord): string {
  if (!isGenericExample(word.example)) return word.example;

  const w = word.word.toLowerCase();
  const gloss = word.meaning.split(/[,;]/)[0].trim();

  if (isLikelyNoun(w, word.example)) {
    return `The ${w} is very important in daily life.`;
  }
  if (w.endsWith('ly') && w.length > 4) {
    return `She spoke ${word.word} during the meeting.`;
  }
  if (['improve', 'learn', 'study', 'practice', 'develop', 'achieve', 'understand', 'remember'].some((v) => w.includes(v))) {
    return `You need to ${word.word} every day to make progress.`;
  }
  if (['buy', 'sell', 'pay', 'borrow', 'send', 'receive', 'choose', 'find', 'call', 'try', 'use', 'open', 'close'].includes(w)) {
    return `Please ${word.word} it before tomorrow.`;
  }
  if (['happy', 'sad', 'beautiful', 'important', 'different', 'comfortable', 'friendly', 'cheap', 'expensive'].includes(w)) {
    return `This situation is very ${word.word}.`;
  }

  return `"${word.word}" means ${gloss} in Vietnamese.`;
}

function isLikelyNoun(word: string, example: string): boolean {
  if (example.includes(`The ${word}`) || example.includes(`the ${word}`)) return true;
  return !word.endsWith('ed') && !word.endsWith('ing') && !word.endsWith('ly');
}

export function categoryLabelVi(category: string): string {
  const map: Record<string, string> = {
    General: 'Chung',
    Business: 'Công việc',
    Travel: 'Du lịch',
    Education: 'Giáo dục',
    Health: 'Sức khỏe',
    Shopping: 'Mua sắm',
    Technology: 'Công nghệ',
    Food: 'Ẩm thực',
    'Daily Life': 'Đời sống',
  };
  return map[category] ?? category;
}

export function usageTip(word: VocabWord, partOfSpeech?: string): string | null {
  const pos = partOfSpeech?.toLowerCase() ?? '';
  const w = word.word.toLowerCase();

  if (pos.includes('verb')) {
    return `Động từ "${word.word}" — thường đi với tân ngữ hoặc dùng trong câu khẳng định/phủ định.`;
  }
  if (pos.includes('noun')) {
    return `Danh từ "${word.word}" — có thể dùng với a/an/the tùy ngữ cảnh.`;
  }
  if (pos.includes('adjective')) {
    return `Tính từ "${word.word}" — đứng trước danh từ hoặc sau động từ to be.`;
  }
  if (pos.includes('adverb')) {
    return `Trạng từ "${word.word}" — bổ nghĩa cho động từ, tính từ hoặc cả câu.`;
  }
  if (w.endsWith('tion') || w.endsWith('sion')) {
    return `Danh từ trừu tượng — thường dùng trong văn viết và giao tiếp trang trọng.`;
  }
  return null;
}
