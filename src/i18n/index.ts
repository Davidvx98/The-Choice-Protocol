import es from './es.json';
import en from './en.json';

type Lang = 'es' | 'en';
type Translations = typeof es;

const translations: Record<Lang, Translations> = { es, en };

function resolve(lang: string, key: string): unknown {
  const data: unknown = translations[(lang as Lang)] ?? translations.es;
  return key.split('.').reduce((obj: unknown, k: string) => {
    if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[k];
    return undefined;
  }, data);
}

/** Get a translated string, with optional {placeholder} substitution. */
export function t(lang: string, key: string, params?: Record<string, string | number>): string {
  const val = resolve(lang, key);
  if (typeof val !== 'string') return key;
  if (!params) return val;
  return Object.entries(params).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    val
  );
}

/** Get a translated array (e.g. question arrays, loading messages, ranks). */
export function ta<T = unknown>(lang: string, key: string): T[] {
  const val = resolve(lang, key);
  return Array.isArray(val) ? (val as T[]) : [];
}

/** Get a translated object (e.g. genreMap). */
export function to<T = Record<string, string>>(lang: string, key: string): T {
  const val = resolve(lang, key);
  return (val ?? {}) as T;
}

/** Shorthand: read lang from localStorage, default 'es'. */
export function getLang(): Lang {
  return ((localStorage.getItem('lang') ?? 'es') === 'en' ? 'en' : 'es');
}

/** Switch language and reload. One call changes the whole app. */
export function setLang(lang: Lang): void {
  localStorage.setItem('lang', lang);
  location.reload();
}
