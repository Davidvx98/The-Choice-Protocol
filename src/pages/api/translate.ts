/**
 * POST /api/translate
 * Traduce texto usando Gemini Flash
 */
import type { APIRoute } from 'astro';
import { translateWithGemini } from '../../lib/gemini';

const VALID_LANGS = ['es', 'en', 'zh'];

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { text, targetLang } = body as { text: string; targetLang: string };

    if (!text || !targetLang) {
      return new Response(JSON.stringify({ error: 'Missing text or targetLang' }), {
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

    const translated = await translateWithGemini(text, targetLang);

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
