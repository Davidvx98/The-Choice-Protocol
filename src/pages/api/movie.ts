/**
 * GET /api/movie?genres=28,12&min_score=7
 * Proxy a TMDB API
 */
import type { APIRoute } from 'astro';
import { searchMovies } from '../../lib/apis';

export const GET: APIRoute = async ({ url }) => {
  try {
    const genresParam = url.searchParams.get('genres');
    const genres = genresParam ? genresParam.split(',').map(Number).filter(n => !isNaN(n)) : [];
    const minScore = parseFloat(url.searchParams.get('min_score') || '6');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const yearFrom = url.searchParams.get('year_from');
    const yearTo = url.searchParams.get('year_to');
    const yearRange = yearFrom && yearTo
      ? [parseInt(yearFrom), parseInt(yearTo)] as [number, number]
      : undefined;

    const results = await searchMovies({
      genres,
      minScore: isNaN(minScore) ? 6 : minScore,
      yearRange,
      limit: Math.min(Math.max(limit, 1), 25),
    });

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[movie] Error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch movies' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
