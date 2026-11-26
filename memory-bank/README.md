# Memoria del proyecto

## Overview del producto

Este repositorio implementa un dashboard de métricas financieras con un frontend React/TypeScript y una API FastAPI. La interfaz solicita `GET /api/metrics`, calcula KPIs y agregados mensuales, y presenta tarjetas y gráficos de ingresos/gastos y porcentaje de beneficio ([App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts)).

La API genera movimientos simulados: usa la semilla `42`, genera 30 movimientos por mes para los 12 meses completos anteriores a la fecha de ejecución y ordena los resultados por fecha. La semilla permite reproducir los movimientos para una fecha dada, pero el rango temporal cambia con la fecha de ejecución ([routes.py](../backend/app/routes.py)).

El frontend consume `GET /api/metrics`. El backend también declara rutas de facets, resumen, categorías, comparación, alertas, B2B y B2C, pero no se observan conectadas desde la interfaz actual ([App.tsx](../frontend/src/App.tsx), [routes.py](../backend/app/routes.py)). Docker Compose define servicios para frontend y backend; no declara una base de datos ([docker-compose.yml](../docker-compose.yml)).

## Skills del ecosistema

Se cargaron las skills `accessibility` y `vercel-react-best-practices` indicadas por el tech lead. También se descubrieron `performance` y `seo` con `npx skills find`; se eligió **SEO** porque permite revisar los metadatos de la página. El dashboard es una SPA de React/Vite, no Next.js, y no tiene una URL pública configurada: no se añadieron APIs de Next, canonical, sitemap ni datos estructurados sin una necesidad comprobada.

## Progreso y validación de skills

### Skills aplicadas y verificaciones

- **`accessibility`:** la skill está en [`.agents/skills/accessibility/SKILL.md`](../.agents/skills/accessibility/SKILL.md). Se añadieron anuncios accesibles para carga y error, `aria-busy` en las regiones que cargan, se ocultaron iconos decorativos a tecnologías de asistencia y se corrigió la semántica de títulos de tarjetas. No se registró una prueba manual completa de teclado, lector de pantalla o contraste; esos resultados quedan pendientes.
- **`vercel-react-best-practices`:** la skill está en [`.agents/skills/vercel-react-best-practices/SKILL.md`](../.agents/skills/vercel-react-best-practices/SKILL.md). Como la aplicación usa React/Vite y no Next.js, no corresponden `next/image` ni `next/font`. Se preparó una imagen frontend multi-stage con Nginx para producción, se mantuvo Docker Compose en el stage de desarrollo y se eliminó la fuente Inter remota para usar fuentes del sistema.
- **`seo`:** la skill está en [`.agents/skills/SEO/SKILL.md`](../.agents/skills/SEO/SKILL.md). La revisión de la página afinó el título y la descripción para que describan ingresos, gastos, beneficio y tendencias mensuales; no se afirma que esto mejore rankings. No se configuraron señales que requieren un dominio o contenido público, como sitemap o canonical.
- **Skill interna `api-usage-patterns`:** está en [`.skills/api-usage-patterns/SKILL.md`](../.skills/api-usage-patterns/SKILL.md). Se consultó para documentar el contrato de la API con evidencia, distinguir una inspección estática de una respuesta en vivo y no confundir movimientos simulados con transacciones reales.

La skill interna ayudó a contrastar el consumidor con el contrato de `GET /api/metrics`: la API devuelve una lista de movimientos con `create_date`, `amount`, `operation_type`, `category` y `business_type`, sin envoltorio `data`. También orienta a mantener explícitos los estados de error y respuesta vacía, y a no convertir valores variables —como las fechas— en constantes.

### Resultados registrados

- Se verificó estáticamente en el código que `GET /api/metrics` genera movimientos con semilla `42`, los filtra y responde una lista; las facetas exponen `min_date` y `max_date`. La guía de APIs y el contrato documentado sirven para evitar inventar campos o fijar fechas de ejemplo.
- La generación documentada produce 30 movimientos por mes para los 12 meses completos anteriores al mes de ejecución. La semilla hace reproducibles los datos para una fecha dada, no fija el rango entre ejecuciones.
- El 2026-11-26, `cd frontend && npm test` pasó (7 pruebas) y `cd frontend && npm run build` completó TypeScript y Vite. Vite mantiene una advertencia de chunk principal de 584.66 kB, por encima del umbral de 500 kB.
- [`Verificacion.md`](../Verificacion.md) registra validaciones previas: 7 pruebas frontend, build y comprobación TypeScript completados, 15 pruebas de rutas backend, y un smoke test que recibió 360 movimientos con rango `2025-11-01`–`2026-10-28`. También anota advertencias de Vite y Starlette/httpx, y que Docker Compose no se probó.
- La skill interna aporta un proceso explícito para corroborar contratos y procedencia de datos, reduciendo errores de integración basados en supuestos.

### Aprendizajes y próximos pasos

- Registrar por separado una skill **seleccionada**, una skill **consultada** y una skill **validada** evita presentar una intención como trabajo completado.
- Los resultados de tests y smoke tests son sensibles al momento de ejecución. El rango citado es histórico y no representa necesariamente el rango actual.
- Las guías de Next.js no implican que deban introducirse dependencias de Next.js en un frontend Vite; se aplican solo los principios compatibles con el stack real.
- Completar la verificación manual de teclado, foco visible, contraste y lector de pantalla antes de afirmar conformidad de accesibilidad.
- Al repetir validaciones, añadir fecha y comando a [`Verificacion.md`](../Verificacion.md), registrar advertencias y señalar claramente qué quedó pendiente, incluida la prueba de Docker Compose si pasa a formar parte del alcance.

## Stack tecnológico

| Área | Tecnología | Evidencia |
|---|---|---|
| Lenguajes | TypeScript/JavaScript en frontend; Python en backend | [frontend/package.json](../frontend/package.json), [backend/app/main.py](../backend/app/main.py) |
| Frontend | React, Vite, Tailwind CSS, Recharts | Dependencias en [frontend/package.json](../frontend/package.json); configuración Vite en [vite.config.ts](../frontend/vite.config.ts) |
| Backend/API | FastAPI, Pydantic, Uvicorn | [requirements.txt](../backend/requirements.txt), [routes.py](../backend/app/routes.py) |
| Infraestructura local | Docker Compose; contenedores frontend y backend | [docker-compose.yml](../docker-compose.yml), [Dockerfile](../backend/Dockerfile) |
| Calidad y pruebas | TypeScript, ESLint, Vitest; pytest, pytest-cov, httpx | [frontend/package.json](../frontend/package.json), [requirements.txt](../backend/requirements.txt) |
| Depuración | debugpy en la imagen del backend | [Dockerfile](../backend/Dockerfile) |

## Límites de esta descripción

Los movimientos se generan en el backend. El repositorio no muestra integración con bancos, datos de clientes, autenticación ni almacenamiento persistente; no se deben atribuir esas capacidades al producto.
