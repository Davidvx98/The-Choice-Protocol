# 📡 API Reference — The Choice Protocol

Documentación completa de todos los endpoints de la API.

---

## Base URL

```
Desarrollo:  http://localhost:4321/api
Producción:  https://tu-dominio.com/api
```

---

## Endpoints

### `POST /api/recommend`

El endpoint principal. Recibe las respuestas del usuario, consulta las APIs externas y usa Gemini para personalizar la recomendación.

#### Request

```http
POST /api/recommend
Content-Type: application/json
```

```json
{
  "type": "anime",
  "userName": "Marcos",
  "answers": {
    "mood": "excited",
    "duration": "medium",
    "story": "action",
    "intensity": "deep",
    "vibe": "epic"
  }
}
```

#### Campos del body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `type` | `"anime" \| "movie"` | ✅ | Tipo de contenido elegido |
| `userName` | `string` | ❌ | Nombre del usuario (para personalizar IA) |
| `answers` | `object` | ✅ | Respuestas a las preguntas |

#### Campos de `answers`

| Campo | Valores posibles |
|-------|-----------------|
| `mood` | `"happy"`, `"melancholic"`, `"excited"`, `"thoughtful"` |
| `duration` | `"short"`, `"medium"`, `"long"`, `"any"` |
| `story` | Anime: `"action"`, `"romance"`, `"mystery"`, `"comedy"`, `"scifi"`, `"fantasy"` · Películas: `"action"`, `"romance"`, `"horror"`, `"comedy"`, `"scifi"`, `"documentary"` |
| `intensity` | `"light"`, `"balanced"`, `"deep"`, `"dark"` |
| `vibe` | (solo anime) `"epic"`, `"characters"`, `"twists"`, `"visual"` |
| `era` | (solo películas) `"classic"`, `"modern"`, `"recent"`, `"any"` |

#### Response `200 OK`

```json
{
  "title": "Attack on Titan",
  "description": "En un mundo donde la humanidad vive aterrorizada por gigantes...",
  "justification": "Marcos, dado que buscas adrenalina con gran profundidad narrativa, Attack on Titan es perfecta. Su ritmo vertiginoso y sus giros de trama te mantendrán al borde del asiento.",
  "image": "https://cdn.myanimelist.net/images/anime/...",
  "score": 9.1,
  "year": 2013,
  "episodes": 25,
  "genres": ["Action", "Drama", "Fantasy"],
  "extras": [
    {
      "title": "Demon Slayer",
      "subtitle": "Por su animación épica y personajes memorables",
      "image": "https://cdn.myanimelist.net/images/..."
    },
    {
      "title": "Fullmetal Alchemist: Brotherhood",
      "subtitle": "Si buscas aún más profundidad narrativa",
      "image": "https://cdn.myanimelist.net/images/..."
    }
  ]
}
```

#### Response fields

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `title` | `string` | Título de la recomendación principal |
| `description` | `string` | Sinopsis breve |
| `justification` | `string` | Explicación personalizada (generada por IA o fallback) |
| `image` | `string` | URL de la imagen/póster |
| `score` | `number` | Puntuación (1-10) |
| `year` | `number` | Año de estreno/emisión |
| `episodes` | `number?` | Número de episodios (solo anime) |
| `runtime` | `string?` | Duración (solo películas) |
| `genres` | `string[]` | Lista de géneros |
| `extras` | `object[]` | Hasta 2 recomendaciones adicionales |

#### Errores

| Status | Descripción |
|--------|-------------|
| `400` | Faltan `type` o `answers` en el body |
| `500` | Error interno del servidor |

---

### `GET /api/anime`

Proxy a la API de Jikan (MyAnimeList). Devuelve lista de animes filtrados.

#### Request

```http
GET /api/anime?genres=1,10&min_score=7&limit=10
```

#### Query Parameters

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `genres` | `string` | - | IDs de género separados por coma |
| `min_score` | `number` | `6` | Puntuación mínima (1-10) |
| `limit` | `number` | `10` | Resultados (máx. 25) |

#### IDs de géneros de Jikan

