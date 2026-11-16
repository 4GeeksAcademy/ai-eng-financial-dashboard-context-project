---
name: accessibility
description: Audita y mejora la accesibilidad web siguiendo las pautas WCAG 2.2. Úsala cuando se solicite mejorar la accesibilidad, realizar una auditoría a11y, cumplir WCAG, dar soporte a lectores de pantalla o a la navegación con teclado, o hacer que una interfaz sea accesible.
license: MIT
metadata:
  author: web-quality-skills
  version: "2.0"
---

# Accesibilidad (a11y)

Guía integral de accesibilidad basada en WCAG 2.2 y auditorías de accesibilidad de Lighthouse. El objetivo es que todas las personas puedan usar el contenido, incluidas las personas con discapacidad.

## Flujo de auditoría basado en evidencias

Cuando haya una página renderizada disponible:

1. Ejecuta una auditoría de accesibilidad en vivo con Lighthouse cuando esté disponible; con Chrome DevTools MCP, usa `lighthouse_audit`. Usa el modo de navegación móvil para páginas públicas generales o el modo de instantánea si recargar la página pudiera perder el estado de autenticación o los datos creados por la persona usuaria.
2. Usa los nodos que fallen en la auditoría para localizar el componente o la plantilla pertinente, en vez de buscar patrones genéricos por todo el repositorio.
3. Inspecciona una instantánea del árbol de accesibilidad renderizado para comprobar nombres, roles, estados, regiones y estructura de encabezados; con Chrome DevTools MCP, usa `take_snapshot`. Prueba con el teclado el flujo afectado.
4. Corrige el código fuente y vuelve a ejecutar la misma auditoría y la prueba manual.

Si las herramientas en vivo no están disponibles, usa Lighthouse CLI o axe para las comprobaciones automatizadas y completa las mismas verificaciones manuales. Las herramientas automatizadas detectan solo una parte de las barreras de accesibilidad: una puntuación de 100 no demuestra conformidad con WCAG, y una puntuación baja no sustituye la evidencia concreta de cada problema.

## Principios WCAG: POUR

| Principio | Descripción |
|-----------|-------------|
| **P**erceptible | El contenido puede percibirse mediante distintos sentidos |
| **O**perable | Todas las personas pueden operar la interfaz |
| **U**niversalmente comprensible | El contenido y la interfaz se entienden con claridad |
| **R**obusto | El contenido funciona con tecnologías de asistencia |

## Niveles de conformidad

| Nivel | Requisito | Objetivo |
|-------|-------------|--------|
| **A** | Accesibilidad mínima | Debe aprobarse |
| **AA** | Conformidad estándar | Debería aprobarse (es un requisito legal en muchas jurisdicciones) |
| **AAA** | Accesibilidad mejorada | Deseable |

---

## Perceptible

### Alternativas textuales (1.1)

**Las imágenes necesitan texto alternativo:**
```html
<!-- ❌ Falta el atributo alt -->
<img src="chart.png">

<!-- ✅ Texto alternativo descriptivo -->
<img src="chart.png" alt="Gráfico de barras que muestra un aumento del 40 % en las ventas del tercer trimestre">

<!-- ✅ Imagen decorativa (alt vacío) -->
<img src="decorative-border.png" alt="" role="presentation">

<!-- ✅ Imagen compleja con una descripción más extensa -->
<figure>
  <img src="infographic.png" alt="Infografía de tendencias del mercado de 2024" 
       aria-describedby="infographic-desc">
  <figcaption id="infographic-desc">
    <!-- Descripción detallada -->
  </figcaption>
</figure>
```

**Los botones con iconos necesitan nombres accesibles:**
```html
<!-- ❌ Sin nombre accesible -->
<button><svg><!-- icono de menú --></svg></button>

<!-- ✅ Uso de aria-label -->
<button aria-label="Abrir menú">
  <svg aria-hidden="true"><!-- icono de menú --></svg>
</button>

<!-- ✅ Uso de texto oculto visualmente -->
<button>
  <svg aria-hidden="true"><!-- icono de menú --></svg>
  <span class="visually-hidden">Abrir menú</span>
</button>
```

