/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly GEMINI_API_KEY?: string;
  readonly GROQ_API_KEY?: string;
  readonly TMDB_API_KEY?: string;
  readonly TMDB_ACCESS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
