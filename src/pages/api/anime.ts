/**
 * GET /api/anime?genres=1,10&min_score=7
 * Proxy a Jikan API
 */
import type { APIRoute } from 'astro';
import { searchAnime } from '../../lib/apis';

export const GET: APIRoute = async ({ url }) => {
  try {
    const genresParam = url.searchParams.get('genres');
    const genres = genresParam ? genresParam.split(',').map(Number).filter(n => !isNaN(n)) : [];
    const minScoreRaw = parseFloat(url.searchParams.get('min_score') || '6');
    const minScore = Math.max(0, Math.min(10, isNaN(minScoreRaw) ? 6 : minScoreRaw));
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const results = await searchAnime({
      genres,
      minScore,
      limit: Math.min(Math.max(limit, 1), 25),
    });

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[anime] Error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch anime' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
