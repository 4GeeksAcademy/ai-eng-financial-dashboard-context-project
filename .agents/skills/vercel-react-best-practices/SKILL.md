---
name: vercel-react-best-practices
description: Pautas de optimización del rendimiento de React y Next.js del equipo de ingeniería de Vercel. Usa esta skill al escribir, revisar o refactorizar código React/Next.js para aplicar patrones de rendimiento óptimos. Se activa en tareas relacionadas con componentes React, páginas Next.js, obtención de datos, optimización del bundle o mejoras de rendimiento.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# Buenas prácticas de React de Vercel

Guía integral de optimización del rendimiento para aplicaciones React y Next.js, mantenida por Vercel. Contiene 70 reglas en 8 categorías, priorizadas por impacto para orientar la refactorización automatizada y la generación de código.

## Cuándo aplicarla

Consulta estas pautas cuando:
- Escribas componentes React o páginas Next.js
- Implementes la obtención de datos (en cliente o servidor)
- Revises código en busca de problemas de rendimiento
- Refactorices código React/Next.js existente
- Optimices el tamaño del bundle o los tiempos de carga

## Categorías de reglas por prioridad

| Prioridad | Categoría | Impacto | Prefijo |
|----------|----------|--------|--------|
| 1 | Eliminar cascadas de espera | CRÍTICO | `async-` |
| 2 | Optimizar el tamaño del bundle | CRÍTICO | `bundle-` |
| 3 | Rendimiento en el servidor | ALTO | `server-` |
| 4 | Obtención de datos en el cliente | MEDIO-ALTO | `client-` |
| 5 | Optimizar los renderizados repetidos | MEDIO | `rerender-` |
| 6 | Rendimiento del renderizado | MEDIO | `rendering-` |
| 7 | Rendimiento de JavaScript | BAJO-MEDIO | `js-` |
| 8 | Patrones avanzados | BAJO | `advanced-` |

## Referencia rápida

### 1. Eliminar cascadas de espera (CRÍTICO)

- `async-cheap-condition-before-await` - Comprueba las condiciones síncronas de bajo coste antes de esperar flags o valores remotos
- `async-defer-await` - Mueve `await` a las ramas donde realmente se necesita
- `async-parallel` - Usa Promise.all() para operaciones independientes
- `async-dependencies` - Usa better-all cuando haya dependencias parciales
- `async-api-routes` - Inicia las promesas pronto y espéralas más tarde en las rutas de API
- `async-suspense-boundaries` - Usa Suspense para transmitir contenido progresivamente

### 2. Optimizar el tamaño del bundle (CRÍTICO)

- `bundle-barrel-imports` - Importa directamente y evita los archivos barrel
- `bundle-analyzable-paths` - Prefiere rutas de importación y del sistema de archivos analizables estáticamente para evitar bundles y trazas demasiado amplios
- `bundle-dynamic-imports` - Usa next/dynamic para componentes pesados
- `bundle-defer-third-party` - Carga analítica y registro después de la hidratación
- `bundle-conditional` - Carga los módulos solo cuando se active la funcionalidad
- `bundle-preload` - Precarga al pasar el cursor o al recibir el foco para mejorar la velocidad percibida

### 3. Rendimiento en el servidor (ALTO)

- `server-auth-actions` - Autentica las acciones de servidor como las rutas de API
- `server-cache-react` - Usa React.cache() para deduplicar solicitudes
- `server-cache-lru` - Usa una caché LRU para almacenar datos entre solicitudes
- `server-dedup-props` - Evita la serialización duplicada en las props de RSC
- `server-hoist-static-io` - Eleva la E/S estática (fuentes, logotipos) al ámbito del módulo
- `server-no-shared-module-state` - Evita el estado de solicitud mutable compartido a nivel de módulo en RSC/SSR
- `server-serialization` - Minimiza los datos que se envían a componentes de cliente
- `server-parallel-fetching` - Reestructura los componentes para obtener datos en paralelo
- `server-parallel-nested-fetching` - Encadena las obtenciones anidadas por elemento con Promise.all
- `server-after-nonblocking` - Usa after() para operaciones no bloqueantes

### 4. Obtención de datos en el cliente (MEDIO-ALTO)

- `client-swr-dedup` - Usa SWR para deduplicar solicitudes automáticamente
- `client-event-listeners` - Deduplica los controladores globales de eventos
- `client-passive-event-listeners` - Usa controladores pasivos para el desplazamiento
- `client-localstorage-schema` - Versiona y minimiza los datos de localStorage

