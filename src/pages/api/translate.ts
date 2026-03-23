/**
 * POST /api/translate
 * Traduce texto usando Groq (preferido) con fallback a Gemini
 */
import type { APIRoute } from 'astro';
import { translateWithGroq } from '../../lib/groq';
import { translateWithGemini } from '../../lib/gemini';

const VALID_LANGS = ['es', 'en'];

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { text, targetLang } = body as { text: string; targetLang: string };

    if (!text || typeof text !== 'string' || !targetLang) {
      return new Response(JSON.stringify({ error: 'Missing text or targetLang' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (text.length > 5000) {
      return new Response(JSON.stringify({ error: 'Text too long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!VALID_LANGS.includes(targetLang)) {
      return new Response(JSON.stringify({ error: 'Invalid target language' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Groq primero (más rápido y cuota más generosa), Gemini como fallback
    const translated = (await translateWithGroq(text, targetLang)) ?? (await translateWithGemini(text, targetLang));

    if (!translated) {
      return new Response(JSON.stringify({ error: 'Translation failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ translated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[translate] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
