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
    // Reject non-JSON content types
    const ct = request.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Unsupported Media Type' }), {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Reject oversized payloads before parsing (text limit is 5000 chars, so 10 KB is more than enough)
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > 10_000) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
