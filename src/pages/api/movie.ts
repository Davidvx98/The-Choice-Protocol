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
    const minScoreRaw = parseFloat(url.searchParams.get('min_score') || '6');
    const minScore = Math.max(0, Math.min(10, isNaN(minScoreRaw) ? 6 : minScoreRaw));
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const yearFrom = url.searchParams.get('year_from');
    const yearTo = url.searchParams.get('year_to');
    const currentYear = new Date().getFullYear();
    const yearRange = yearFrom && yearTo
      ? [Math.max(1900, Math.min(currentYear, parseInt(yearFrom))), Math.max(1900, Math.min(currentYear + 5, parseInt(yearTo)))] as [number, number]
      : undefined;

    const results = await searchMovies({
      genres,
      minScore,
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
