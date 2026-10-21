---
name: financial-dashboard-delivery-qa
description: Use when implementing or validating changes to this FastAPI and React/Vite financial dashboard, especially accessibility, release readiness, or merge checks.
---

# QA de entregas del dashboard financiero

## Objetivo

Validar cambios del dashboard con evidencia del repositorio y del navegador, manteniendo aislados los cambios previos del usuario y evitando asumir que un servicio local pertenece a este proyecto.

## Entradas

- El alcance funcional o visual que se va a cambiar.
- La rama activa y el estado inicial de Git.
- La página local y el endpoint de API que se pretenden validar.

## Procedimiento

1. Lee `AGENTS.md`, las reglas aplicables de `.agents/rules/` y los archivos pertinentes de `memory-bank/`. Revisa `git status --short --branch` y conserva cualquier modificación previa; no uses `git add .`.
2. Confirma el stack en `frontend/package.json`, `frontend/vite.config.ts`, `docker-compose.yml` y `backend/app/routes.py`. La API de este proyecto sirve `GET /health` y `GET /api/metrics`; el proxy de Vite espera al servicio Compose `backend:8000`.
3. Antes de atribuir un error a la UI, verifica que el backend responda desde el servicio Compose y que la ruta coincida con el código de `backend/app/routes.py`. No uses un API distinto que ya ocupe `localhost:8000` como sustituto. Registra por separado errores de DNS del proxy, respuestas HTTP y fallos del frontend.
4. En la revisión de accesibilidad, comprueba un único `h1`, encabezados de sección semánticos, anuncios `role="alert"` o `aria-live` para errores, etiquetas o `aria-hidden` correctos en SVG, y ratios de contraste WCAG AA (4.5:1 para texto normal, 3:1 para texto grande). Comprueba con teclado el foco y las flechas en los gráficos Recharts cuando haya datos.
5. Revisa móvil a 375 px y los tamaños relevantes para el cambio; comprueba desbordamiento horizontal y que los estados de carga, error y datos mantengan contenido accesible.
6. Desde `frontend/`, ejecuta el test focalizado del cambio. Para la validación de entrega ejecuta `npm run build`; registra las advertencias y compáralas con la salida previa, sin ocultarlas subiendo límites de warning.
7. Limita SEO a metadatos descriptivos coherentes con el dashboard. No inventes URL canónica, sitemap, intención de indexación ni datos de tráfico si el proyecto no tiene dominio desplegado o Search Console.
8. Antes de crear commits, revisa el diff y prepara solo los archivos de esta tarea. Excluye cambios de usuario, artefactos de instalación de skills y archivos no relacionados.

## Salidas

- Hallazgos priorizados con ruta, evidencia, impacto y corrección propuesta o aplicada.
- Resultados de tests/build, incluyendo advertencias y bloqueos del entorno.
- Lista precisa de archivos preparados y commits resultantes, si se solicitaron.

## Criterios de aceptación

- El cambio conserva el comportamiento cubierto por los tests focalizados.
- La página expone una estructura de encabezados lógica, errores anunciables, SVG etiquetados u ocultos si son decorativos, y contraste conforme a WCAG AA.
- Los gráficos con datos se pueden recorrer con teclado y no existe overflow horizontal en los tamaños probados.
- El build frontend termina correctamente; cualquier warning remanente se comunica con evidencia.
- El diff y cada commit excluyen cambios preexistentes que no pertenecen a la tarea.