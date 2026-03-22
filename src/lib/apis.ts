/**
 * Clientes para APIs externas: Jikan (anime) y TMDB (películas)
 */

const JIKAN_BASE = 'https://api.jikan.moe/v4';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

/**
 * Devuelve true si el título parece ser una secuela, segunda temporada
 * o entrega posterior (ej. "Season 2", "Part II", "Rocky IV", etc.).
 */
function isSequel(title: string): boolean {
  const patterns = [
    /\bseason\s*[2-9]\d*/i,                    // Season 2, Season 3…
    /\b[2-9]\d*\s*(?:st|nd|rd|th)\s+season/i, // 2nd Season, 3rd Season…
    /\bpart\s*(?:[2-9]\d*|ii|iii|iv|v+)\b/i,  // Part 2, Part II…
    /[\s:]\s*[2-9]\d*\s*$/,                   // termina en ": 2" o " 3"
    /\b(?:ii|iii|iv|vi{1,3}|ix)\b/i,           // numerales romanos II–IX
    /\b(?:chapter|arc|cour)\s*[2-9]\d*/i,      // Chapter 2, Cour 2…
    /\bcontinuation\b/i,                        // "continuation"
  ];
  return patterns.some(p => p.test(title));
}

// --- JIKAN (Anime) ---

export interface AnimeResult {
  title: string;
  description: string;
  image: string;
  score: number;
  year: number;
  episodes: number;
  genres: string[];
}

export async function searchAnime(params: {
  genres?: number[];
  minScore?: number;
  orderBy?: string;
  limit?: number;
}): Promise<AnimeResult[]> {
  const { genres = [], minScore = 6, orderBy = 'score', limit = 10 } = params;
  
  // Pedimos el doble para tener margen tras filtrar secuelas
  const fetchLimit = Math.min(limit * 2, 25);

  const query = new URLSearchParams({
    order_by: orderBy,
    sort: 'desc',
    min_score: String(minScore),
    limit: String(fetchLimit),
    sfw: 'true',
  });

  if (genres.length > 0) {
    query.set('genres', genres.join(','));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let res: Response;
  try {
    res = await fetch(`${JIKAN_BASE}/anime?${query}`, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);
  
  const data = await res.json();
  
  const mapped: AnimeResult[] = (data.data || []).map((item: any) => ({
    title: item.title_english || item.title || 'Sin título',
    description: item.synopsis || '',
    image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    score: item.score || 0,
    year: item.year || item.aired?.prop?.from?.year || 0,
    episodes: item.episodes || 0,
    genres: (item.genres || []).map((g: any) => g.name),
  }));

  return mapped.filter(a => !isSequel(a.title)).slice(0, limit);
}

// --- TMDB (Películas) ---

export interface MovieResult {
  title: string;
  description: string;
  image: string;
  score: number;
  year: number;
  runtime?: string;
  genres: string[];
}

export async function searchMovies(params: {
  genres?: number[];
  minScore?: number;
  yearRange?: [number, number];
  limit?: number;
}): Promise<MovieResult[]> {
  const TMDB_KEY = (process.env.TMDB_API_KEY || import.meta.env.TMDB_API_KEY || '').trim();
  if (!TMDB_KEY) throw new Error('TMDB_API_KEY not set');

  const { genres = [], minScore = 6, yearRange, limit = 10 } = params;

  const query = new URLSearchParams({
    api_key: TMDB_KEY,
    language: 'es-ES',
    sort_by: 'vote_average.desc',
    'vote_average.gte': String(minScore),
    'vote_count.gte': '100',
    page: '1',
    include_adult: 'false',
  });

  if (genres.length > 0) {
    query.set('with_genres', genres.join(','));
  }
  if (yearRange) {
    query.set('primary_release_date.gte', `${yearRange[0]}-01-01`);
    query.set('primary_release_date.lte', `${yearRange[1]}-12-31`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let res: Response;
  try {
    res = await fetch(`${TMDB_BASE}/discover/movie?${query}`, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);

  const data = await res.json();

  const mapped: MovieResult[] = (data.results || []).map((item: any) => ({
    title: item.title || 'Sin título',
    description: item.overview || '',
    image: item.poster_path ? `${TMDB_IMG}${item.poster_path}` : '',
    score: item.vote_average || 0,
    year: item.release_date ? parseInt(item.release_date.split('-')[0]) : 0,
    genres: [], // TMDB discover doesn't include genre names directly
  }));

  return mapped.filter(m => !isSequel(m.title)).slice(0, limit);
}
