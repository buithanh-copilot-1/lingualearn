// Machine translation via MyMemory (free tier, no API key).
import { trackApiRequest } from '../utils/apiActivity';

const TRANSLATE_API = 'https://api.mymemory.translated.net/get';

interface TranslateResponse {
  responseData?: { translatedText?: string };
}

export async function translateEnToVi(text: string): Promise<string> {
  const q = text.trim();
  if (!q) return '';

  const url = `${TRANSLATE_API}?q=${encodeURIComponent(q)}&langpair=en|vi`;
  const res = await trackApiRequest(() => fetch(url));
  if (!res.ok) return '';

  const data = (await res.json()) as TranslateResponse;
  return data.responseData?.translatedText?.trim() ?? '';
}

export async function translateManyEnToVi(texts: string[]): Promise<string[]> {
  return Promise.all(texts.map((text) => translateEnToVi(text)));
}
