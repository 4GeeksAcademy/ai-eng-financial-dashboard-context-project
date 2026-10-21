# Progreso de entrega

Fecha de revisión: 2026-10-21

## Skills aplicadas

- `web-design-reviewer`: se verificaron encabezados, anuncios de error, SVG, contraste y navegación de los gráficos con teclado.
- `vercel-react-best-practices`: se aplicó `js-combine-iterations` a `computeKPIs`, consolidando sus dos pares de `filter`/`reduce` en un solo recorrido.
- Skill SEO adicional: `coreyhaines31/marketingskills@seo-audit`, encontrada con `npx skills find seo` e instalada globalmente para GitHub Copilot. Fue elegida por su alcance de SEO técnico/on-page, 233K instalaciones reportadas por skills.sh y repositorio MIT con 55.7K estrellas. Se aplicó de forma acotada al título y la meta description; no hay dominio público ni Search Console para justificar auditorías de indexación.
- Skill interna: `.skills/financial-dashboard-delivery-qa/SKILL.md`, enfocada en checks, diagnóstico del proxy y preservación de cambios en este proyecto.

## Cambios realizados

- El error de carga en `frontend/src/App.tsx` ahora tiene `role="alert"`.
- Los títulos de ambos gráficos son encabezados `h2`.
- El título de `frontend/index.html` identifica el dashboard y su meta description tiene 157 caracteres.
- `computeKPIs` calcula ingresos y gastos en un único recorrido.
- `AGENTS.md` indica revisar `.skills/` además de `.agents/skills/`.

## Verificación

- `npm test -- src/lib/financial-utils.test.ts`: 5 tests pasaron.
- `npm run build`: terminó correctamente. Informó un chunk de 584.18 kB, por encima del umbral de 500 kB, la advertencia Node `[DEP0205]` y una nota de tiempos de plugins de Vite; deben volver a compararse tras los cambios finales.
- Prueba de navegador con respuesta de API simulada: la vista expone un `h1` y dos `h2`; al fallar la API, aparece un `alert`; los SVG están etiquetados u ocultos; ambos gráficos son enfocables (`role="application"`, `tabindex="0"`) y `ArrowRight` mueve el punto activo y muestra valores.
- Contraste medido en los textos comprobados: mínimo 5.17:1, superior al umbral WCAG AA de 4.5:1 para texto normal.
- Layout probado a 375, 768, 1280 y 1920 px sin overflow horizontal.

## Limitaciones y estado de Git

- El proxy de Vite no resolvió `backend` (`EAI_AGAIN`/`502`) durante la prueba local. El servicio que respondía en `localhost:8000` mostraba otra API, por lo que la integración real no se consideró validada; la verificación de gráficos usó datos simulados en el navegador.
- Al iniciar esta tarea ya había modificaciones locales en `backend/Dockerfile`, `docker-compose.yml` y `frontend/Dockerfile`, además de skills comunitarias y `skills-lock.json` sin seguimiento. Se conservaron y deben excluirse de los commits de esta entrega.
- La instalación global de `seo-audit` se completó para GitHub Copilot; el instalador reportó `Med Risk` en Snyk y fallo al intentar instalar el formato PromptScript, no la skill de Copilot.