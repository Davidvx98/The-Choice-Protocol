# 🌊 User Flow — The Choice Protocol

Documentación del flujo completo de la experiencia de usuario.

---

## Diagrama de flujo completo

```
┌────────────────────────────────────────────────────────────┐
│                     INICIO                                 │
│                       │                                    │
│                       ▼                                    │
│            ┌─────────────────┐                             │
│            │    ENVELOPE     │  ← Partículas + float GSAP  │
│            │  Sobre cerrado  │                             │
│            └────────┬────────┘                             │
│                     │ Click                                │
│                     ▼                                      │
│         ┌───────────────────────┐                          │
│         │ Animación sobre       │                          │
│         │ Sello rompe           │                          │
│         │ Tapa gira (rotateX)   │                          │
│         │ Glow burst + fade out │                          │
│         └──────────┬────────────┘                          │
│                    │                                       │
│                    ▼                                       │
│           ┌─────────────────┐                              │
│           │     LETTER      │  ← Glass card + typing       │
│           │  Carta + nombre │                              │
│           └────────┬────────┘                              │
│                    │ Submit nombre                         │
│                    │ (guardado en localStorage)            │
│                    ▼                                       │
│           ┌─────────────────┐                              │
│           │     PILLS       │  ← Matrix rain canvas        │
│           │  Roja / Azul    │                              │
│           └────────┬────────┘                              │
│                    │                                       │
│          ┌─────────┴──────────┐                            │
│          │                    │                            │
│          ▼                    ▼                            │
│    🔴 ANIME            🔵 PELÍCULAS                        │
│     (5 preguntas)       (5 preguntas)                      │
│          │                    │                            │
│          └─────────┬──────────┘                            │
│                    ▼                                       │
│          ┌──────────────────┐                              │
│          │    QUESTIONS     │  ← 5 tarjetas interactivas   │
│          │  mood/duration/  │                              │
│          │  story/intensity │                              │
│          │  +vibe o era     │                              │
│          └────────┬─────────┘                              │
│                   │ Respuestas guardadas                   │
│                   ▼                                        │
│          ┌──────────────────┐                              │
│          │     RESULT       │                              │
│          │  Loading → fetch │                              │
│          │  /api/recommend  │                              │
│          └────────┬─────────┘                              │
│                   │                                        │
│         ┌─────────┴──────────┐                             │
│         │                    │                             │
│         ▼                    ▼                             │
│   Gemini OK             Gemini fails                       │
│   (JSON parsed)         (timeout/error)                    │
│         │                    │                             │
│         │                    ▼                             │
│         │          Fallback desde API results              │
│         └─────────┬──────────┘                             │
│                   ▼                                        │
│         ┌──────────────────────┐                           │
│         │   RESULTADO FINAL    │                           │
│         │  Título + imagen     │                           │
│         │  Descripción         │                           │
│         │  Justificación IA    │                           │
│         │  Extras (2 más)      │                           │
│         │  Traducción          │                           │
│         └──────────┬───────────┘                           │
│                    │                                       │
│           ┌────────┴────────┐                              │
│           │                 │                              │
│           ▼                 ▼                              │
│     "Intentar          "Traducir"                          │
│      de nuevo"          (es/en/zh)                         │
│           │                                                │
│           └──────────→ Vuelve a PILLS                      │
└────────────────────────────────────────────────────────────┘
```

---

## Descripción detallada por escena

### Escena 1: Envelope

**Duración estimada:** 3-5 segundos

```
Estado inicial:
- Sobre aparece centrado en pantalla
- Animación float (-8px y-yo)
- 20 partículas moradas suben en background
- Hint "Haz click para abrir" parpadeante

Al hacer click:
1. (0.0s) Sello escala y desaparece
2. (0.3s) Tapa del sobre rota 180° hacia atrás
3. (0.6s) Glow burst en el cuerpo del sobre
4. (0.9s) Fade out + scale(1.1) de toda la escena
5. (1.7s) → Avanza a Letter
```

### Escena 2: Letter

**Duración estimada:** 10-15 segundos

```
Al entrar:
1. Glass card sube con fade (y: 40 → 0)
2. Espera 800ms
3. Comienza typeText() a 35ms por caracter
4. El cursor █ parpadea mientras escribe
5. (~8s) Texto completo, cursor desaparece
6. Input de nombre aparece con fade

Usuario introduce nombre:
- El botón "→" se activa al escribir
- Enter o click en botón valida
- Nombre se guarda en localStorage
→ Avanza a Pills
```

