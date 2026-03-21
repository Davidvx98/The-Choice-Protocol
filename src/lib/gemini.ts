/**
 * Wrapper para Google Gemini Flash (capa gratuita)
 * Incluye timeout con Promise.race, retry automático en 429, y fallback
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.GEMINI_API_KEY || '';
const MODELS   = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];
const TIMEOUT_MS = 20_000;
const MAX_RETRIES = 2;

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    if (!API_KEY) throw new Error('GEMINI_API_KEY not set');
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/**
 * Extrae el retryDelay en ms de un error 429 de Gemini.
 * Busca el patrón "retryDelay":"Xs" en el mensaje.
 */
function parseRetryDelay(errMessage: string): number {
  const match = errMessage.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/);
  if (match) return Math.ceil(parseFloat(match[1]) * 1000) + 200; // +200ms buffer
  return 4000; // default 4s
}

/**
 * Llama a Gemini con timeout, retry automático en 429, y fallback de modelo
 */
export async function askGemini(prompt: string): Promise<string> {
  if (!API_KEY) throw new Error('No API key configured');

  for (const modelName of MODELS) {
    const model = getClient().getGenerativeModel({ model: modelName });
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      attempt++;
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini timeout')), TIMEOUT_MS)
        );
        const generatePromise = model.generateContent(prompt)
          .then(result => result.response.text());

        return await Promise.race([generatePromise, timeoutPromise]);
      } catch (err) {
        const msg = (err as Error).message || '';
        const is429 = msg.includes('429') || msg.toLowerCase().includes('quota');

        if (is429 && attempt < MAX_RETRIES) {
          const delay = parseRetryDelay(msg);
          console.warn(`[Gemini] 429 on ${modelName}, retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }

        if (is429 && modelName !== MODELS[MODELS.length - 1]) {
          // Quota exhausted on this model — try next model
          console.warn(`[Gemini] Quota exhausted on ${modelName}, trying fallback model...`);
          break;
        }

        throw err; // non-429 or last model — propagate
      }
    }
  }

  throw new Error('All Gemini models quota exhausted');
}

/**
 * Wrapper con fallback: intenta Gemini, si falla devuelve null
 */
export async function askGeminiSafe(prompt: string): Promise<string | null> {
  try {
    return await askGemini(prompt);
  } catch (err) {
    console.error('[Gemini] Error:', (err as Error).message);
    return null;
  }
}

/**
 * Traduce texto usando Gemini
 */
export async function translateWithGemini(text: string, targetLang: string): Promise<string | null> {
  const langMap: Record<string, string> = {
    es: 'español',
    en: 'inglés',
    zh: 'chino mandarín',
  };

  const langName = langMap[targetLang] || targetLang;
  // Delimit user text to prevent prompt injection
  const prompt = `Traduce el siguiente texto a ${langName}. Responde SOLO con la traducción, sin explicaciones.\n\n---BEGIN TEXT---\n${text.slice(0, 5000)}\n---END TEXT---`;

  return askGeminiSafe(prompt);
}
