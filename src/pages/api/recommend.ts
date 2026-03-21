/**
 * POST /api/recommend
 * Endpoint principal: recibe respuestas del usuario,
 * consulta APIs externas, usa Gemini para personalizar
 */
import type { APIRoute } from 'astro';
import { mapAnswersToTags, buildGeminiPrompt } from '../../lib/recommendation';
import { searchAnime, searchMovies } from '../../lib/apis';
import { askGeminiSafe } from '../../lib/gemini';
import type { UserAnswers } from '../../lib/recommendation';

// Sanitise user name: keep only letters, numbers, spaces, max 30 chars
function sanitizeName(raw: unknown): string {
  if (typeof raw !== 'string') return 'Viajero';
  return raw.replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, '').trim().slice(0, 30) || 'Viajero';
}

function clampStr(val: unknown, max: number): string {
  return typeof val === 'string' ? val.slice(0, max) : '';
}

function isValidImageUrl(url: unknown): boolean {
  if (typeof url !== 'string' || !url) return false;
  try {
    const u = new URL(url);
    return (u.protocol === 'https:') &&
      ['cdn.myanimelist.net', 'image.tmdb.org', 'i.ytimg.com'].some(h => u.hostname === h || u.hostname.endsWith('.' + h));
  } catch { return false; }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { type, answers, userName } = body as {
      type: 'anime' | 'movie';
      answers: UserAnswers;
      userName: string;
    };

    if (type !== 'anime' && type !== 'movie') {
      return new Response(JSON.stringify({ error: 'Invalid type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!answers || typeof answers !== 'object') {
      return new Response(JSON.stringify({ error: 'Missing answers' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const safeName = sanitizeName(userName);

    // 1. Mapear respuestas a tags
    const tags = mapAnswersToTags(type, answers);

    // 2. Buscar en API externa
    let apiResults: any[] = [];
    try {
      if (type === 'anime') {
        apiResults = await searchAnime({
          genres: tags.genres,
          minScore: tags.minScore,
          orderBy: tags.orderBy,
          limit: 10,
        });
      } else {
        apiResults = await searchMovies({
          genres: tags.genres,
          minScore: tags.minScore,
          yearRange: tags.yearRange,
          limit: 10,
        });
      }
    } catch (apiErr) {
      console.error('[API] External API error:', apiErr);
    }

    // 3. Intentar Gemini para personalización
    const prompt = buildGeminiPrompt(type, answers, safeName, apiResults);
    const geminiResponse = await askGeminiSafe(prompt);

    let result: any;

    if (geminiResponse) {
      // Parsear respuesta de Gemini
      try {
        // Limpiar posible markdown wrapping
        const cleaned = geminiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);

        // Acepta array o objeto con campo recommendations
        const items: any[] = Array.isArray(parsed)
          ? parsed
          : (Array.isArray(parsed.recommendations) ? parsed.recommendations : [parsed]);

        const recommendations = items.slice(0, 3).map((item: any) => {
          const match = apiResults.find(r =>
            r.title.toLowerCase().includes((item.title || '').toLowerCase()) ||
            (item.title || '').toLowerCase().includes(r.title.toLowerCase())
          );
          return {
            title: clampStr(item.title, 200),
            description: clampStr(item.description, 1000),
            justification: clampStr(item.justification, 1000),
            image: isValidImageUrl(match?.image) ? match.image : '',
            score: match?.score,
            year: match?.year,
            episodes: match?.episodes,
            runtime: match?.runtime,
            genres: match?.genres || tags.genreNames,
          };
        });

        result = { recommendations };
      } catch (parseErr) {
        console.error('[Gemini] Parse error, using fallback');
        result = buildFallbackResult(apiResults, tags, safeName);
      }
    } else {
      // Fallback sin IA
      result = buildFallbackResult(apiResults, tags, safeName);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[recommend] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

function buildFallbackResult(apiResults: any[], tags: any, userName: string) {
  if (!apiResults.length) {
    return {
      recommendations: [{
        title: 'No encontramos resultados',
        description: 'Intenta con diferentes opciones.',
        justification: 'No se encontraron resultados que coincidan con tus preferencias.',
        genres: [],
      }],
    };
  }

  return {
    recommendations: apiResults.slice(0, 3).map((r, i) => ({
      title: r.title,
      description: r.description,
      justification: i === 0
        ? `Basándonos en tus preferencias, ${userName}, creemos que "${r.title}" es perfecta para ti. Tiene una puntuación de ${r.score}.`
        : `"${r.title}" también podría gustarte dado tu perfil.`,
      image: r.image,
      score: r.score,
      year: r.year,
      episodes: r.episodes,
      runtime: r.runtime,
      genres: r.genres || tags.genreNames,
    })),
  };
}
