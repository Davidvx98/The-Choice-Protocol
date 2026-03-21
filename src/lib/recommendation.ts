/**
 * Mapea respuestas del usuario → tags para filtrar APIs
 * Lógica de recomendación sin IA (fallback)
 */

export interface UserAnswers {
  // shared
  mood?:        string;
  genres?:      string;  // comma-separated multi-select
  duration?:    string;
  intensity?:   string;
  extras?:      string;  // comma-separated multi-select
  // anime-specific
  protagonist?: string;
  setting?:     string;
  vibe?:        string;
  // movie-specific
  experience?:  string;
  story?:       string;
  era?:         string;
}

export interface RecommendationTags {
  genres: number[];       // IDs de género para Jikan/TMDB
  genreNames: string[];
  keywords: string[];
  minScore: number;
  orderBy: string;
  yearRange?: [number, number];
}

// Jikan genre IDs → https://api.jikan.moe/v4/genres/anime
const ANIME_GENRES: Record<string, number[]> = {
  action: [1],       // Action
  romance: [22, 8],  // Romance, Drama
  mystery: [7, 41],  // Mystery, Suspense
  comedy: [4, 36],   // Comedy, Slice of Life
  scifi: [24],       // Sci-Fi
  fantasy: [10],     // Fantasy
};

// TMDB genre IDs → https://api.themoviedb.org/3/genre/movie/list
const MOVIE_GENRES: Record<string, number[]> = {
  action: [28, 12],     // Action, Adventure
  romance: [10749, 18], // Romance, Drama
  horror: [27, 53],     // Horror, Thriller
  comedy: [35],         // Comedy
  scifi: [878],         // Science Fiction
  documentary: [99],    // Documentary
};

const MOOD_KEYWORDS: Record<string, string[]> = {
  happy: ['uplifting', 'fun', 'lighthearted', 'comedy'],
  melancholic: ['emotional', 'drama', 'bittersweet', 'melancholy'],
  excited: ['action', 'thrilling', 'intense', 'adrenaline'],
  thoughtful: ['philosophical', 'psychological', 'thought-provoking', 'deep'],
};

const INTENSITY_SCORE: Record<string, number> = {
  light: 6.0,
  balanced: 7.0,
  deep: 7.5,
  dark: 7.0,
};

export function mapAnswersToTags(type: 'anime' | 'movie', answers: UserAnswers): RecommendationTags {
  const genreMap = type === 'anime' ? ANIME_GENRES : MOVIE_GENRES;

  // Merge genres from story + multi-select genres field
  const genreIds: number[] = [];
  const genreNames: string[] = [];

  if (answers.story && genreMap[answers.story]) {
    genreIds.push(...genreMap[answers.story]);
    genreNames.push(answers.story);
  }

  // Parse comma-separated genres multi-select (e.g. "action,romance,scifi")
  if (answers.genres) {
    for (const g of answers.genres.split(',').map(s => s.trim()).filter(Boolean)) {
      if (genreMap[g] && !genreNames.includes(g)) {
        genreIds.push(...genreMap[g]);
        genreNames.push(g);
      }
    }
  }

  const keywords = [
    ...(MOOD_KEYWORDS[answers.mood || ''] || []),
    ...(answers.intensity === 'dark' ? ['dark', 'mature', 'psychological'] : []),
    ...(answers.vibe === 'epic' ? ['epic', 'grand'] : []),
    ...(answers.vibe === 'characters' ? ['character-driven'] : []),
    ...(answers.vibe === 'twists' ? ['plot-twist', 'unpredictable'] : []),
    ...(answers.vibe === 'visual' ? ['visually-stunning', 'artistic'] : []),
  ];

  let yearRange: [number, number] | undefined;
  if (answers.era === 'classic') yearRange = [1970, 1999];
  else if (answers.era === 'modern') yearRange = [2000, 2015];
  else if (answers.era === 'recent') yearRange = [2016, new Date().getFullYear()];

  return {
    genres: genreIds,
    genreNames,
    keywords,
    minScore: INTENSITY_SCORE[answers.intensity || 'balanced'] || 7.0,
    orderBy: answers.mood === 'excited' ? 'popularity' : 'score',
    yearRange,
  };
}

