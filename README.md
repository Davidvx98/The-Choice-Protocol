<div align="center">

# 💊 The Choice Protocol
### *El Protocolo de Elección*

**Una experiencia narrativa interactiva impulsada por IA**  
Descubre qué ver hoy a través de un viaje cinematográfico único

[![Astro](https://img.shields.io/badge/Astro-4.x-FF5D01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![GSAP](https://img.shields.io/badge/GSAP-3.x-88CE02?style=flat-square&logo=greensock&logoColor=white)](https://gsap.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

---

<img src="https://img.shields.io/badge/🎬_Anime-Píldora_Roja-FF2D55?style=for-the-badge" />
&nbsp;
<img src="https://img.shields.io/badge/🎥_Películas-Píldora_Azul-00D4FF?style=for-the-badge" />

</div>

---

## ¿Qué es The Choice Protocol?

**The Choice Protocol** no es una app de recomendaciones. Es una **experiencia narrativa inmersiva** que te guía a través de una historia para descubrir qué anime o película ver hoy.

Inspirada en la escena de las píldoras de *Matrix*, cada sesión es un viaje único:

```
🖊️ Un sobre misterioso llega para ti
   └── 📜 Una carta te revela tu destino
       └── 💊 Dos píldoras. Una elección.
           └── 🧠 5 preguntas diseñadas para conocerte
               └── 🎯 Tu recomendación personalizada con IA
```

---

## ✨ Características principales

| Feature | Descripción |
|---------|-------------|
| 🎭 **Narrativa interactiva** | Flujo de escenas cinematográficas en lugar de formularios |
| 💊 **Elección binaria** | Anime (píldora roja) o Películas (píldora azul) |
| 🤖 **IA con Gemini Flash** | Recomendaciones personalizadas con justificación |
| 🔄 **Fallback inteligente** | Si la IA no responde → recomendación desde APIs directamente |
| 🌐 **Multiidioma** | Traduce tu recomendación a Español, Inglés o Chino |
| 🎨 **Animaciones GSAP** | Transiciones fluidas, efectos de partículas, lluvia Matrix |
| 📱 **Responsive** | Experiencia adaptada a móvil y escritorio |

---

## 🖥️ Demo del flujo

```
┌─────────────────────────────────────────────────────────────┐
│  1. SOBRE         → Click → se abre con animación GSAP      │
│  2. CARTA         → Efecto máquina de escribir + tu nombre  │
│  3. PÍLDORAS      → Escena Matrix con canvas animado        │
│  4. PREGUNTAS     → 5 tarjetas interactivas (sin formulario)│
│  5. RESULTADO     → Recomendación + imagen + IA + traducción│
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Inicio rápido

### Prerrequisitos

- Node.js `>=18.0.0`
- npm `>=9.0.0`
- API Keys (ver [Setup](#configuración-de-api-keys))

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Davidvx98/The-Choice-Protocol.git
cd The-Choice-Protocol

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# ← Edita .env con tus API keys

# 4. Arrancar en desarrollo
npm run dev
```

Abre [http://localhost:4321](http://localhost:4321) — ¡y empieza la experiencia!

---

## 🔑 Configuración de API Keys

Crea un archivo `.env` en la raíz del proyecto:

```env
GEMINI_API_KEY=tu_clave_de_gemini_aqui
TMDB_API_KEY=tu_clave_de_tmdb_aqui
```

| API | Dónde obtenerla | Gratuita |
|-----|-----------------|----------|
| **Gemini Flash** | [Google AI Studio](https://aistudio.google.com/apikey) | ✅ Sí |
| **TMDB** | [TMDB Settings](https://www.themoviedb.org/settings/api) | ✅ Sí |
| **Jikan** | No requiere key | ✅ Sí |

> ⚠️ **Jikan** (API de MyAnimeList) no requiere autenticación.

---

## 📁 Estructura del proyecto

```
The-Choice-Protocol/
├── src/
│   ├── components/          # Componentes Astro (cada escena)
│   │   ├── Envelope.astro   # 🖊️ Sobre animado
│   │   ├── Letter.astro     # 📜 Carta + input de nombre
│   │   ├── Pills.astro      # 💊 Escena Matrix de elección
│   │   ├── Questions.astro  # 🧠 Preguntas dinámicas
│   │   └── Result.astro     # 🎯 Resultado final
│   ├── layouts/
│   │   └── Layout.astro     # Layout base HTML
│   ├── lib/
│   │   ├── apis.ts          # Clientes Jikan + TMDB
│   │   ├── gemini.ts        # Wrapper Gemini Flash + timeout
│   │   └── recommendation.ts # Lógica de mapeo + prompt builder
│   ├── pages/
│   │   ├── index.astro      # Página principal (orquesta escenas)
│   │   └── api/
│   │       ├── recommend.ts # POST /api/recommend
│   │       ├── anime.ts     # GET  /api/anime
│   │       ├── movie.ts     # GET  /api/movie
│   │       └── translate.ts # POST /api/translate
│   ├── styles/
│   │   └── global.css       # TailwindCSS + estilos cyberpunk
│   └── env.d.ts             # Tipos de variables de entorno
├── public/
│   └── favicon.svg
├── docs/                    # 📚 Documentación detallada
│   ├── SETUP.md
│   ├── API.md
│   ├── COMPONENTS.md
│   └── FLOW.md
├── .env.example
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

---

## 🛠️ Stack tecnológico

### Frontend
- **[Astro 4](https://astro.build)** — Framework de componentes con SSR
- **[TailwindCSS 3](https://tailwindcss.com)** — Estilos utility-first
- **[GSAP 3](https://gsap.com)** — Animaciones de alta performance

### Backend (API Routes en Astro)
- **[@astrojs/node](https://docs.astro.build/en/guides/integrations-guide/node/)** — Adaptador SSR con Node.js
- **[TypeScript 5](https://www.typescriptlang.org)** — Tipado estático

### APIs e IA
- **[Gemini 2.0 Flash](https://ai.google.dev/)** — IA de Google (capa gratuita)
- **[Jikan API](https://jikan.moe/)** — API no oficial de MyAnimeList
- **[TMDB API](https://developer.themoviedb.org/)** — The Movie Database

---

## 📡 API Reference

```http
POST /api/recommend
GET  /api/anime
GET  /api/movie
POST /api/translate
```

> Ver documentación completa en [docs/API.md](./docs/API.md)

---

## 🏗️ Arquitectura

El proyecto usa un patrón de **escenas basadas en eventos** donde:

1. Cada componente Astro es una escena independiente  
2. Las transiciones se gestionan con `CustomEvent('scene:advance')`  
3. El estado del usuario vive en `localStorage`  

```
Componente A → dispara evento → Componente B se activa → GSAP anima transición
```

> Ver arquitectura completa en [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor, lee [CONTRIBUTING.md](./CONTRIBUTING.md) antes de abrir un PR.

```bash
# Fork + clone
git checkout -b feature/mi-nueva-feature
git commit -m "feat: descripción de la feature"
git push origin feature/mi-nueva-feature
# Abre un Pull Request
```

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Ver [LICENSE](./LICENSE) para más información.

---

<div align="center">

Hecho con 💜 para la Hackathon **Las Píldoras**

*"La pregunta no es qué ver. La pregunta es quién eres."*

</div>
