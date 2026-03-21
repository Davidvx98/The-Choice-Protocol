# 📋 Changelog — The Choice Protocol

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.0.0/)  
y el versionado sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### Planeado
- Modo oscuro/claro toggle
- Soporte para series de TV (TMDB)
- Efecto de sonido ambiente
- Animación de partículas mejorada en Result
- Compartir recomendación en redes sociales

---

## [1.0.0] — 2026-03-21

### 🎉 Lanzamiento inicial — Hackathon Las Píldoras

#### Añadido

**Experiencia narrativa completa:**
- **Envelope.astro** — Sobre animado con GSAP (float, apertura de tapa, sello)
- **Letter.astro** — Carta con efecto máquina de escribir + input de nombre
- **Pills.astro** — Escena Matrix con canvas de lluvia de katakana
- **Questions.astro** — 5 preguntas dinámicas por tipo de contenido
- **Result.astro** — Resultado final con imagen, descripción y justificación IA

**Backend API (Astro SSR):**
- `POST /api/recommend` — Endpoint principal con Gemini + fallback
- `GET  /api/anime` — Proxy a Jikan API (MyAnimeList)
- `GET  /api/movie` — Proxy a TMDB API
- `POST /api/translate` — Traducción con Gemini (es/en/zh)

**Lógica de recomendación:**
- `mapAnswersToTags()` — Mapeo respuestas → géneros + keywords
- `buildGeminiPrompt()` — Prompt optimizado con candidatos de API
- `askGeminiSafe()` — Wrapper con timeout 15s + fallback automático

**UI/UX:**
- Tema cyberpunk con fondo oscuro y efectos glow
- TailwindCSS con colores personalizados (`cyber-purple`, `cyber-blue`, etc.)
- Animaciones GSAP en todas las transiciones
- Diseño responsive (móvil + escritorio)
- Personalización con nombre del usuario
- Panel de traducción multiidioma

**Preguntas implementadas:**
- Anime: mood, duration, story (6 géneros), intensity, vibe
- Películas: mood, duration, story (6 géneros), intensity, era

---

[Unreleased]: https://github.com/Davidvx98/The-Choice-Protocol/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Davidvx98/The-Choice-Protocol/releases/tag/v1.0.0
