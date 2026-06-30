/**
 * Build src/data/vocabulary.json with 1000+ curated ESL words for Vietnamese learners.
 * Uses embedded EN→VI map + dictionary API for phonetics. Run: npm run build:vocab
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { VocabWord } from '../src/types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outPath = join(root, 'src/data/vocabulary.json');
const cachePath = join(__dirname, 'vocab-data/build-cache.json');

type Level = VocabWord['level'];

const STOP_WORDS = new Set([
  'the', 'of', 'and', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with',
  'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'all', 'have',
  'new', 'more', 'an', 'was', 'we', 'will', 'can', 'us', 'about', 'if', 'my', 'has',
  'but', 'our', 'one', 'other', 'do', 'no', 'they', 'so', 'what', 'there', 'which', 'when',
  'he', 'up', 'may', 'out', 'many', 'then', 'them', 'these', 'she', 'some', 'her', 'would',
  'make', 'like', 'into', 'him', 'two', 'did', 'get', 'who', 'over', 'its', 'also', 'after',
  'use', 'how', 'their', 'me', 'than', 'been', 'who', 'oil', 'sit', 'set', 'run', 'own',
  'say', 'said', 'each', 'tell', 'does', 'way', 'could', 'should', 'must', 'shall', 'might',
  'am', 'being', 'was', 'were', 'had', 'having', 'do', 'does', 'did', 'doing',
]);

/** High-quality Vietnamese glosses for common learner vocabulary */
const VI_MAP: Record<string, string> = {
  hello: 'xin chào', goodbye: 'tạm biệt', please: 'làm ơn', thank: 'cảm ơn', sorry: 'xin lỗi',
  yes: 'có, vâng', no: 'không', water: 'nước', food: 'thức ăn', house: 'ngôi nhà', home: 'nhà',
  school: 'trường học', work: 'công việc', friend: 'bạn bè', family: 'gia đình', child: 'đứa trẻ',
  children: 'trẻ em', man: 'đàn ông', woman: 'phụ nữ', people: 'mọi người', country: 'đất nước',
  city: 'thành phố', money: 'tiền', time: 'thời gian', day: 'ngày', week: 'tuần', month: 'tháng',
  year: 'năm', morning: 'buổi sáng', night: 'ban đêm', today: 'hôm nay', tomorrow: 'ngày mai',
  yesterday: 'hôm qua', good: 'tốt', bad: 'xấu, tệ', big: 'to, lớn', small: 'nhỏ', happy: 'vui',
  sad: 'buồn', beautiful: 'đẹp', important: 'quan trọng', different: 'khác nhau', same: 'giống nhau',
  learn: 'học', teach: 'dạy', study: 'học tập', read: 'đọc', write: 'viết', speak: 'nói',
  listen: 'nghe', understand: 'hiểu', know: 'biết', think: 'nghĩ', want: 'muốn', need: 'cần',
  help: 'giúp đỡ', love: 'yêu, thích', like: 'thích', live: 'sống', die: 'chết', eat: 'ăn',
  drink: 'uống', sleep: 'ngủ', walk: 'đi bộ', run: 'chạy', drive: 'lái xe', buy: 'mua',
  sell: 'bán', pay: 'trả tiền', open: 'mở', close: 'đóng', start: 'bắt đầu', stop: 'dừng lại',
  give: 'cho, tặng', take: 'lấy, mang', come: 'đến', go: 'đi', see: 'nhìn thấy', look: 'nhìn',
  find: 'tìm thấy', ask: 'hỏi', answer: 'trả lời', call: 'gọi', try: 'thử', begin: 'bắt đầu',
  feel: 'cảm thấy', leave: 'rời đi', put: 'đặt', mean: 'có nghĩa là', keep: 'giữ', let: 'để, cho phép',
  show: 'cho thấy, trình bày', hear: 'nghe', play: 'chơi', move: 'di chuyển', turn: 'quay, rẽ',
  grow: 'lớn lên, phát triển', hold: 'cầm, giữ', bring: 'mang đến', write: 'viết', stand: 'đứng',
  sit: 'ngồi', win: 'thắng', lose: 'thua, mất', meet: 'gặp', send: 'gửi', build: 'xây dựng',
  fall: 'ngã, rơi', cut: 'cắt', reach: 'đạt tới, với tới', kill: 'giết', raise: 'nuôi, nâng',
  pass: 'vượt qua, đỗ', sell: 'bán', decide: 'quyết định', return: 'trở về', explain: 'giải thích',
  develop: 'phát triển', carry: 'mang, vác', break: 'làm vỡ, nghỉ giải lao', receive: 'nhận',
  agree: 'đồng ý', support: 'hỗ trợ', hit: 'đánh, va', produce: 'sản xuất', cover: 'che phủ, bao gồm',
  catch: 'bắt, bắt kịp', draw: 'vẽ', choose: 'chọn', expect: 'mong đợi, trông chờ', fight: 'đánh nhau, chiến đấu',
  save: 'cứu, tiết kiệm', serve: 'phục vụ', end: 'kết thúc', create: 'tạo ra', join: 'tham gia',
  doctor: 'bác sĩ', hospital: 'bệnh viện', health: 'sức khỏe', medicine: 'thuốc', patient: 'bệnh nhân',
  teacher: 'giáo viên', student: 'học sinh, sinh viên', book: 'sách', computer: 'máy tính',
  phone: 'điện thoại', internet: 'm internet', email: 'email, thư điện tử', job: 'công việc',
  company: 'công ty', manager: 'quản lý', meeting: 'cuộc họp', project: 'dự án', team: 'đội, nhóm',
  airport: 'sân bay', flight: 'chuyến bay', hotel: 'khách sạn', ticket: 'vé', passport: 'hộ chiếu',
  restaurant: 'nhà hàng', menu: 'thực đơn', coffee: 'cà phê', tea: 'trà', rice: 'cơm, gạo',
  bread: 'bánh mì', meat: 'thịt', fish: 'cá', fruit: 'trái cây', vegetable: 'rau củ',
  apple: 'quả táo', orange: 'quả cam', chicken: 'thịt gà', egg: 'trứng', milk: 'sữa',
  weather: 'thời tiết', rain: 'mưa', sun: 'mặt trời', hot: 'nóng', cold: 'lạnh, lạnh lẽo',
  warm: 'ấm', wind: 'gió', cloud: 'mây', sky: 'bầu trời', tree: 'cây', flower: 'hoa',
  animal: 'động vật', dog: 'con chó', cat: 'con mèo', bird: 'con chim', horse: 'con ngựa',
  car: 'xe ô tô', bus: 'xe buýt', train: 'tàu hỏa', bike: 'xe đạp', road: 'con đường',
  street: 'đường phố', map: 'bản đồ', north: 'phía bắc', south: 'nam', east: 'đông', west: 'tây',
  color: 'màu sắc', red: 'màu đỏ', blue: 'màu xanh dương', green: 'màu xanh lá', yellow: 'màu vàng',
  black: 'màu đen', white: 'màu trắng', body: 'cơ thể', head: 'đầu', hand: 'bàn tay', eye: 'mắt',
  face: 'khuôn mặt', heart: 'trái tim', clothes: 'quần áo', shirt: 'áo sơ mi', shoes: 'giày',
  price: 'giá', cheap: 'rẻ', expensive: 'đắt', free: 'miễn phí', market: 'chợ, thị trường',
  bank: 'ngân hàng', account: 'tài khoản', problem: 'vấn đề', solution: 'giải pháp', idea: 'ý tưởng',
  question: 'câu hỏi', reason: 'lý do', result: 'kết quả', change: 'thay đổi', plan: 'kế hoạch',
  goal: 'mục tiêu', success: 'thành công', failure: 'thất bại', mistake: 'lỗi, sai lầm',
  experience: 'kinh nghiệm', skill: 'kỹ năng', language: 'ngôn ngữ', culture: 'văn hóa',
  history: 'lịch sử', science: 'khoa học', technology: 'công nghệ', environment: 'môi trường',
  government: 'chính phủ', law: 'luật pháp', war: 'chiến tranh', peace: 'hòa bình',
  achieve: 'đạt được', benefit: 'lợi ích', challenge: 'thử thách', determine: 'xác định',
  efficient: 'hiệu quả', grateful: 'biết ơn', hesitate: 'do dự', opportunity: 'cơ hội',
  reliable: 'đáng tin cậy', significant: 'đáng kể', journey: 'hành trình', knowledge: 'kiến thức',
  motivate: 'tạo động lực', negotiate: 'đàm phán', perseverance: 'kiên trì', versatile: 'đa năng',
  appointment: 'cuộc hẹn', borrow: 'mượn', delicious: 'ngon', friendly: 'thân thiện',
  neighbor: 'hàng xóm', schedule: 'lịch trình', comfortable: 'thoải mái', direction: 'hướng',
  exercise: 'tập thể dục', grocery: 'thực phẩm', helpful: 'hữu ích', accurate: 'chính xác',
  announce: 'công bố', collaborate: 'hợp tác', complaint: 'khiếu nại', deadline: 'hạn chót',
  discuss: 'thảo luận', feedback: 'phản hồi', improve: 'cải thiện', ingredient: 'nguyên liệu',
  maintain: 'duy trì', persuade: 'thuyết phục', occasion: 'dịp', recommend: 'đề xuất',
  reduce: 'giảm bớt', responsible: 'có trách nhiệm', symptom: 'triệu chứng', translate: 'dịch',
  application: 'ứng dụng', download: 'tải xuống', password: 'mật khẩu', research: 'nghiên cứu',
  update: 'cập nhật', contribute: 'đóng góp', priority: 'ưu tiên', strategy: 'chiến lược',
  withdraw: 'rút tiền', analyse: 'phân tích', analyze: 'phân tích', assumption: 'giả định',
  comprehensive: 'toàn diện', consequence: 'hậu quả', criteria: 'tiêu chí', demonstrate: 'chứng minh',
  emphasis: 'sự nhấn mạnh', implement: 'triển khai', interpret: 'diễn giải', perspective: 'góc nhìn',
  sustainable: 'bền vững', innovative: 'sáng tạo', leverage: 'tận dụng', thorough: 'kỹ lưỡng',
  fascinating: 'hấp dẫn', versatile: 'đa năng',
};

