# Stack y arquitectura técnica

## Tecnologías verificadas

- **Frontend:** React 19, React DOM 19, TypeScript, Vite, Tailwind CSS y Recharts; también se declaran Lucide React, Vitest y ESLint. Fuentes: [`frontend/package.json`](../frontend/package.json), [`frontend/vite.config.ts`](../frontend/vite.config.ts).
- **Backend:** Python 3.13, FastAPI y Uvicorn; debugpy se usa en el comando del contenedor. `pytest`, `pytest-cov` y `httpx` están declarados en dependencias. Fuentes: [`backend/Dockerfile`](../backend/Dockerfile), [`backend/requirements.txt`](../backend/requirements.txt).
- **Orquestación:** Docker Compose define `frontend` (puerto 5173) y `backend` (puertos 8000 y 5678; 5678 es depuración, no otro servicio). Fuente: [`docker-compose.yml`](../docker-compose.yml).
- **Versiones pendientes:** `backend/requirements.txt` no fija versiones; por ello no se registran versiones concretas de paquetes Python instalados.

## Arquitectura y flujo de datos

1. Compose inicia frontend y backend. El frontend corre Vite y reenvía `/api` a `http://backend:8000` en la red de Compose. Fuentes: [`docker-compose.yml`](../docker-compose.yml), [`frontend/Dockerfile`](../frontend/Dockerfile), [`frontend/vite.config.ts`](../frontend/vite.config.ts).
2. [`frontend/src/App.tsx`](../frontend/src/App.tsx) solicita `/api/metrics`, maneja carga/error y entrega los movimientos a [`frontend/src/lib/financial-utils.ts`](../frontend/src/lib/financial-utils.ts), que calcula KPI y agregados mensuales.
3. [`backend/app/main.py`](../backend/app/main.py) crea la aplicación FastAPI e incluye el router. [`backend/app/routes.py`](../backend/app/routes.py) define modelos, genera datos simulados y responde a las rutas de salud y métricas.
4. Los tipos de movimiento del cliente y los modelos Pydantic del servidor son definiciones separadas. Fuentes: [`frontend/src/lib/financial-types.ts`](../frontend/src/lib/financial-types.ts), [`backend/app/routes.py`](../backend/app/routes.py).

## Inicio y comprobaciones

Desde la raíz del repositorio:

```bash
docker compose up --build
```

URLs locales documentadas: frontend `http://localhost:5173`, backend `http://localhost:8000`, documentación API `http://localhost:8000/docs` (fuente: [`README.es.md`](../README.es.md)).

Con Compose en ejecución:

```bash
curl -i http://localhost:8000/health
curl -i http://localhost:8000/api/metrics
docker compose exec -T backend pytest
docker compose exec -T frontend npm test
```

Los dos comandos de pruebas se ejecutaron en esta revisión: backend, **16 aprobadas** con una advertencia de deprecación de Starlette; frontend, **5 aprobadas**. Los scripts frontend están definidos en [`frontend/package.json`](../frontend/package.json) y las pruebas backend en [`backend/tests/test_routes.py`](../backend/tests/test_routes.py).

## Archivos de referencia

| Archivo | Responsabilidad |
|---|---|
| [`docker-compose.yml`](../docker-compose.yml) | Servicios, puertos, montajes y dependencia frontend/backend. |
| [`frontend/Dockerfile`](../frontend/Dockerfile) | Imagen Node y comando de desarrollo Vite. |
| [`frontend/package.json`](../frontend/package.json) | Dependencias y scripts de desarrollo, build, lint y pruebas. |
| [`frontend/vite.config.ts`](../frontend/vite.config.ts) | Plugins, alias y proxy de API. |
| [`frontend/src/App.tsx`](../frontend/src/App.tsx) | Carga de datos y composición de la vista. |
| [`frontend/src/lib/financial-utils.ts`](../frontend/src/lib/financial-utils.ts) | Cálculos de KPI, agregación mensual y formato. |
| [`backend/Dockerfile`](../backend/Dockerfile) | Imagen Python y comando Uvicorn/debugpy. |
| [`backend/requirements.txt`](../backend/requirements.txt) | Dependencias Python declaradas. |
| [`backend/app/main.py`](../backend/app/main.py) | Inicialización FastAPI, CORS y router. |
| [`backend/app/routes.py`](../backend/app/routes.py) | Modelos, datos simulados, filtros y endpoints. |
| [`backend/tests/test_routes.py`](../backend/tests/test_routes.py) | Pruebas de rutas y lógica backend. |

## Pendiente de verificar

- No se ha inspeccionado una configuración de despliegue productivo, base de datos o autenticación; su ausencia en los archivos revisados no demuestra que no exista fuera del repositorio.
- No está comprobado que TypeScript valide en runtime el JSON de la API; `App.tsx` consume `response.json()` directamente.
- La intención del periodo financiero debe confirmarse antes de modificar etiqueta o generación de fechas. Ver [hallazgos de Fase 2](../docs/phase2-engineering-findings.md).

## Mantenimiento de esta memoria

Actualiza stack, flujo y comandos cuando cambien los manifiestos, Dockerfiles, Compose o puntos de entrada. Ejecuta los comandos pertinentes y registra resultados junto con advertencias; no infieras versiones desde paquetes sin restricciones.
