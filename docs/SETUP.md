# 🔧 Setup Guide — The Choice Protocol

Guía completa para configurar el proyecto en tu entorno local.

---

## Tabla de contenidos

- [Prerrequisitos](#prerrequisitos)
- [Instalación paso a paso](#instalación-paso-a-paso)
- [Variables de entorno](#variables-de-entorno)
- [Obtener API Keys](#obtener-api-keys)
- [Scripts disponibles](#scripts-disponibles)
- [Configuración de producción](#configuración-de-producción)
- [Resolución de problemas](#resolución-de-problemas)

---

## Prerrequisitos

| Herramienta | Versión mínima | Verificar |
|-------------|---------------|-----------|
| Node.js     | 18.0.0        | `node --version` |
| npm         | 9.0.0         | `npm --version` |
| Git         | Cualquiera    | `git --version` |

---

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/Davidvx98/The-Choice-Protocol.git
cd The-Choice-Protocol
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instala:
- `astro` — Framework principal
- `@astrojs/node` — Adaptador SSR
- `@astrojs/tailwind` — Integración Tailwind
- `@google/generative-ai` — SDK de Gemini
- `gsap` — Librería de animaciones

### 3. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tus claves reales
```

### 4. Arrancar en desarrollo

```bash
npm run dev
```

El servidor arrancará en `http://localhost:4321`.

---

## Variables de entorno

Archivo `.env` en la raíz del proyecto:

```env
# Obligatoria para recomendaciones IA y traducción
GEMINI_API_KEY=tu_clave_aqui

# Obligatoria para recomendaciones de películas
TMDB_API_KEY=tu_clave_aqui
```

> **Nota:** La API de Jikan (anime) no requiere autenticación.

### Comportamiento sin API Keys

| Variable ausente | Comportamiento |
|-----------------|----------------|
| `GEMINI_API_KEY` | Usa fallback: recomienda directamente desde la API (sin justificación IA) |
| `TMDB_API_KEY` | El endpoint `/api/movie` devuelve error 500; la app muestra mensaje de error |

---

## Obtener API Keys

### Gemini Flash (Google AI)

1. Ve a [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz click en **"Create API key"**
4. Copia la clave y pégala en `.env` como `GEMINI_API_KEY`

**Límites de la capa gratuita (Gemini 2.0 Flash):**
- 15 RPM (requests per minute)
- 1,000,000 tokens por día
- Sin coste monetario

### TMDB API

1. Ve a [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup) y créate una cuenta
2. Ve a **Configuración → API**
3. Solicita una API key (proceso es inmediato)
4. Copia la **API Key (v3 auth)** y pégala como `TMDB_API_KEY`

---

## Scripts disponibles

```bash
# Servidor de desarrollo con hot-reload
npm run dev

# Compilar para producción
npm run build

# Previsualizar el build de producción
npm run preview
```

### Variables de entorno por entorno

```bash
# Desarrollo (usa .env)
npm run dev

# Producción (las variables deben estar en el servidor)
GEMINI_API_KEY=xxx TMDB_API_KEY=yyy npm run build
```

---

## Configuración de producción

El proyecto usa `@astrojs/node` en modo `standalone`. Esto genera un servidor Node.js autocontenido:

```bash
npm run build
# Genera dist/ con el servidor completo

node dist/server/entry.mjs
# Arranca el servidor en el puerto 4321 por defecto
```

### Variables de puerto

```bash
# Cambiar puerto
PORT=3000 node dist/server/entry.mjs

# Cambiar host
HOST=0.0.0.0 node dist/server/entry.mjs
```

### Deploy en servicios cloud

| Servicio | Compatibilidad | Notas |
|----------|---------------|-------|
| **Railway** | ✅ Directo | Auto-detecta Node.js |
| **Render** | ✅ Directo | Usar `node dist/server/entry.mjs` como start command |
| **Fly.io** | ✅ Con Dockerfile | Ver abajo |
| **Vercel** | ⚠️ Cambiar adaptador | Usar `@astrojs/vercel` |
| **Netlify** | ⚠️ Cambiar adaptador | Usar `@astrojs/netlify` |

#### Dockerfile básico

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 4321
ENV HOST=0.0.0.0
CMD ["node", "dist/server/entry.mjs"]
```

---

## Resolución de problemas

### `Error: GEMINI_API_KEY not set`

Comprueba que el archivo `.env` existe y contiene la clave correcta:
```bash
cat .env
```

### `TMDB API error: 401`

La API key de TMDB es incorrecta o vacía. Verifica en tu panel de TMDB.

### Puerto 4321 en uso

```bash
# Cambiar el puerto de dev
npm run dev -- --port 3000
```

### Errores de TypeScript en `import.meta.env`

Asegúrate de que `src/env.d.ts` existe y el `tsconfig.json` extiende `astro/tsconfigs/strict`.

### GSAP no anima

Verifica que GSAP está correctamente instalado:
```bash
npm list gsap
```
Si no aparece, reinstala:
```bash
npm install gsap
```