const CATEGORY_RULES: [RegExp, string][] = [
  [/^(doctor|hospital|health|medicine|patient|symptom|exercise|disease|pain|sick)/, 'Health'],
  [/^(school|teacher|student|book|learn|study|teach|education|research|science)/, 'Education'],
  [/^(company|job|meeting|manager|business|project|team|deadline|client)/, 'Business'],
  [/^(airport|flight|hotel|ticket|passport|travel|journey|map|train|bus)/, 'Travel'],
  [/^(restaurant|food|coffee|tea|rice|bread|meat|fish|fruit|vegetable|eat|drink|menu|delicious)/, 'Food'],
  [/^(computer|phone|internet|email|software|technology|download|password|application|digital)/, 'Technology'],
  [/^(home|house|family|neighbor|daily|schedule|appointment|market|bank|shop)/, 'Daily Life'],
];

function guessCategory(word: string): string {
  for (const [re, cat] of CATEGORY_RULES) {
    if (re.test(word)) return cat;
  }
  return 'General';
}

function levelFromRank(rank: number): Level {
  if (rank < 450) return 'beginner';
  if (rank < 850) return 'intermediate';
  return 'advanced';
}

function exampleFor(word: string, meaning: string): string {
  const w = word.toLowerCase();
  const gloss = meaning.split(/[,;]/)[0].trim();

  if (w.endsWith('ly') && w.length > 4) return `She spoke ${word} during the presentation.`;
  if (['during', 'before', 'after', 'while', 'until', 'since', 'through', 'between', 'among', 'within', 'without'].includes(w))
    return `We met ${w} the lunch break.`;
  if (['because', 'although', 'however', 'therefore', 'otherwise'].includes(w))
    return `${word.charAt(0).toUpperCase() + word.slice(1)}, I decided to study harder.`;
  if (['improve', 'learn', 'study', 'practice', 'develop', 'achieve', 'remember', 'understand'].some((v) => w.includes(v)))
    return `I want to ${word} my English every day.`;
  if (['buy', 'sell', 'pay', 'borrow', 'send', 'receive', 'choose', 'find', 'call', 'try', 'use'].includes(w))
    return `Please ${word} it before tomorrow.`;
  if (['happy', 'sad', 'beautiful', 'important', 'different', 'comfortable', 'friendly', 'cheap', 'expensive', 'hot', 'cold'].includes(w))
    return `The weather today is very ${word}.`;
  if (['africa', 'asia', 'europe', 'america', 'vietnam', 'china', 'japan', 'australia'].includes(w))
    return `Many learners want to visit ${word.charAt(0).toUpperCase() + word.slice(1)} one day.`;
  if (w.endsWith('tion') || w.endsWith('sion') || w.endsWith('ment'))
    return `This ${word} helps us understand the topic better.`;
  if (gloss.length <= 20) return `I learned "${word}" — it means ${gloss}.`;
  return `Knowing "${word}" (${gloss}) is useful for daily conversation.`;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchPhonetic(word: string): Promise<string> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) return `/${word}/`;
    const data = (await res.json()) as { phonetics?: { text?: string }[] }[];
    const text = data[0]?.phonetics?.find((p) => p.text)?.text;
    return text ?? `/${word}/`;
  } catch {
    return `/${word}/`;
  }
}