/** Sanitise a single answer value: keep only safe characters, cap length */
function sanitizeAnswer(val: unknown, maxLen = 80): string {
  if (typeof val !== 'string') return '';
  return val.replace(/[\n\r\t`{}\[\]\\]/g, '').trim().slice(0, maxLen);
}

/** Sanitise all answer fields to prevent prompt injection */
function sanitizeAnswers(raw: UserAnswers): UserAnswers {
  const out: UserAnswers = {};
  const keys: (keyof UserAnswers)[] = [
    'mood', 'genres', 'duration', 'intensity', 'extras',
    'protagonist', 'setting', 'vibe', 'experience', 'story', 'era',
  ];
  for (const k of keys) {
    if (raw[k]) out[k] = sanitizeAnswer(raw[k]);
  }
  return out;
}

/**
 * Genera un prompt optimizado para Gemini basado en las respuestas
 */
export function buildGeminiPrompt(
  type: 'anime' | 'movie',
  answers: UserAnswers,
  userName: string,
  apiResults: any[]
): string {
  const safe = sanitizeAnswers(answers);
  const category = type === 'anime' ? 'anime' : 'película';
  const titles = apiResults.map(r => `"${r.title}" (${r.score}/10, ${r.year})`).join(', ');

  // Collect all non-empty answers into readable lines
  const prefLines: string[] = [];
  if (safe.mood)         prefLines.push(`- Estado de ánimo: ${safe.mood}`);
  if (safe.genres)       prefLines.push(`- Géneros favoritos: ${safe.genres}`);
  if (safe.duration)     prefLines.push(`- Duración preferida: ${safe.duration}`);
  if (safe.intensity)    prefLines.push(`- Intensidad: ${safe.intensity}`);
  if (safe.protagonist)  prefLines.push(`- Protagonista ideal: ${safe.protagonist}`);
  if (safe.setting)      prefLines.push(`- Ambientación: ${safe.setting}`);
  if (safe.vibe)         prefLines.push(`- Vibra / estilo: ${safe.vibe}`);
  if (safe.experience)   prefLines.push(`- Experiencia buscada: ${safe.experience}`);
  if (safe.story)        prefLines.push(`- Tipo de historia: ${safe.story}`);
  if (safe.era)          prefLines.push(`- Época preferida: ${safe.era}`);
  if (safe.extras)       prefLines.push(`- Extras / prioridades: ${safe.extras}`);

  const prefsBlock = prefLines.length
    ? prefLines.join('\n')
    : '- Sin preferencias específicas';

  return `Eres un experto recomendador de ${category}s con conocimiento enciclopédico.
Un usuario llamado "${userName}" busca exactamente 3 recomendaciones perfectamente personalizadas.

Sus preferencias detalladas:
${prefsBlock}

Candidatos encontrados en base de datos:
${titles || 'ninguno específico — sugiere tú directamente'}

INSTRUCCIONES ESTRICTAS:
1. Analiza TODAS las preferencias del usuario (ánimo, géneros, vibra, protagonista, ambientación, intensidad, extras) para hacer un match preciso
2. Prioriza los candidatos de la base de datos que mejor encajen. Si ninguno encaja bien, sugiere títulos populares y reconocidos que SÍ encajen
3. NUNCA inventes títulos que no existan — usa solo ${category}s reales y conocidos
4. Ordena de mejor a peor match para las preferencias del usuario
5. Las descripciones deben ser sinopsis reales y precisas del ${category}
6. La justificación debe explicar POR QUÉ encaja con las preferencias específicas de ${userName}
7. Responde SOLO con un array JSON válido — exactamente 3 objetos, sin markdown, sin texto adicional

Formato exacto:
[
  {
    "title": "Título exacto (nombre real y reconocido)",
    "description": "Sinopsis real y precisa (2-3 frases)",
    "justification": "Por qué encaja con las preferencias de ${userName} — menciona qué aspectos coinciden"
  },
  { "title": "...", "description": "...", "justification": "..." },
  { "title": "...", "description": "...", "justification": "..." }
]`;
}