**Clase para ocultar contenido visualmente:**
```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Contraste de color (1.4.3, 1.4.6)

| Tamaño del texto | Mínimo AA | Mejorado AAA |
|-----------|------------|--------------|
| Texto normal (< 18px / < 14px en negrita) | 4.5:1 | 7:1 |
| Texto grande (≥ 18px / ≥ 14px en negrita) | 3:1 | 4.5:1 |
| Componentes de interfaz y gráficos | 3:1 | 3:1 |

```css
/* ❌ Contraste bajo (2.5:1) */
.low-contrast {
  color: #999;
  background: #fff;
}

/* ✅ Contraste suficiente (7:1) */
.high-contrast {
  color: #333;
  background: #fff;
}

/* ✅ Los estados de foco también necesitan contraste (3:1 frente al fondo, WCAG 1.4.11) */
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

**No dependas solo del color:**
```html
<!-- ❌ El error se indica únicamente con el color -->
<input class="error-border">
<style>.error-border { border-color: red; }</style>

<!-- ✅ Color, icono y texto -->
<div class="field-error">
  <input aria-invalid="true" aria-describedby="email-error">
  <span id="email-error" class="error-message">
    <svg aria-hidden="true"><!-- error icon --></svg>
    Introduce una dirección de correo electrónico válida
  </span>
</div>
```

### Alternativas para contenido multimedia (1.2)

```html
<!-- Vídeo con subtítulos -->
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="es" label="Español" default>
  <track kind="descriptions" src="descriptions.vtt" srclang="es" label="Descripciones">
</video>

<!-- Audio con transcripción -->
<audio controls>
  <source src="podcast.mp3" type="audio/mp3">
</audio>
<details>
  <summary>Transcripción</summary>
  <p>Texto completo de la transcripción...</p>
</details>
```

---

## Operable

### Accesibilidad mediante teclado (2.1)

**Todas las funciones deben poder utilizarse con el teclado.** Da preferencia a los elementos interactivos nativos: `<button>`, `<a href>` y los controles de formulario ya gestionan la activación con Enter/Espacio, el foco y la semántica para tecnologías de asistencia. Añade gestión manual del teclado solo cuando no puedas usar un elemento nativo.

```html
<!-- ❌ Elemento no interactivo que solo responde al clic: no recibe foco ni se activa con el teclado -->
<div class="card" onclick="handleAction()">Abrir</div>

<!-- ✅ Mejor opción: usar un botón nativo -->
<button type="button" onclick="handleAction()">Abrir</button>
```

```javascript
// ✅ Si DEBES usar un elemento no interactivo (por ejemplo, un div con role="button"),
// haz que pueda recibir el foco Y gestiona la activación con el teclado. NO añadas esto
// a un <button> nativo: Enter/Espacio ya generan el clic y se activaría dos veces.
element.setAttribute('role', 'button');
element.setAttribute('tabindex', '0');
element.addEventListener('click', handleAction);
element.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleAction();
  }
});
```

