# Contexto para futuras ediciones

## Convenciones que deben conservarse

- Mantener `backend/` y `frontend/` separados; Compose coordina ambos servicios. Evidencia: [docker-compose.yml](../docker-compose.yml).
- Mantener componentes del dashboard en `frontend/src/components/dashboard/`, componentes UI reutilizables en `frontend/src/components/ui/` y lógica compartida en `frontend/src/lib/`. Evidencia: [frontend/src/components/dashboard/](../frontend/src/components/dashboard/), [frontend/src/components/ui/](../frontend/src/components/ui/) y [frontend/src/lib/](../frontend/src/lib/).
- Mantener tipos de dominio en [frontend/src/lib/financial-types.ts](../frontend/src/lib/financial-types.ts) y cálculos/formateadores en [frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts).
- Mantener el alias `@` sincronizado entre [frontend/tsconfig.app.json](../frontend/tsconfig.app.json) y [frontend/vite.config.ts](../frontend/vite.config.ts).
- Respetar las restricciones de TypeScript y ESLint declaradas en [frontend/tsconfig.app.json](../frontend/tsconfig.app.json), [frontend/tsconfig.node.json](../frontend/tsconfig.node.json) y [frontend/eslint.config.js](../frontend/eslint.config.js).
- Mantener las rutas en [backend/app/routes.py](../backend/app/routes.py), su registro desde [backend/app/main.py](../backend/app/main.py), los modelos Pydantic, `response_model` y parámetros `Query`.
- Mantener el patrón de tests existente: pytest en `backend/tests/` y tests `.test.ts` junto a las utilidades frontend. Evidencia: [backend/tests/test_routes.py](../backend/tests/test_routes.py), [frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts) y [frontend/package.json](../frontend/package.json).
- Mantener las decisiones de accesibilidad implementadas: alerta de errores con semántica live, jerarquía `h1`/`h2`/`h3`, iconos decorativos ocultos para tecnologías de asistencia y resúmenes textuales asociados a los gráficos. Evidencia: [frontend/src/App.tsx](../frontend/src/App.tsx), [frontend/src/components/dashboard/kpi-card.tsx](../frontend/src/components/dashboard/kpi-card.tsx), [frontend/src/components/ui/card.tsx](../frontend/src/components/ui/card.tsx), [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx) y [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx).

Estas convenciones son observaciones del código/configuración actual, no políticas sobre herramientas o procesos que el repositorio no declare.

## Reglas de `.agents/rules/`

Un coding agent debe consultar y respetar:

- [data-contracts-and-api.md](../.agents/rules/data-contracts-and-api.md): coordinación entre Pydantic y TypeScript, nombres y valores de dominio, `response_model`, parámetros `Query` y tests de endpoints.
- [frontend-architecture.md](../.agents/rules/frontend-architecture.md): separación de componentes, tipos y utilidades, alias `@`, restricciones de TypeScript, ESLint y tests frontend.
- [services-and-connection.md](../.agents/rules/services-and-connection.md): coordinación entre Compose, Dockerfiles y Vite; proxy `/api`; servicios, puertos, comandos y datos mock.

Estas reglas están respaldadas por [backend/app/routes.py](../backend/app/routes.py), [frontend/src/App.tsx](../frontend/src/App.tsx), [frontend/vite.config.ts](../frontend/vite.config.ts), [docker-compose.yml](../docker-compose.yml), [frontend/Dockerfile](../frontend/Dockerfile), [backend/Dockerfile](../backend/Dockerfile), [frontend/package.json](../frontend/package.json) y los tests correspondientes.

## Riesgos conocidos

- Cambiar un nombre de campo, tipo o forma de respuesta sin actualizar ambos lados del contrato puede producir errores de validación, datos ausentes o cálculos incorrectos. Evidencia: [backend/app/routes.py](../backend/app/routes.py), [frontend/src/lib/financial-types.ts](../frontend/src/lib/financial-types.ts), [frontend/src/App.tsx](../frontend/src/App.tsx).
- Cambiar `backend`, `8000`, `5173`, `5678`, hosts o comandos de forma aislada puede romper el arranque o la comunicación. Evidencia: [docker-compose.yml](../docker-compose.yml), [frontend/vite.config.ts](../frontend/vite.config.ts), [frontend/Dockerfile](../frontend/Dockerfile) y [backend/Dockerfile](../backend/Dockerfile).
- Eliminar o alterar el proxy `/api` sin actualizar la estrategia de origen puede impedir que `App.tsx` contacte al backend. Evidencia: [frontend/src/App.tsx](../frontend/src/App.tsx) y [frontend/vite.config.ts](../frontend/vite.config.ts).
- Modificar `generate_mock_movements` puede cambiar resultados de todos los endpoints; además, los tests esperan 360 movimientos ordenados. Evidencia: [backend/app/routes.py](../backend/app/routes.py) y [backend/tests/test_routes.py](../backend/tests/test_routes.py).
- Editar [frontend/src/lib/mock-data.ts](../frontend/src/lib/mock-data.ts) no cambia necesariamente el dashboard actual, porque `App.tsx` usa la API. Evidencia: [frontend/src/lib/mock-data.ts](../frontend/src/lib/mock-data.ts) y [frontend/src/App.tsx](../frontend/src/App.tsx).
- Tratar el período mostrado como un año fijo o como prueba del período real de la API. `App.tsx` lo deriva de `create_date` en la respuesta de `/api/metrics` y usa `Period unavailable` cuando no hay datos. Las fechas generadas por el backend dependen de `date.today()` y `_year_for_month()`. Evidencia: [frontend/src/App.tsx](../frontend/src/App.tsx) y [backend/app/routes.py](../backend/app/routes.py).
- Eliminar `AbortController` o actualizar estados desde una petición cancelada: la petición de `/api/metrics` debe conservar la señal y el cleanup del `useEffect` para evitar errores visibles y actualizaciones después del desmontaje. Evidencia: [frontend/src/App.tsx](../frontend/src/App.tsx).
- `depends_on` declara una relación, pero [docker-compose.yml](../docker-compose.yml) no contiene healthcheck; no garantiza readiness del backend.

## Aspectos no determinados

No convertir en hechos ni reglas obligatorias, salvo que aparezca nueva evidencia:

- CI/CD, hooks de Git y política de ramas.
- Prettier u otro formatter obligatorio.
- Umbrales mínimos de cobertura.
- Política formal de versionado o compatibilidad de API.
- Política de idioma de la interfaz.
- Dependencias externas no declaradas por el repositorio.