async function fetchVi(word: string): Promise<string> {
  const key = word.toLowerCase();
  if (VI_MAP[key]) return VI_MAP[key];
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`,
    );
    if (!res.ok) return word;
    const data = (await res.json()) as { responseData?: { translatedText?: string } };
    const text = data.responseData?.translatedText?.trim();
    if (!text || text.includes('[object') || text.toLowerCase() === word) return word;
    return text.charAt(0).toLowerCase() + text.slice(1);
  } catch {
    return word;
  }
}

type CacheEntry = { phonetic: string; meaning: string };

async function main() {
  const targetCount = 1050;
  const wordListPath = join(__dirname, 'vocab-data/google-10000.txt');
  const raw = readFileSync(wordListPath, 'utf-8').split('\n').map((l) => l.trim().toLowerCase()).filter(Boolean);

  const selected: string[] = [];
  const seen = new Set<string>();

  // Priority: curated learner vocabulary with verified Vietnamese glosses
  for (const w of Object.keys(VI_MAP).sort()) {
    if (seen.has(w)) continue;
    seen.add(w);
    selected.push(w);
  }

  for (const w of raw) {
    if (selected.length >= targetCount) break;
    if (w.length < 2 || w.length > 24) continue;
    if (STOP_WORDS.has(w)) continue;
    if (/^\d/.test(w)) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    selected.push(w);
  }

  console.log(`Selected ${selected.length} words (${Object.keys(VI_MAP).length} curated priority)`);

  let cache: Record<string, CacheEntry> = {};
  if (existsSync(cachePath)) {
    cache = JSON.parse(readFileSync(cachePath, 'utf-8')) as Record<string, CacheEntry>;
    console.log(`Loaded cache: ${Object.keys(cache).length} entries`);
  }

  for (let i = 0; i < selected.length; i++) {
    const word = selected[i];
    if (process.argv.includes('--cache-only')) break;
    if (cache[word]?.phonetic && cache[word]?.meaning) continue;
    if (i > 0 && i % 10 === 0) console.log(`Fetching ${i}/${selected.length}...`);
    const [phonetic, meaning] = await Promise.all([fetchPhonetic(word), fetchVi(word)]);
    cache[word] = { phonetic, meaning };
    await sleep(120);
    if (i % 25 === 0) {
      writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    }
  }
  if (!process.argv.includes('--cache-only')) {
    writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  } else {
    console.log('Rebuilding from cache only (--cache-only)');
  }

  const vocabulary: VocabWord[] = selected.map((word, idx) => {
    const entry = cache[word]!;
    const meaning = VI_MAP[word] ?? entry.meaning;
    const category = guessCategory(word);
    const level = levelFromRank(idx);
    return {
      id: `v${idx + 1}`,
      word,
      phonetic: entry.phonetic,
      meaning,
      example: exampleFor(word, meaning),
      category,
      level,
    };
  });

  writeFileSync(outPath, JSON.stringify(vocabulary, null, 2));
  console.log(`Wrote ${vocabulary.length} words → ${outPath}`);
  console.log(`  beginner: ${vocabulary.filter((w) => w.level === 'beginner').length}`);
  console.log(`  intermediate: ${vocabulary.filter((w) => w.level === 'intermediate').length}`);
  console.log(`  advanced: ${vocabulary.filter((w) => w.level === 'advanced').length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