**Texto de la carta:**
```
Bienvenido, extraño...

Has sido elegido para recibir una recomendación especial. 
Pero antes, necesito saber quién eres.

El destino de tu próxima aventura depende de las 
decisiones que tomes a continuación...
```

### Escena 3: Pills

**Duración estimada:** 5-15 segundos (decisión del usuario)

```
Al entrar:
1. Canvas Matrix rain aparece con fade (1.5s)
2. Saludo personalizado: "Bien, [nombre]..."
3. Las dos manos + píldoras entran desde lados opuestos
   - Roja: desde la izquierda (x: -100)
   - Azul: desde la derecha (x: 100)

Hover en píldoras:
- Escala: 1.1 en la cápsula
- Glow shadow amplificado
- CSS brightness loop

Al elegir:
1. La otra píldora desaparece (opacity: 0.3)
2. La elegida escala (1.2)
3. 3 flashes de color en document.body
4. Fade out de la escena
5. Canvas se oscurece
→ Avanza a Questions
```

### Escena 4: Questions

**Duración estimada:** 1-3 minutos (5 preguntas)

```
Estructura de cada pregunta:
- Barra de progreso animada
- Título + subtítulo
- Grid de opciones (2 columnas en desktop)
- Cada opción tiene icono emoji + texto

Al responder:
1. Opciones no elegidas: opacity 0.3 + scale 0.95
2. Opción elegida: scale 1.05 + borde púrpura
3. (500ms) Transición slide: 
   - Card actual: x: -30, opacity: 0
   - Nueva card: x: 30 → 0, opacity: 0 → 1

Última pregunta:
- Barra llega al 100%
- Respuestas guardadas en localStorage
→ Avanza a Result
```

### Escena 5: Result

**Duración estimada:** 3-8 segundos (carga) + tiempo del usuario

```
Fase de loading:
- Spinner circular con icono 🔮
- Mensajes rotativos cada 2s (fade in/out)
- Llamada a /api/recommend en background

Al recibir respuesta:
1. Loading oculto
2. Resultado aparece con fade (y: 30 → 0)
3. Imagen del póster carga lazy
4. Géneros como pills
5. Justificación IA en card separada

Panel de traducción:
- Toggle con botón "🌐 Traducir"
- 3 botones de idioma
- Llamada a /api/translate al seleccionar
- Resultado aparece en el panel

Retry:
- Fade out de la escena
→ Vuelve a Pills (sin perder el nombre)
```

---

## Gestión del estado

### localStorage keys

```
userName    → String   (ej: "Marcos")
pillChoice  → String   ("anime" | "movie")
userAnswers → JSON     ({ mood, duration, story, intensity, vibe/era })
```

### Flujo de datos

```
Envelope: no usa estado
    ↓
Letter: escribe userName
    ↓
Pills: lee userName (saludo), escribe pillChoice
    ↓
Questions: lee pillChoice (qué preguntas mostrar), escribe userAnswers
    ↓
Result: lee userName + pillChoice + userAnswers → POST /api/recommend
```

---

## Manejo de errores

| Situación | Comportamiento |
|-----------|---------------|
| API externa lenta (>15s) | Gemini timeout → fallback automático |
| Jikan devuelve error | `apiResults = []` → Gemini intenta sin candidatos |
| TMDB_API_KEY no configurada | Error 500 en `/api/movie` → mensaje de error en Result |
| Gemini devuelve JSON inválido | `JSON.parse` falla → fallback usando `apiResults[0]` |
| Sin resultados de API | Mensaje: "No encontramos resultados. Intenta con diferentes opciones." |
| Error de traducción | Mensaje: "Error al traducir" en rojo |

---

## Criterios de experiencia (UX)

Los principios que guían cada decisión de diseño:

1. **Nunca un formulario vacío** — cada interacción tiene contexto narrativo
2. **Feedback visual inmediato** — cada click tiene respuesta visual en <100ms
3. **Progresión visible** — barra de progreso en preguntas, mensajes de loading
4. **Personalización** — el nombre del usuario aparece en saludo y justificación
5. **Recuperación fácil** — siempre hay un botón para "intentar de nuevo"
6. **Sin bloqueos** — si la IA falla, la app sigue funcionando con fallback