**Evita las trampas de teclado.** Las personas deben poder entrar y salir de cada componente con Tab. Usa el [patrón de gestión del foco en modales](references/A11Y-PATTERNS.md#modal-focus-trap) para los diálogos; el elemento nativo `<dialog>` lo gestiona automáticamente.

### Foco visible (2.4.7)

```css
/* ❌ No elimines nunca los contornos de foco */
*:focus { outline: none; }

/* ✅ Usa :focus-visible para mostrar el foco del teclado */
:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid currentColor; /* inherits text color → already contrast-checked */
  outline-offset: 2px;
}

/* ✅ También puedes elegir un color de marca y comprobar que tenga un contraste ≥3:1 con cada fondo */
button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 95, 204, 0.5);
}
```

### El foco no queda oculto (2.4.11), nuevo en 2.2

Cuando un elemento recibe el foco del teclado, no debe quedar completamente oculto por contenido creado por el autor, como encabezados fijos, pies de página o paneles superpuestos. En el nivel AAA (2.4.12), ninguna parte del elemento enfocado puede quedar oculta.

```css
/* ✅ Ten en cuenta los encabezados fijos al desplazarte hasta elementos enfocados */
:target {
  scroll-margin-top: 80px;
}

/* ✅ Asegúrate de que los elementos enfocados no queden tapados por barras fijas */
:focus {
  scroll-margin-top: 80px;
  scroll-margin-bottom: 60px;
}
```

### Enlaces para saltar bloques repetidos (2.4.1)

Incluye un enlace para que quienes usan el teclado puedan saltarse la navegación repetitiva. Consulta el [patrón de enlace para saltar bloques](references/A11Y-PATTERNS.md#skip-link) para ver el marcado y los estilos completos.

### Tamaño de los objetivos (2.5.8), nuevo en 2.2

Los objetivos interactivos deben medir al menos **24 × 24 píxeles CSS** (AA). Excepciones: enlaces integrados en el texto, elementos cuyo tamaño controla el navegador y objetivos cuyo círculo de 24 px centrado en el cuadro delimitador no se superpone con otro objetivo.

```css
/* ✅ Tamaño mínimo del objetivo */
button,
[role="button"],
input[type="checkbox"] + label,
input[type="radio"] + label {
  min-width: 24px;
  min-height: 24px;
}

/* ✅ Tamaño cómodo del objetivo (se recomiendan 44×44) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### Acciones de arrastre (2.5.7), nuevo en 2.2

Cualquier acción que requiera arrastrar debe ofrecer una alternativa de un solo puntero (por ejemplo, botones o campos de entrada). Consulta el [patrón de acciones de arrastre](references/A11Y-PATTERNS.md#dragging-movements) para ver un ejemplo de lista ordenable.

### Tiempo (2.2)

```javascript
// Permite que las personas amplíen el límite de tiempo
function showSessionWarning() {
  const modal = createModal({
    title: 'La sesión está a punto de caducar',
    content: 'Tu sesión caducará en 2 minutos.',
    actions: [
      { label: 'Ampliar sesión', action: extendSession },
      { label: 'Cerrar sesión', action: logout }
    ],
    timeout: 120000
  });
}
```

### Movimiento (2.3)

```css
/* Respeta la preferencia de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Comprensible

### Idioma de la página (3.1.1)

```html
<!-- ❌ No se especifica el idioma -->
<html>

<!-- ✅ Se especifica el idioma -->
<html lang="es">

<!-- ✅ Cambio de idioma dentro de la página -->
<p>La palabra francesa para saludar es <span lang="fr">bonjour</span>.</p>
```

### Navegación coherente (3.2.3)

```html
<!-- La navegación debe ser coherente en todas las páginas -->
<nav aria-label="Principal">
  <ul>
    <li><a href="/" aria-current="page">Inicio</a></li>
    <li><a href="/products">Productos</a></li>
    <li><a href="/about">Acerca de</a></li>
  </ul>
</nav>
```

### Ayuda coherente (3.2.6), nuevo en 2.2

Si un mecanismo de ayuda (información de contacto, chat, enlace a preguntas frecuentes u opción de autoayuda) se repite en varias páginas, debe aparecer siempre en el **mismo orden relativo**. Las personas que dependen de una ubicación coherente no deberían tener que buscar la ayuda en cada página.

### Etiquetas de formularios (3.3.2)

Cada campo de entrada necesita una etiqueta asociada mediante código. Consulta el [patrón de etiquetas de formularios](references/A11Y-PATTERNS.md#form-labels) para ver ejemplos de etiquetas explícitas, implícitas e instrucciones.

### Gestión de errores (3.3.1, 3.3.3)

Anuncia los errores a los lectores de pantalla mediante `role="alert"` o `aria-live`, establece `aria-invalid="true"` en los campos no válidos y enfoca el primer error al enviar el formulario. Consulta el [patrón de gestión de errores](references/A11Y-PATTERNS.md#error-handling) para ver el marcado y el código JS completos.

### Introducción redundante de datos (3.3.7), nuevo en 2.2

No obligues a las personas a volver a introducir información que ya proporcionaron en la misma sesión. Completa los campos automáticamente con los datos de pasos anteriores o permite seleccionar valores ya introducidos. Excepciones: la reconfirmación de seguridad y el contenido caducado.

```html
<!-- ✅ Completa automáticamente la dirección de envío con la de facturación -->
<fieldset>
  <legend>Dirección de envío</legend>
  <label>
    <input type="checkbox" id="same-as-billing" checked>
    Igual que la dirección de facturación
  </label>
  <!-- Los campos se completan automáticamente al marcar la casilla -->
</fieldset>
```

### Autenticación accesible (3.3.8), nuevo en 2.2

Los flujos de inicio de sesión no deben depender de pruebas de función cognitiva (por ejemplo, recordar una contraseña o resolver un acertijo), salvo que se cumpla al menos una de estas condiciones:
- Hay disponible un mecanismo para copiar y pegar o autocompletar
- Existe un método alternativo (por ejemplo, una clave de acceso, SSO o un enlace por correo electrónico)
- La prueba utiliza reconocimiento de objetos o contenido personal (solo AA; AAA elimina esta excepción)

```html
<!-- ✅ Permite pegar texto en los campos de contraseña -->
<input type="password" id="password" autocomplete="current-password">

<!-- ✅ Ofrece alternativas sin contraseña -->
<button type="button">Iniciar sesión con clave de acceso</button>
<button type="button">Enviarme un enlace de inicio de sesión</button>
```

---

## Robusto

### Uso de ARIA (4.1.2)

**Da preferencia a los elementos nativos:**
```html
<!-- ❌ Rol ARIA en un div -->
<div role="button" tabindex="0">Púlsame</div>

<!-- ✅ Botón nativo -->
<button>Púlsame</button>

<!-- ❌ Casilla ARIA -->
<div role="checkbox" aria-checked="false">Opción</div>

<!-- ✅ Casilla nativa -->
<label><input type="checkbox"> Opción</label>
```

**Cuando necesites ARIA,** usa los roles y estados correctos. Consulta el [patrón de pestañas ARIA](references/A11Y-PATTERNS.md#aria-tabs) para ver un ejemplo completo de una lista de pestañas.

### Regiones dinámicas (4.1.3)

Usa regiones `aria-live` para anunciar cambios dinámicos de contenido sin mover el foco. Consulta el [patrón de regiones dinámicas](references/A11Y-PATTERNS.md#live-regions-and-notifications) para ver el marcado y una función auxiliar `showNotification()`.

---

## Lista de comprobación

### Pruebas automatizadas

Da preferencia a una auditoría en vivo de Lighthouse que devuelva directamente al agente los nodos renderizados que hayan fallado. Con Chrome DevTools MCP, usa `lighthouse_audit`. Si no está disponible:

```bash
# Auditoría de accesibilidad con Lighthouse
npx lighthouse https://example.com --only-categories=accessibility

# axe-core
npm install @axe-core/cli -g
axe https://example.com
```

### Pruebas manuales

- [ ] **Navegación con teclado:** Recorre toda la página con Tab y usa Enter/Espacio para activar los controles
- [ ] **Lector de pantalla:** Prueba con VoiceOver (Mac), NVDA (Windows) o TalkBack (Android)
- [ ] **Zoom:** El contenido se puede usar con un zoom del 200 %
- [ ] **Alto contraste:** Prueba el modo de alto contraste de Windows
- [ ] **Movimiento reducido:** Prueba con `prefers-reduced-motion: reduce`
- [ ] **Orden del foco:** Es lógico y sigue el orden visual
- [ ] **Tamaño de los objetivos:** Los elementos interactivos cumplen el mínimo de 24×24 px

Consulta la [referencia de comandos de lectores de pantalla](references/A11Y-PATTERNS.md#screen-reader-commands) para ver los atajos de VoiceOver y NVDA.

---

## Problemas frecuentes por impacto

### Críticos (corregir de inmediato)
1. Faltan etiquetas en los formularios
2. Falta texto alternativo en las imágenes
3. El contraste de color es insuficiente
4. Hay trampas de teclado
5. No hay indicadores de foco

### Graves (corregir antes del lanzamiento)
1. No se especifica el idioma de la página
2. Falta una estructura de encabezados
3. El texto de los enlaces no es descriptivo
4. Hay contenido multimedia que se reproduce automáticamente
5. Faltan enlaces para saltar bloques repetidos

### Moderados (corregir pronto)
1. Faltan etiquetas ARIA en los iconos
2. La navegación es incoherente
3. No se identifican los errores
4. Hay límites de tiempo sin controles
5. Faltan regiones de referencia

## Referencias

- [Referencia rápida de WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/)
- [Prácticas de autoría de WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/)
- [Reglas de axe de Deque](https://dequeuniversity.com/rules/axe/)
- [Web Quality Audit](../web-quality-audit/SKILL.md)
- [Referencia de criterios WCAG](references/WCAG.md)
- [Patrones de código de accesibilidad](references/A11Y-PATTERNS.md)
