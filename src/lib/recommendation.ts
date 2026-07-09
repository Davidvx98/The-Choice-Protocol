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
  animeType?: 'tv' | 'movie';
  episodeRange?: [number, number];
  runtimeRange?: [number, number];
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
  horror: [14, 40],   // Horror, Psychological
  sports: [30],       // Sports
};

// TMDB genre IDs → https://api.themoviedb.org/3/genre/movie/list
const MOVIE_GENRES: Record<string, number[]> = {
  action: [28, 12],     // Action, Adventure
  romance: [10749, 18], // Romance, Drama
  horror: [27, 53],     // Horror, Thriller
  comedy: [35],         // Comedy
  scifi: [878],         // Science Fiction
  thriller: [53, 80],   // Thriller, Crime
  animation: [16],      // Animation
  documentary: [99],    // Documentary
};

const MOOD_KEYWORDS: Record<string, string[]> = {
  energetic: ['fast-paced', 'energetic', 'action'],
  happy: ['uplifting', 'fun', 'lighthearted', 'comedy'],
  nostalgic: ['nostalgic', 'bittersweet', 'warm'],
  melancholic: ['emotional', 'drama', 'bittersweet', 'melancholy'],
  romantic: ['romantic', 'love-story', 'heartfelt'],
  excited: ['action', 'thrilling', 'intense', 'adrenaline'],
  thoughtful: ['philosophical', 'psychological', 'thought-provoking', 'deep'],
};

const EXTRA_KEYWORDS: Record<string, string[]> = {
  ost: ['memorable-soundtrack', 'music'],
  twists: ['plot-twist', 'unpredictable'],
  animation: ['high-quality-animation', 'visual-spectacle'],
  characters: ['character-driven', 'well-written-characters'],
  romance_sub: ['romance', 'love-story'],
  good_ending: ['satisfying-ending'],
  visual: ['visually-stunning', 'cinematography'],
  acting: ['great-performances'],
  open_ending: ['thought-provoking-ending'],
};

const DETAIL_KEYWORDS: Record<string, string[]> = {
  underdog: ['underdog', 'growth'],
  antihero: ['antihero', 'morally-complex'],
  strategic: ['strategy', 'mind-games'],
  ensemble: ['ensemble-cast', 'friendship'],
  fantasy_world: ['fantasy-world', 'magic'],
  daily_life: ['slice-of-life', 'realistic'],
  dystopia: ['dystopian', 'mecha'],
  isekai: ['isekai', 'another-world'],
  post_apocalypse: ['post-apocalyptic'],
  historical: ['historical', 'period'],
  escape: ['escapist', 'immersive'],
  thinking: ['thought-provoking', 'complex'],
  gripping: ['gripping', 'suspenseful'],
  emotional: ['emotional', 'heartfelt'],
};

