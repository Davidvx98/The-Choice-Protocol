/**
 * Wrapper para Groq (free tier)
 * Modelos disponibles: llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768
 * Free tier: ~6000 req/día, sin tarjeta de crédito
 * Obtén tu API key en: https://console.groq.com/keys
 */

import Groq from 'groq-sdk';

const API_KEY = (process.env.GROQ_API_KEY || import.meta.env.GROQ_API_KEY || '').trim();

// Fallback chain de menor a mayor rapidez
const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
const TIMEOUT_MS = 20_000;

let groqClient: Groq | null = null;

function getClient(): Groq {
  if (!groqClient) {
    if (!API_KEY) throw new Error('GROQ_API_KEY not set');
    groqClient = new Groq({ apiKey: API_KEY });
  }
  return groqClient;
}

export function isGroqAvailable(): boolean {
  return !!API_KEY;
}

export async function askGroq(prompt: string): Promise<string> {
  if (!API_KEY) throw new Error('GROQ_API_KEY not set');

  for (const model of MODELS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const completion = await getClient().chat.completions.create(
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.7,
        },
        { signal: controller.signal }
      );

      clearTimeout(timer);
      return completion.choices[0]?.message?.content ?? '';
    } catch (err) {
      const msg = (err as Error).message || '';
      const is429 = msg.includes('429') || msg.toLowerCase().includes('rate limit');

      if (is429 && model !== MODELS[MODELS.length - 1]) {
        console.warn(`[Groq] Rate limit on ${model}, trying next model...`);
        continue;
      }
      throw err;
    }
  }

  throw new Error('All Groq models exhausted');
}

export async function askGroqSafe(prompt: string): Promise<string | null> {
  try {
    return await askGroq(prompt);
  } catch (err) {
    const msg = (err as Error).message || '';
    if (msg.includes('429') || msg.toLowerCase().includes('rate limit')) {
      console.warn('[Groq] Rate limit alcanzado - usando fallback sin IA');
    } else if (msg.includes('GROQ_API_KEY not set')) {
      // Silencioso: key no configurada es esperado
    } else {
      console.error('[Groq] Error:', msg);
    }
    return null;
  }
}

/**
 * Traduce texto usando Groq (siempre preferido sobre Gemini por velocidad y cuota)
 */
export async function translateWithGroq(text: string, targetLang: string): Promise<string | null> {
  if (!API_KEY) return null;

  const langMap: Record<string, string> = {
    es: 'español',
    en: 'inglés',
  };
  const langName = langMap[targetLang] || targetLang;
  const prompt = `Traduce el siguiente texto a ${langName}. Responde SOLO con la traducción, sin explicaciones ni texto adicional.\n\n---BEGIN TEXT---\n${text.slice(0, 5000)}\n---END TEXT---`;

  return askGroqSafe(prompt);
}
