# Progress

> Última actualización: 2026-09-18

## Resumen

Se realizó una revisión transversal del dashboard financiero y se documentaron sus convenciones de trabajo. El proyecto cuenta ahora con skills generales aplicables al frontend y con una skill interna específica para preservar la arquitectura, el contrato de datos y el flujo de QA del repositorio.

## Skills aplicadas

### `accessibility`

Skill utilizada para revisar y mejorar la accesibilidad del dashboard.

Cambios verificados durante la revisión:

- Skip link para navegación por teclado.
- Atributos ARIA y roles semánticos en elementos interactivos y estados de error.
- Mensajes de error y estados de carga anunciables.
- Contraste revisado para los temas claro y oscuro.
- Tablas accesibles asociadas a la información representada por los gráficos.
- Estados de carga con una presentación más comprensible para tecnologías de asistencia.

### `vercel-react-best-practices`

Skill utilizada para revisar la estructura React, el rendimiento y la gestión de estados.

Cambios verificados durante la revisión:

- Extracción de la carga y transformación de datos a `frontend/src/lib/use-financial-data.ts`.
- Adición del patrón `Result<T, E>` en `frontend/src/lib/result.ts`.
- Error boundaries para aislar errores de KPIs, gráficos y API.
- Carga diferida de los gráficos mediante `lazy()` y `Suspense`.
- Memoización de cálculos derivados con `useMemo()`.
- Preservación de espacio reservado para gráficos y skeletons para reducir layout shift.

### `seo`

Skill instalada desde `addyosmani/web-quality-skills@seo` y ubicada en:

```text
.agents/skills/seo/SKILL.md
.agents/skills/seo/references/STRUCTURED-DATA.md
```

Se aplicó para auditar:

- Metadata del documento inicial de la SPA.
- Título, descripción, idioma, canonical, robots y metadatos Open Graph/Twitter.
- Rastreabilidad y semántica de la página.
- Datos estructurados y su relación con contenido visible.
- Responsive, fuentes, imágenes y estabilidad visual.

Conclusiones verificadas:

- `next/image` no aplica porque el proyecto usa React/Vite, no Next.js, y no contiene imágenes de contenido que requieran ese componente.
- Los gráficos cuentan con alturas explícitas en skeletons y fallbacks para evitar cambios bruscos de layout.
- La fuente `Inter` está declarada como fallback de Tailwind, pero no se carga mediante `@font-face` ni proveedor externo.
- La metadata SEO de `frontend/index.html` quedó identificada como pendiente de implementación o revisión final.

## Cambios verificados

### Frontend

- El dashboard mantiene cuatro KPIs: ingresos, gastos, beneficio y margen.
- Los gráficos se cargan de forma diferida y tienen estados de carga/error.
- La lógica de fetch está separada del componente principal.
- Los cálculos financieros permanecen en `frontend/src/lib/financial-utils.ts`.
- Se añadieron pruebas de componente para `KPICard`.
- Se configuró `frontend/src/test-setup.ts` para los matchers de Testing Library.

### Backend y contrato de datos

- La API continúa basada en FastAPI y datos mock, sin base de datos.
- El frontend consume la ruta relativa `fetch("/api/metrics")` mediante el proxy de Vite.
- `generate_mock_movements(seed=42)` conserva la generación determinista de 360 movimientos.
- Los tipos de `FinancialMovement` permanecen duplicados y sincronizados entre:
  - `backend/app/routes.py`.
  - `frontend/src/lib/financial-types.ts`.
- Se mantienen los endpoints de métricas, filtros, agregaciones, comparativas, alertas y vistas B2B/B2C.

### Pruebas y validación

Resultado registrado durante la revisión:

```text
Test Files  2 passed
Tests       8 passed
```

La suite frontend de Vitest pasó con las pruebas de utilidades y de `KPICard`.

La validación recomendada para cualquier cambio posterior queda definida como:

```bash
cd backend && pytest
cd ../frontend && npm run test
cd ../frontend && npx tsc --noEmit
cd ../frontend && npm run lint
```