const ANSWER_LABELS: Record<string, string> = {
  energetic: 'energico', happy: 'alegre', nostalgic: 'nostalgico', melancholic: 'melancolico',
  thoughtful: 'reflexivo', random: 'sorpresa', romantic: 'romantico', excited: 'adrenalina',
  action: 'accion/aventura', romance: 'romance/drama', mystery: 'misterio/thriller',
  comedy: 'comedia', scifi: 'ciencia ficcion', fantasy: 'fantasia/isekai', horror: 'terror',
  sports: 'deportes', thriller: 'thriller/crimen', animation: 'animacion', documentary: 'documental',
  short: 'corto', medium: 'duracion media', mid: 'serie media', long: 'saga larga',
  long2: 'larga', epic: 'epica', light: 'ligera', balanced: 'equilibrada', deep: 'profunda',
  dark: 'oscura', classic: 'clasica', '2000s': 'anos 2000-2010', '2010s': 'anos 2010-2020',
  recent: 'reciente 2020+', ost: 'banda sonora memorable', twists: 'giros de guion',
  characters: 'personajes bien escritos', romance_sub: 'romance destacado',
  good_ending: 'final satisfactorio', visual: 'fotografia/direccion visual',
  acting: 'actuaciones inolvidables', open_ending: 'final abierto/reflexivo',
  underdog: 'underdog', antihero: 'antiheroe complejo', strategic: 'estratega',
  ensemble: 'grupo/equipo', fantasy_world: 'mundo fantastico', daily_life: 'vida cotidiana',
  dystopia: 'futuro distopico', isekai: 'otro mundo', post_apocalypse: 'post-apocaliptico',
  historical: 'historico', escape: 'evadirse', thinking: 'pensar durante dias',
  gripping: 'adictiva', emotional: 'conexion emocional',
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

  const extras = (answers.extras || '').split(',').map(s => s.trim()).filter(Boolean);
  const detailValues = [answers.protagonist, answers.setting, answers.experience].filter(Boolean) as string[];
  const keywords = [
    ...(MOOD_KEYWORDS[answers.mood || ''] || []),
    ...(answers.intensity === 'light' ? ['easy-watch', 'feel-good'] : []),
    ...(answers.intensity === 'deep' ? ['complex', 'deep'] : []),
    ...(answers.intensity === 'dark' ? ['dark', 'mature', 'psychological'] : []),
    ...extras.flatMap(extra => EXTRA_KEYWORDS[extra] || []),
    ...detailValues.flatMap(value => DETAIL_KEYWORDS[value] || []),
  ];

  let yearRange: [number, number] | undefined;
  if (answers.era === 'classic') yearRange = [1970, 1999];
  else if (answers.era === '2000s') yearRange = [2000, 2010];
  else if (answers.era === '2010s') yearRange = [2010, 2020];
  else if (answers.era === 'recent') yearRange = [2020, new Date().getFullYear()];

  let animeType: RecommendationTags['animeType'];
  let episodeRange: RecommendationTags['episodeRange'];
  let runtimeRange: RecommendationTags['runtimeRange'];

  if (type === 'anime') {
    if (answers.duration === 'short') animeType = 'movie';
    else if (answers.duration === 'medium') { animeType = 'tv'; episodeRange = [1, 13]; }
    else if (answers.duration === 'mid') { animeType = 'tv'; episodeRange = [13, 26]; }
    else if (answers.duration === 'long') { animeType = 'tv'; episodeRange = [50, 5000]; }
  } else {
    if (answers.duration === 'short') runtimeRange = [1, 89];
    else if (answers.duration === 'medium') runtimeRange = [90, 120];
    else if (answers.duration === 'long2') runtimeRange = [121, 150];
    else if (answers.duration === 'epic') runtimeRange = [151, 500];
  }

  return {
    genres: genreIds,
    genreNames,
    keywords,
    minScore: INTENSITY_SCORE[answers.intensity || 'balanced'] || 7.0,
    orderBy: answers.mood === 'excited' ? 'popularity' : 'score',
    animeType,
    episodeRange,
    runtimeRange,
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

function humanizeAnswer(value: string): string {
  return value
    .split(',')
    .map(v => ANSWER_LABELS[v.trim()] || v.trim())
    .filter(Boolean)
    .join(', ');
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
  if (safe.mood)         prefLines.push(`- Estado de ánimo: ${humanizeAnswer(safe.mood)}`);
  if (safe.genres)       prefLines.push(`- Géneros favoritos: ${humanizeAnswer(safe.genres)}`);
  if (safe.duration)     prefLines.push(`- Duración preferida: ${humanizeAnswer(safe.duration)}`);
  if (safe.intensity)    prefLines.push(`- Intensidad: ${humanizeAnswer(safe.intensity)}`);
  if (safe.protagonist)  prefLines.push(`- Protagonista ideal: ${humanizeAnswer(safe.protagonist)}`);
  if (safe.setting)      prefLines.push(`- Ambientación: ${humanizeAnswer(safe.setting)}`);
  if (safe.vibe)         prefLines.push(`- Vibra / estilo: ${humanizeAnswer(safe.vibe)}`);
  if (safe.experience)   prefLines.push(`- Experiencia buscada: ${humanizeAnswer(safe.experience)}`);
  if (safe.story)        prefLines.push(`- Tipo de historia: ${humanizeAnswer(safe.story)}`);
  if (safe.era)          prefLines.push(`- Época preferida: ${humanizeAnswer(safe.era)}`);
  if (safe.extras)       prefLines.push(`- Extras / prioridades: ${humanizeAnswer(safe.extras)}`);

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
