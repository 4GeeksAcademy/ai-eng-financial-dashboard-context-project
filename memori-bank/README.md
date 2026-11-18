# Memoria del proyecto

## Overview del producto

Este repositorio implementa un dashboard de métricas financieras con un frontend React/TypeScript y una API FastAPI. La interfaz solicita `GET /api/metrics`, calcula KPIs y agregados mensuales, y presenta tarjetas y gráficos de ingresos/gastos y porcentaje de beneficio ([App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts)).

La API genera movimientos simulados: usa la semilla `42`, genera 30 movimientos por mes para los 12 meses completos anteriores a la fecha de ejecución y ordena los resultados por fecha. La semilla permite reproducir los movimientos para una fecha dada, pero el rango temporal cambia con la fecha de ejecución ([routes.py](../backend/app/routes.py)).

El frontend consume `GET /api/metrics`. El backend también declara rutas de facets, resumen, categorías, comparación, alertas, B2B y B2C, pero no se observan conectadas desde la interfaz actual ([App.tsx](../frontend/src/App.tsx), [routes.py](../backend/app/routes.py)). Docker Compose define servicios para frontend y backend; no declara una base de datos ([docker-compose.yml](../docker-compose.yml)).

## Skills seleccionadas

Se eligió la skill **SEO** porque el proyecto se posiciona en el sector web y necesita cuidar su visibilidad orgánica y descubrimiento en buscadores. La guía cubre SEO técnico, optimización on-page y datos estructurados; sirve para orientar mejoras, pero no garantiza posiciones ni resultados de búsqueda.

## Progreso y validación de skills

### Skill interna utilizada: `api-usage-patterns`

La skill del repositorio está en [`.skills/api-usage-patterns/SKILL.md`](../.skills/api-usage-patterns/SKILL.md). Se consultó para documentar el contrato de la API con evidencia, distinguir una inspección estática de una respuesta en vivo y no confundir movimientos simulados con transacciones reales.

Su guía ayudó a contrastar el consumidor con el contrato de `GET /api/metrics`: la API devuelve una lista de movimientos con `create_date`, `amount`, `operation_type`, `category` y `business_type`, sin envoltorio `data`. También orienta a mantener explícitos los estados de error y respuesta vacía, y a no convertir valores variables —como las fechas— en constantes.

### Skill del ecosistema seleccionada: SEO

[`skills-lock.json`](../skills-lock.json) registra la skill `seo` de `addyosmani/web-quality-skills` (commit `afa8da942115f2961fdbfa80807ea0b232ff6c00`). Se seleccionó porque el dashboard es una aplicación web y la guía SEO puede orientar mejoras de visibilidad orgánica y descubrimiento, incluyendo aspectos técnicos, contenido y datos estructurados.

**Límite de validación:** el archivo `skills/seo/SKILL.md` no está presente en este checkout. La selección y procedencia se verificaron en el lockfile, pero no se revisaron las instrucciones completas ni se ejecutó una auditoría SEO. No se atribuyen mejoras de posicionamiento ni cambios SEO a esta selección.

### Resultados registrados

- Se verificó estáticamente en el código que `GET /api/metrics` genera movimientos con semilla `42`, los filtra y responde una lista; las facetas exponen `min_date` y `max_date`. La guía de APIs y el contrato documentado sirven para evitar inventar campos o fijar fechas de ejemplo.
- La generación documentada produce 30 movimientos por mes para los 12 meses completos anteriores al mes de ejecución. La semilla hace reproducibles los datos para una fecha dada, no fija el rango entre ejecuciones.
- [`Verificacion.md`](../Verificacion.md) registra validaciones previas: 7 pruebas frontend, build y comprobación TypeScript completados, 15 pruebas de rutas backend, y un smoke test que recibió 360 movimientos con rango `2025-11-01`–`2026-10-28`. También anota advertencias de Vite y Starlette/httpx, y que Docker Compose no se probó.
- Esos resultados son evidencia ya registrada, no pruebas ejecutadas en esta actualización. La revisión de esta nota fue estática; no se modificaron ni ejecutaron código o pruebas.
- La skill interna aporta un proceso explícito para corroborar contratos y procedencia de datos, reduciendo errores de integración basados en supuestos.

### Aprendizajes y próximos pasos

- Registrar por separado una skill **seleccionada**, una skill **consultada** y una skill **validada** evita presentar una intención como trabajo completado.
- Los resultados de tests y smoke tests son sensibles al momento de ejecución. El rango citado es histórico y no representa necesariamente el rango actual.
- Para futuras iteraciones, incorporar o hacer accesible el archivo de la skill SEO y realizar una revisión concreta de SEO técnico y contenido antes de documentar resultados; comprobar luego los cambios con validaciones adecuadas al alcance.
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
