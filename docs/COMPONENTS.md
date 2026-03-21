# 🎭 Components Guide — The Choice Protocol

Guía de todos los componentes Astro del proyecto.

---

## Tabla de contenidos

- [Arquitectura de componentes](#arquitectura-de-componentes)
- [Envelope.astro](#envelopeastro)
- [Letter.astro](#letterastro)
- [Pills.astro](#pillsastro)
- [Questions.astro](#questionsastro)
- [Result.astro](#resultastro)
- [Sistema de escenas](#sistema-de-escenas)
- [Estado compartido (localStorage)](#estado-compartido-localstorage)

---

## Arquitectura de componentes

Todos los componentes se renderizan simultáneamente en `index.astro`, pero solo **uno es visible a la vez** mediante CSS (`opacity` + `pointer-events`). Las transiciones entre ellos se gestionan con un sistema de eventos personalizado.

```
index.astro
└── Layout.astro
    ├── Envelope.astro   (visible inicialmente)
    ├── Letter.astro     (oculto)
    ├── Pills.astro      (oculto)
    ├── Questions.astro  (oculto)
    └── Result.astro     (oculto)
```

### Clases CSS de escena

```css
.scene-visible  → opacity: 1,  pointer-events: auto
.scene-hidden   → opacity: 0,  pointer-events: none
```

---

## Envelope.astro

**Propósito:** Primera pantalla. Muestra un sobre animado que al hacer click inicia la experiencia.

### Estructura visual

```
┌──────────────────────────────────────┐
│   "Haz click para abrir"             │
│                                      │
│      ┌────────────────────┐          │
│      │   /\  /\  /\  /\  │  ← Flap  │
│      │  /  \/  \/  \/  \ │          │
│      │ ┌──────────────┐  │          │
│      │ │     💊       │  │  ← Sello │
│      │ └──────────────┘  │          │
│      │  ━━━━━━━━━━━━━━   │          │
│      └────────────────────┘          │
│            (sombra blur)             │
└──────────────────────────────────────┘
+ partículas flotantes (20 puntos GSAP)
```

### Animaciones GSAP

| Animación | Descripción | Trigger |
|-----------|-------------|---------|
| Float loop | `translateY(-8px)` yoyo infinito | `onMount` |
| Partículas | 20 puntos aleatorios subiendo | `onMount` |
| Sello | `scale(1.5) → opacity(0)` | Click |
| Flap | `rotateX(-180deg)` | Click |
| Glow burst | `boxShadow` extra | Click |
| Scene fade | `opacity(0) scale(1.1)` | Tras animación |

### Evento disparado

```js
window.dispatchEvent(new CustomEvent('scene:advance', {
  detail: { from: 'envelope', to: 'letter' }
}));
```

### Accesibilidad

- `role="button"` en el sobre
- `tabindex="0"` para navegación por teclado
- Soporte `Enter` y `Space` para activar

---

## Letter.astro

**Propósito:** Carta con efecto máquina de escribir. Presenta la narrativa y solicita el nombre del usuario.

### Estructura visual

```
┌─ glass card ──────────────────────────┐
│ ┌─ corner decoration               ─┐ │
│                                       │
│  Bienvenido, extraño...               │
│  Has sido elegido para recibir...█    │ ← cursor parpadeante
│                                       │
│  ┌──────────────────────────────────┐ │
│  │ ¿Cómo te llamas, viajero?        │ │
│  │ [_____________nombre_________] → │ │
│  └──────────────────────────────────┘ │
└───────────────────────────────────────┘
```

### Secuencia de animación

1. `gsap.from('.glass', { y: 40, opacity: 0 })` — Carta aparece
2. `typeText()` — Texto aparece caracter a caracter (35ms/char)
3. `gsap.to(nameSection, { opacity: 1 })` — Input aparece tras el texto

### Función de typing

```ts
function typeText(text: string, element: HTMLElement, speed = 35): Promise<void>
```

- Procesa `\n` como `<br>` en el HTML
- Muestra cursor `█` parpadeante mientras escribe (CSS `typing-cursor`)
- Resuelve una `Promise` al terminar (permite encadenar con `await`)

### LocalStorage

```js
localStorage.setItem('userName', name);
```

### Eventos

- **Escucha:** `scene:advance` con `to: 'letter'`
- **Dispara:** `scene:advance` con `from: 'letter', to: 'pills'`

---

## Pills.astro

**Propósito:** Escena de elección inspirada en Matrix. El usuario elige entre Anime (píldora roja) y Películas (píldora azul).

### Estructura visual

```
        "Bien, [nombre]..."
        "Es hora de elegir tu camino"

🤚                        🤚
┌──────────┐          ┌──────────┐
│          │          │          │
│  ██████  │          │  ██████  │
│  rojo    │    ó     │  azul    │
└──────────┘          └──────────┘
   ANIME                PELÍCULAS
 Píldora Roja         Píldora Azul

[canvas Matrix rain de fondo]
```

### Efectos visuales

| Efecto | Implementación |
|--------|---------------|
| Matrix rain | `<canvas>` con katakana + números cayendo |
| Hover glow | `box-shadow` amplificado en `:hover` vía GSAP |
| Hover scale | `transform: scale(1.1)` en pill + mano |
| CSS pulse | `@keyframes pill-glow` en `filter: brightness` |

### Canvas Matrix Rain

```ts
function startMatrixRain(): () => void
// Retorna una función de cleanup para parar el intervalo
```

- Caracteres: katakana + dígitos
- Color: `#b026ff22` (púrpura semitransparente)
- Frame rate: 50ms (≈20fps)
- Se limpia automáticamente al salir de la escena

### Flash de elección

Al elegir una píldora:
1. La otra se desvanece (`opacity: 0.3, scale: 0.95`)
2. La elegida escala (`scale: 1.2`)
3. Flash de color en `document.body` (3 pulsos)
4. Fade out de la escena

### LocalStorage

```js
localStorage.setItem('pillChoice', 'anime' | 'movie');
```

---

## Questions.astro

**Propósito:** 5 preguntas dinámicas sobre las preferencias del usuario. Las preguntas varían según la elección (anime vs películas).

### Estructura visual

```
Pregunta 1 de 5                          0%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ (barra)

┌─────────────────────────────────────────┐
│ ¿Cómo te sientes ahora mismo?           │
│ Tu estado de ánimo guiará la...         │
│                                         │
│  [ ☀️ Quiero algo alegre ]              │
│  [ 🌧️ Estoy melancólico  ]              │
│  [ ⚡ Busco adrenalina   ]              │
│  [ 🌙 Necesito pensar    ]              │
└─────────────────────────────────────────┘
```

### Preguntas (Anime)

| # | ID | Pregunta | Opciones |
|---|----|----------|----------|
| 1 | `mood` | ¿Cómo te sientes? | happy, melancholic, excited, thoughtful |
| 2 | `duration` | ¿Cuánto tiempo tienes? | short, medium, long, any |
| 3 | `story` | ¿Qué tipo de historia? | action, romance, mystery, comedy, scifi, fantasy |
| 4 | `intensity` | ¿Qué tan intenso? | light, balanced, deep, dark |
| 5 | `vibe` | ¿Con qué vibra? | epic, characters, twists, visual |

### Preguntas (Películas)

| # | ID | Pregunta | Opciones |
|---|----|----------|----------|
| 1 | `mood` | ¿Cómo te sientes? | happy, melancholic, excited, thoughtful |
| 2 | `duration` | ¿Cuánto tiempo tienes? | short, medium, long, any |
| 3 | `story` | ¿Qué género? | action, romance, horror, comedy, scifi, documentary |
| 4 | `intensity` | ¿Qué tan intensa? | light, balanced, deep, dark |
| 5 | `era` | ¿De qué época? | classic, modern, recent, any |

### Transición entre preguntas

```
Usuario elige → feedback visual (0.5s) → slide-left salida → slide-right entrada
```

### LocalStorage

```js
localStorage.setItem('userAnswers', JSON.stringify({
  mood: 'excited',
  duration: 'medium',
  story: 'action',
  intensity: 'deep',
  vibe: 'epic'
}));
```

---

## Result.astro

**Propósito:** Muestra la recomendación final con imagen, descripción, justificación IA y opciones extras.

### Estados del componente

```
1. LOADING → Spinner + mensajes rotativos de "consultando..."
2. RESULT  → Título, imagen, descripción, géneros, justificación IA, extras
3. ERROR   → Mensaje de error con opción de reintentar
```

### Estructura visual (estado RESULT)

```
         Tu recomendación
    🎯  Attack on Titan
        ⭐ 9.1  📅 2013  📺 25 eps

┌────────────────────────────────────────┐
│ [imagen] │ Sinopsis breve en texto      │
│  poster  │                              │
│          │ [Action] [Drama] [Fantasy]   │
│                                        │
│  🤖 ¿Por qué esta recomendación?       │
│  "Marcos, dado que buscas adrenalina..." │
│                                        │
│  También podrían gustarte:             │
│  [Demon Slayer]  [FMA Brotherhood]     │
└────────────────────────────────────────┘

   [🔄 Intentar de nuevo]  [🌐 Traducir]

   ┌── Panel traducción ──┐
   │ [🇪🇸 Español] [🇬🇧 English] [🇨🇳 中文] │
   │ Texto traducido aquí...              │
   └──────────────────────────────────────┘
```

### Mensajes rotativos de loading

```ts
const loadingMessages = [
  'Consultando el oráculo...',
  'Analizando tus respuestas...',
  'Buscando en dimensiones paralelas...',
  'Encontrando la opción perfecta...',
  'Casi listo...',
];
// Cambia cada 2 segundos con fade in/out GSAP
```

### Flujo de fetch

```ts
fetch('/api/recommend', {
  method: 'POST',
  body: JSON.stringify({ type, answers, userName })
})
```

### Acciones disponibles

| Acción | Descripción |
|--------|-------------|
| **Intentar de nuevo** | Vuelve a la escena de Pills sin resetear nombre |
| **Traducir** | Toggle del panel de traducción |
| **Cambiar idioma** | Llama a `/api/translate` con el texto actual |

---

## Sistema de escenas

El sistema de eventos que conecta todos los componentes:

```ts
// Disparar transición
window.dispatchEvent(new CustomEvent('scene:advance', {
  detail: { from: 'pills', to: 'questions' }
}));

// Escuchar transición
window.addEventListener('scene:advance', (e: Event) => {
  const { from, to } = (e as CustomEvent).detail;
  if (to === 'questions') {
    // activar esta escena
  }
});
```

### Mapa de transiciones

```
envelope ──── scene:advance ──→ letter
letter   ──── scene:advance ──→ pills
pills    ──── scene:advance ──→ questions
questions ─── scene:advance ──→ result
result   ──── scene:advance ──→ pills  (retry)
```

---

## Estado compartido (localStorage)

| Clave | Cuándo se escribe | Quién lo lee |
|-------|-------------------|--------------|
| `userName` | Letter (tras submit) | Pills (saludo), Result (fetch) |
| `pillChoice` | Pills (tras click) | Questions (qué preguntas mostrar), Result (fetch) |
| `userAnswers` | Questions (al terminar) | Result (fetch) |