El build documentado es:

```bash
cd frontend && npm run build
```

En la revisión anterior no se pudo confirmar la ejecución del build por falta de herramienta de terminal disponible en ese momento. Por tanto, no debe considerarse verificado hasta ejecutarlo explícitamente.

Advertencias conocidas del editor:

- Algunas clases Tailwind arbitrarias pueden simplificarse (`h-[300px]` a `h-75` y `h-[280px]` a `h-70`).
- El entorno reportó vulnerabilidades asociadas a `node:24-alpine`; esto corresponde a la imagen Docker y no a una advertencia del build de Vite.

## Skill del ecosistema elegida

La skill del ecosistema elegida fue:

```text
seo
```

Se eligió porque es la skill que cubre el gap transversal más relevante que no estaba cubierto por las skills de accesibilidad y React: la optimización técnica del documento público de una SPA.

Su elección está justificada por estos aspectos del proyecto:

- El dashboard se sirve inicialmente desde `frontend/index.html`.
- La metadata descriptiva, el idioma, canonical y directivas de indexación deben definirse fuera de los componentes React.
- La semántica de encabezados y el contenido visible influyen en la interpretación de la aplicación.
- Las recomendaciones SEO también ayudan a revisar viewport, responsive, estabilidad visual y rendimiento móvil.
- La skill incluye referencias para evaluar datos estructurados sin añadir JSON-LD artificial o no visible.

La skill SEO se utiliza como guía de auditoría técnica. No implica que el dashboard vaya a obtener una posición concreta en buscadores. El posicionamiento, la indexación real y Core Web Vitals requieren mediciones posteriores con navegador, Lighthouse, datos de campo o Search Console.

## Skill interna creada

Se creó la skill específica del repositorio:

```text
.agents/skills/origen/SKILL.md
```

### Propósito de `origen`

`origen` concentra el conocimiento que las skills generales no pueden conocer del proyecto:

- Arquitectura React/Vite + FastAPI.
- Flujo obligatorio `/api/metrics` y proxy de Vite.
- Contrato duplicado entre modelos Pydantic y tipos TypeScript.
- Generación determinista con `seed=42` y 360 movimientos.
- Fórmulas de KPIs, agregaciones, comparativas y alertas.
- Convenciones de nombres, imports, exports y estilos.
- Restricciones sobre `mock-data.ts`, `components/ui/` y `routes.py`.
- Comandos de tests, TypeScript, lint, build y Docker.
- Riesgos conocidos y criterios antes de aceptar un cambio.

### Estructura formal de `origen`

La skill quedó organizada como una ficha operativa con:

- **Objetivo:** qué debe proteger y resolver.
- **Cuándo usarla:** ámbitos de aplicación.
- **Inputs requeridos:** tipo de cambio, archivos, comportamiento, restricciones y criterios.
- **Contexto del repositorio:** arquitectura, API, datos y tipos.
- **Procedimiento:** revisión, implementación, validación financiera, UI y QA.
- **Output esperado:** información que debe acompañar la entrega.
- **Criterios de aceptación:** checklist verificable.
- **Restricciones y riesgos:** reglas que no deben incumplirse.
- **Ejemplos de uso:** filtros, KPIs, proxy y Docker.

## Estado actual y próximos pasos

### Completado

- [x] Skills `accessibility`, `vercel-react-best-practices` y `seo` aplicadas o documentadas.
- [x] Skill interna `origen` creada.
- [x] Convenciones y riesgos del repositorio consolidados.
- [x] Pruebas frontend registradas como satisfactorias.
- [x] Justificación de la skill SEO documentada.

### Pendiente

- [ ] Implementar o cerrar la revisión de metadata SEO en `frontend/index.html`.
- [ ] Ejecutar y registrar el build frontend (`npm run build`).
- [ ] Revalidar TypeScript, lint y tests después de cualquier cambio adicional.
- [ ] Considerar las funcionalidades aún pendientes del producto: selector de periodo, filtros visibles, comparativa B2B/B2C, alertas en UI y responsive móvil.