### 5. Optimizar los renderizados repetidos (MEDIO)

- `rerender-defer-reads` - No te suscribas a un estado que solo se usa en callbacks
- `rerender-memo` - Extrae el trabajo costoso a componentes memorizados
- `rerender-memo-with-default-value` - Eleva las props predeterminadas que no sean primitivas
- `rerender-dependencies` - Usa dependencias primitivas en los efectos
- `rerender-derived-state` - Suscríbete a valores booleanos derivados, no a valores sin procesar
- `rerender-derived-state-no-effect` - Deriva el estado durante el renderizado, no en efectos
- `rerender-functional-setstate` - Usa setState funcional para mantener callbacks estables
- `rerender-lazy-state-init` - Pasa una función a useState para valores costosos
- `rerender-simple-expression-in-memo` - Evita memo para expresiones primitivas sencillas
- `rerender-split-combined-hooks` - Separa los hooks con dependencias independientes
- `rerender-move-effect-to-event` - Coloca la lógica de interacción en los controladores de eventos
- `rerender-transitions` - Usa startTransition para actualizaciones no urgentes
- `rerender-use-deferred-value` - Aplaza los renderizados costosos para mantener la respuesta de los campos de entrada
- `rerender-use-ref-transient-values` - Usa refs para valores transitorios que cambian con frecuencia
- `rerender-no-inline-components` - No declares componentes dentro de otros componentes

### 6. Rendimiento del renderizado (MEDIO)

- `rendering-animate-svg-wrapper` - Anima el contenedor div, no el elemento SVG
- `rendering-content-visibility` - Usa content-visibility en listas largas
- `rendering-hoist-jsx` - Extrae el JSX estático fuera de los componentes
- `rendering-svg-precision` - Reduce la precisión de las coordenadas SVG
- `rendering-hydration-no-flicker` - Usa un script en línea para datos exclusivos del cliente
- `rendering-hydration-suppress-warning` - Suprime las discrepancias esperadas
- `rendering-activity` - Usa el componente Activity para mostrar u ocultar contenido
- `rendering-conditional-render` - Usa una expresión ternaria, no &&, para las condiciones
- `rendering-usetransition-loading` - Prefiere useTransition para el estado de carga
- `rendering-resource-hints` - Usa las sugerencias de recursos de React DOM para precargar
- `rendering-script-defer-async` - Usa defer o async en las etiquetas script

### 7. Rendimiento de JavaScript (BAJO-MEDIO)

- `js-batch-dom-css` - Agrupa los cambios CSS mediante clases o cssText
- `js-index-maps` - Crea un Map para búsquedas repetidas
- `js-cache-property-access` - Almacena en caché las propiedades de objetos dentro de bucles
- `js-cache-function-results` - Almacena resultados de funciones en un Map a nivel de módulo
- `js-cache-storage` - Almacena en caché las lecturas de localStorage/sessionStorage
- `js-combine-iterations` - Combina varios filter/map en un solo bucle
- `js-length-check-first` - Comprueba primero la longitud del array antes de hacer comparaciones costosas
- `js-early-exit` - Devuelve el resultado cuanto antes desde las funciones
- `js-hoist-regexp` - Eleva la creación de RegExp fuera de los bucles
- `js-min-max-loop` - Usa un bucle para obtener mínimos/máximos en vez de ordenar
- `js-set-map-lookups` - Usa Set/Map para búsquedas O(1)
- `js-tosorted-immutable` - Usa toSorted() para mantener la inmutabilidad
- `js-flatmap-filter` - Usa flatMap para transformar y filtrar en una sola pasada
- `js-request-idle-callback` - Aplaza el trabajo no crítico hasta que el navegador esté inactivo

### 8. Patrones avanzados (BAJO)

- `advanced-effect-event-deps` - No incluyas los resultados de `useEffectEvent` entre las dependencias de efectos
- `advanced-event-handler-refs` - Guarda los controladores de eventos en refs
- `advanced-init-once` - Inicializa la aplicación una sola vez por carga
- `advanced-use-latest` - Usa useLatest para mantener refs estables a callbacks

## Cómo usarla

Lee los archivos de cada regla para ver explicaciones detalladas y ejemplos de código:

```
rules/async-parallel.md
rules/bundle-barrel-imports.md
```

Cada archivo de regla contiene:
- Una breve explicación de su importancia
- Un ejemplo de código incorrecto con su explicación
- Un ejemplo de código correcto con su explicación
- Contexto adicional y referencias

## Documento completo compilado

For the complete guide with all rules expanded: `AGENTS.md`