| Género | ID |
|--------|----|
| Action | 1 |
| Comedy | 4 |
| Mystery | 7 |
| Fantasy | 10 |
| Romance | 22 |
| Sci-Fi | 24 |
| Slice of Life | 36 |
| Suspense | 41 |
| Drama | 8 |

#### Response `200 OK`

```json
{
  "results": [
    {
      "title": "Attack on Titan",
      "description": "Sinopsis...",
      "image": "https://cdn.myanimelist.net/...",
      "score": 9.1,
      "year": 2013,
      "episodes": 25,
      "genres": ["Action", "Drama", "Fantasy"]
    }
  ]
}
```

---

### `GET /api/movie`

Proxy a la API de TMDB. Devuelve lista de películas filtradas.

> ⚠️ Requiere `TMDB_API_KEY` configurada.

#### Request

```http
GET /api/movie?genres=28,12&min_score=7&year_from=2010&year_to=2020&limit=10
```

#### Query Parameters

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `genres` | `string` | - | IDs de género separados por coma |
| `min_score` | `number` | `6` | Puntuación mínima (1-10) |
| `year_from` | `number` | - | Año de inicio del rango |
| `year_to` | `number` | - | Año de fin del rango |
| `limit` | `number` | `10` | Resultados (máx. 25) |

#### IDs de géneros de TMDB

| Género | ID |
|--------|----|
| Action | 28 |
| Adventure | 12 |
| Romance | 10749 |
| Drama | 18 |
| Horror | 27 |
| Thriller | 53 |
| Comedy | 35 |
| Sci-Fi | 878 |
| Documentary | 99 |

#### Response `200 OK`

```json
{
  "results": [
    {
      "title": "Inception",
      "description": "Un ladrón que roba secretos...",
      "image": "https://image.tmdb.org/t/p/w500/...",
      "score": 8.4,
      "year": 2010,
      "genres": []
    }
  ]
}
```

---

### `POST /api/translate`

Traduce un texto a otro idioma usando Gemini Flash.

> ⚠️ Requiere `GEMINI_API_KEY` configurada.

#### Request

```http
POST /api/translate
Content-Type: application/json
```

```json
{
  "text": "Attack on Titan: En un mundo donde la humanidad vive...",
  "targetLang": "en"
}
```

#### Campos del body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `text` | `string` | ✅ | Texto a traducir |
| `targetLang` | `"es" \| "en" \| "zh"` | ✅ | Idioma destino |

#### Response `200 OK`

```json
{
  "translated": "Attack on Titan: In a world where humanity lives walled in..."
}
```

#### Errores

| Status | Descripción |
|--------|-------------|
| `400` | Faltan `text` o `targetLang`, o `targetLang` no es válido |
| `502` | Gemini no respondió o devolvió error |
| `500` | Error interno del servidor |

---

## Códigos de error comunes

```json
{
  "error": "Descripción del error"
}
```

| Error | Causa |
|-------|-------|
| `"Missing type or answers"` | Body incompleto en `/api/recommend` |
| `"Missing text or targetLang"` | Body incompleto en `/api/translate` |
| `"Invalid target language"` | `targetLang` no es `es`, `en` o `zh` |
| `"TMDB_API_KEY not set"` | Variable de entorno no configurada |
| `"Gemini timeout"` | La IA excedió 15 segundos de respuesta |
| `"Translation failed"` | Gemini devolvió null |

---

## Flujo interno de `/api/recommend`

```
Request recibida
      │
      ▼
mapAnswersToTags()          ← Convierte respuestas → géneros + keywords
      │
      ▼
searchAnime() / searchMovies()  ← Consulta Jikan o TMDB con los tags
      │
      ▼
buildGeminiPrompt()         ← Construye prompt con candidatos + contexto
      │
      ▼
askGeminiSafe()             ← Llama a Gemini con timeout de 15s
      │
   ┌──┴──────────────────────┐
   │ Gemini OK               │ Gemini falló / timeout
   ▼                         ▼
Parsear JSON              buildFallbackResult()
 de Gemini                  (usa apiResults[0])
   │                         │
   └──────────┬──────────────┘
              ▼
         Response 200
```
