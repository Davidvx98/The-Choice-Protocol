# 🏗️ Architecture — The Choice Protocol

Documentación técnica de la arquitectura del sistema.

---

## Visión general

**The Choice Protocol** es una aplicación SSR (Server-Side Rendered) construida con Astro. El servidor gestiona las API routes (endpoints hacia APIs externas e IA), mientras que el cliente gestiona toda la experiencia interactiva con JavaScript vanilla + GSAP.

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                          │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │          SINGLE PAGE EXPERIENCE              │   │
│  │  Envelope → Letter → Pills → Questions →     │   │
│  │  Result                                      │   │
│  │                                              │   │
│  │  Comunicación por CustomEvents               │   │
│  │  Estado en localStorage                      │   │
│  └──────────────────┬───────────────────────────┘   │
│                     │ fetch                          │
└─────────────────────┼───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                  ASTRO SSR SERVER                   │
│                  (@astrojs/node)                    │
│                                                     │
│  ┌────────────────────────────────────────────┐     │
│  │              API ROUTES                    │     │
│  │  POST /api/recommend                       │     │
│  │  GET  /api/anime                           │     │
│  │  GET  /api/movie                           │     │
│  │  POST /api/translate                       │     │
│  └─────────────────┬──────────────────────────┘     │
│                    │                                 │
└────────────────────┼─────────────────────────────── ┘
                     │
         ┌───────────┼───────────────┐
         │           │               │
         ▼           ▼               ▼
    ┌─────────┐ ┌─────────┐ ┌─────────────┐
    │  Jikan  │ │  TMDB   │ │   Gemini    │
    │  API    │ │  API    │ │  Flash API  │
    └─────────┘ └─────────┘ └─────────────┘
```

---

## Patrón de escenas

### Por qué este patrón

En lugar de usar un router o navegación con URLs, optamos por el patrón de **escenas apiladas** porque:

1. Permite transiciones fluidas con GSAP sin recargar la página
2. El estado se mantiene en memoria durante toda la sesión
3. Simplifica la animación en/out de cada escena
4. La URL permanece igual (experiencia tipo app nativa)

### Implementación

```
DOM Structure:
<main>
  <div id="envelope-scene" class="scene scene-visible">  ← visible
  <div id="letter-scene"   class="scene scene-hidden">   ← oculto
  <div id="pills-scene"    class="scene scene-hidden">   ← oculto
  <div id="questions-scene" class="scene scene-hidden">  ← oculto
  <div id="result-scene"   class="scene scene-hidden">   ← oculto
</main>
```

```css
.scene {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s, transform 0.6s;
}
.scene-hidden  { opacity: 0; pointer-events: none; transform: scale(0.95); }
.scene-visible { opacity: 1; pointer-events: auto; transform: scale(1); }
```

### Bus de eventos

El sistema de comunicación entre componentes usa el `window` como bus de eventos:

```
window.dispatchEvent(CustomEvent 'scene:advance')
         │
         ├── Envelope.astro escucha  (a: letter)
         ├── Letter.astro escucha    (a: pills)
         ├── Pills.astro escucha     (a: questions)
         ├── Questions.astro escucha (a: result)
         └── Result.astro escucha    (a: pills, result)
```

---

## Módulos de librería (`src/lib/`)

### `apis.ts`

Clientes para APIs externas. Responsabilidades:

- Construir URLs con query params
- Fetch y manejo de errores HTTP
- Transformar respuestas a tipos internos (`AnimeResult`, `MovieResult`)

```ts
// Tipos exportados
export interface AnimeResult { title, description, image, score, year, episodes, genres }
export interface MovieResult { title, description, image, score, year, runtime, genres }

// Funciones exportadas
export async function searchAnime(params): Promise<AnimeResult[]>
export async function searchMovies(params): Promise<MovieResult[]>
```

### `gemini.ts`

Wrapper de Google Generative AI. Responsabilidades:

- Gestionar el cliente singleton de Gemini
- Aplicar timeout con `Promise.race`
- Proveer variante "safe" con fallback a `null`
- Función específica para traducción

```ts
// Funciones exportadas
export async function askGemini(prompt: string): Promise<string>
// Lanza error si timeout o API falla

export async function askGeminiSafe(prompt: string): Promise<string | null>  
// Devuelve null en lugar de lanzar

