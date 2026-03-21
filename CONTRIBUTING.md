# 🤝 Contributing — The Choice Protocol

¡Gracias por querer contribuir! Este documento explica cómo participar en el proyecto.

---

## Tabla de contenidos

- [Código de conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del entorno de desarrollo](#configuración-del-entorno-de-desarrollo)
- [Convenciones de código](#convenciones-de-código)
- [Convenciones de commits](#convenciones-de-commits)
- [Flujo de Pull Request](#flujo-de-pull-request)
- [Reportar bugs](#reportar-bugs)
- [Sugerir mejoras](#sugerir-mejoras)

---

## Código de conducta

Este proyecto adopta un entorno respetuoso e inclusivo. Se espera:

- Lenguaje y tono constructivos
- Respeto por diferentes niveles de experiencia
- Críticas al código, nunca a las personas
- Aceptar feedback como oportunidad de aprendizaje

---

## ¿Cómo puedo contribuir?

### 🐛 Reportar bugs

Usa las [Issues](https://github.com/Davidvx98/The-Choice-Protocol/issues) con la etiqueta `bug`. Incluye:

- Descripción clara del problema
- Pasos para reproducirlo
- Comportamiento esperado vs real
- Sistema operativo y versión de Node.js

### 💡 Sugerir mejoras

Abre una issue con la etiqueta `enhancement`. Describe:

- El problema que resuelve
- La solución propuesta
- Alternativas consideradas

### 🔧 Contribuir código

Los PRs son bienvenidos para:

- Corrección de bugs
- Nuevas preguntas o géneros
- Mejoras de animaciones
- Optimizaciones de rendimiento
- Mejoras de accesibilidad
- Traducciones de la UI

---

## Configuración del entorno de desarrollo

### 1. Hacer fork y clonar

```bash
# Fork desde GitHub, luego:
git clone https://github.com/TU-USUARIO/The-Choice-Protocol.git
cd The-Choice-Protocol

# Agregar el repositorio original como upstream
git remote add upstream https://github.com/Davidvx98/The-Choice-Protocol.git
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env con tus claves de API
```

### 4. Crear rama para tu cambio

```bash
git checkout -b tipo/descripcion-corta
# Ejemplo: git checkout -b feat/añadir-pregunta-edad
```

### 5. Arrancar en desarrollo

```bash
npm run dev
# http://localhost:4321
```

---

## Convenciones de código

### Guía de estilo

- **TypeScript**: Tipado estricto, sin `any` salvo casos justificados
- **Tailwind**: Usar clases utilitarias; evitar CSS inline
- **Astro**: Lógica en el bloque `<script>`, estilos en `<style>` o clases Tailwind
- **Funciones**: Nombres descriptivos en camelCase
- **Archivos**: PascalCase para componentes, kebab-case para utilidades

### Estructura de un nuevo componente

```astro
---
/** 
 * NombreComponente - Descripción breve
 */
---

<div id="nombre-scene" class="scene scene-hidden">
  <!-- HTML del componente -->
</div>

<script>
  import { gsap } from 'gsap';

  function initNombre() {
    // Lógica del componente
  }

  document.addEventListener('astro:page-load', initNombre);
  initNombre();
</script>
```

### Patrones obligatorios

```ts
// ✅ Verificar existencia de elementos DOM antes de usarlos
const el = document.getElementById('mi-elemento');
if (!el) return;

// ✅ Limpiar event listeners e intervalos en transiciones
const interval = setInterval(fn, 100);
window.addEventListener('scene:advance', () => clearInterval(interval), { once: true });

// ✅ Usar CustomEvents para comunicación entre componentes
window.dispatchEvent(new CustomEvent('scene:advance', {
  detail: { from: 'origen', to: 'destino' }
}));
```

---

## Convenciones de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(alcance): descripción corta en minúsculas

Cuerpo opcional (explica el por qué, no el qué)

Fixes #numero-issue
```

### Tipos de commit

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `style` | Cambios de formato/estilos (sin lógica) |
| `refactor` | Refactorización sin cambio de comportamiento |
| `perf` | Mejoras de rendimiento |
| `test` | Tests (cuando aplique) |
| `chore` | Actualizaciones de dependencias, configuración |

### Ejemplos

```bash
git commit -m "feat(questions): añadir pregunta sobre idioma original"
git commit -m "fix(pills): arreglar canvas que no limpia al hacer retry"
git commit -m "docs(api): documentar parámetros de /api/recommend"
git commit -m "style(envelope): mejorar efecto hover en sello"
git commit -m "perf(matrix-rain): reducir partículas en móvil"
```

---

## Flujo de Pull Request

### Antes de abrir el PR

- [ ] El código compila sin errores (`npm run build`)  
- [ ] La forma de la experiencia no se ha roto
- [ ] Los commits siguen las convenciones
- [ ] La documentación está actualizada si aplica

### Descripción del PR

Usa esta plantilla:

```markdown
## ¿Qué hace este PR?

Descripción clara del cambio.

## Tipo de cambio

- [ ] Bug fix
- [ ] Nueva feature
- [ ] Documentación
- [ ] Refactoring

## ¿Cómo probarlo?

1. Paso uno
2. Paso dos

## Screenshots (si aplica)

## Issues relacionadas

Closes #numero
```

### Proceso de revisión

1. Abre el PR hacia `main`
2. Se revisará en un máximo de 48h
3. Puede haber solicitudes de cambios
4. Una vez aprobado, se hace squash merge

---

## Reportar bugs

Antes de reportar, comprueba:

- ¿Ya hay una issue con este bug?
- ¿Ocurre en la última versión?
- ¿Puedes reproducirlo de forma consistente?

### Plantilla de bug report

```markdown
**Descripción del bug**
Una descripción clara y concisa.

**Pasos para reproducir**
1. Ir a '...'
2. Hacer click en '...'
3. Ver el error

**Comportamiento esperado**
Qué esperabas que pasara.

**Comportamiento real**
Qué pasó en realidad.

**Entorno**
- OS: [ej. Windows 11]
- Browser: [ej. Chrome 120]
- Node.js: [ej. 20.1.0]

**Logs relevantes**
```

---

## Sugerir mejoras

Las mejoras más valoradas son:

1. **Nuevas escenas narrativas** — Elementos de historia entre preguntas
2. **Más géneros/categorías** — Series, videojuegos, libros...
3. **Mejoras de accesibilidad** — ARIA labels, contraste, keyboard nav
4. **Modos de tema** — Claro, alto contraste
5. **Idiomas de la UI** — Inglés, portugués...
6. **Efectos de sonido** — Audio ambiente (con toggle mute)
