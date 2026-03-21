/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly GEMINI_API_KEY: string;
  readonly TMDB_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