export async function translateWithGemini(text: string, targetLang: string): Promise<string | null>
// Wrapper específico para traducción
```

### `recommendation.ts`

Lógica de mapeo y construcción de prompts. Responsabilidades:

- Convertir respuestas del usuario en parámetros de API (`mapAnswersToTags`)
- Construir el prompt optimizado para Gemini (`buildGeminiPrompt`)

```ts
// Tipos exportados
export interface UserAnswers { mood, duration, story, intensity, vibe, era }
export interface RecommendationTags { genres, genreNames, keywords, minScore, orderBy, yearRange }

// Funciones exportadas
export function mapAnswersToTags(type, answers): RecommendationTags
export function buildGeminiPrompt(type, answers, userName, apiResults): string
```

---

## Flujo de datos en `/api/recommend`

```
1. Request body deserializado:
   { type: "anime", answers: {...}, userName: "Marcos" }

2. mapAnswersToTags(type, answers)
   → { genres: [1, 10], minScore: 7.5, orderBy: "score", ... }

3. searchAnime(tags) o searchMovies(tags)
   → AnimeResult[] con los 10 mejores candidatos filtrados

4. buildGeminiPrompt(type, answers, userName, apiResults)
   → String con contexto + candidatos + instrucciones de formato JSON

5. askGeminiSafe(prompt)
   → String JSON o null (si timeout/error)

6. Si Gemini OK:
   - JSON.parse(cleaned)
   - Buscar imagen del título en apiResults
   - Armar objeto resultado completo

7. Si Gemini null:
   - buildFallbackResult(apiResults[0], tags, userName)
   - usa título/imagen de la primera coincidencia de API

8. Response 200 con resultado final
```

---

## Seguridad

### Validaciones implementadas

| Endpoint | Validación |
|----------|-----------|
| `/api/recommend` | Verifica presencia de `type` y `answers` |
| `/api/translate` | Verifica presencia de `text` y `targetLang`; whitelist de idiomas `['es','en','zh']` |
| `/api/anime` | `limit` capped a 25 máximo |
| `/api/movie` | `limit` capped a 25 máximo |

### Variables sensibles

- Las API keys solo existen en el servidor (`.env` no se expone al cliente)
- El cliente nunca ve `GEMINI_API_KEY` ni `TMDB_API_KEY`
- Las validaciones de `targetLang` usan whitelist explícita (previene prompt injection)

### CORS

Al usar Astro SSR con `@astrojs/node`, los endpoints son del mismo origen que el frontend, por lo que no se necesita configuración CORS adicional para el frontend.

---

## Rendimiento

### Estrategias aplicadas

| Técnica | Dónde | Objetivo |
|---------|-------|----------|
| Lazy loading de imágenes | `Result.astro` | No bloquear render inicial |
| GSAP animations off-thread | Todos los componentes | Animaciones a 60fps |
| Promise.race timeout | `gemini.ts` | No bloquear UI si IA lenta |
| Canvas matrix rain cleanup | `Pills.astro` | Liberar memoria al cambiar de escena |
| Singleton de cliente Gemini | `gemini.ts` | Evitar re-inicialización |

### Bundle

El proyecto genera:

- `hoisted.js` — ~85KB gzip (incluye GSAP)
- CSS de Tailwind purgado automáticamente
- HTML inline de Astro (no download extra)

---

## Decisiones técnicas

### ¿Por qué Astro?

- API routes SSR nativas (sin servidor Express separado)
- Cero JS por defecto en páginas estáticas (solo las `<script>` que añadimos)
- Integración nativa con Tailwind y TypeScript
- Simplicidad vs Next.js / Nuxt para proyectos de hackatón

### ¿Por qué no React/Vue?

El proyecto no necesita reactividad de componentes. El estado simple en `localStorage` + CustomEvents es suficiente y más ligero.

### ¿Por qué GSAP y no CSS animations?

- GSAP permite composar timelines complejas de forma declarativa
- Control preciso de easing, delays, callbacks
- `gsap.to()` anima cualquier propiedad CSS (incluyendo `boxShadow` y custom properties)
- Rendimiento optimizado con `will-change` automático

### ¿Por qué localStorage y no sessionStorage o variables en memoria?

- Persiste si el usuario recarga accidentalmente
- El retry desde Result recupera el nombre y la elección
- No se necesita backend para estado de sesión
