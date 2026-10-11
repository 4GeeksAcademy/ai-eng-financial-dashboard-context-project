# Contexto tecnico

## Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4 y Recharts. Iconos con Lucide; pruebas con Vitest y lint con ESLint. Son dependencias declaradas, no versiones instaladas comprobadas. Fuente: [package.json](../frontend/package.json).
- Backend: FastAPI, modelos Pydantic y servidor Uvicorn. Pruebas con pytest, HTTPX y `TestClient`; dependencias Python sin versiones fijadas en el archivo de requisitos. Fuentes: [requirements.txt](../backend/requirements.txt), [routes.py](../backend/app/routes.py), [test_routes.py](../backend/tests/test_routes.py).
- Entorno de desarrollo con Docker Compose: servicios `frontend` y `backend`, con volumenes para el codigo. Fuente: [docker-compose.yml](../docker-compose.yml).

## Estructura
- `frontend/src/`: entrada React y composicion de la pantalla. Fuentes: [main.tsx](../frontend/src/main.tsx), [App.tsx](../frontend/src/App.tsx).
- `frontend/src/components/dashboard/` y `frontend/src/components/ui/`: componentes del dashboard y elementos compartidos. Fuentes: [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx), [card.tsx](../frontend/src/components/ui/card.tsx).
- `frontend/src/lib/`: tipos del contrato y funciones de calculo y formato, con pruebas de utilidades. Fuentes: [financial-types.ts](../frontend/src/lib/financial-types.ts), [financial-utils.ts](../frontend/src/lib/financial-utils.ts), [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts).
- `backend/app/`: configuracion FastAPI en [main.py](../backend/app/main.py); modelos, endpoints y helpers en [routes.py](../backend/app/routes.py).
- `backend/tests/`: pruebas de helpers y endpoints. Fuente: [test_routes.py](../backend/tests/test_routes.py).

## Comandos
| Directorio | Comando | Funcion |
|---|---|---|
| Raiz | `docker compose up --build` | Construir y arrancar los servicios de desarrollo. |
| `frontend/` | `npm run dev` | Iniciar Vite. |
| `frontend/` | `npm run test` | Ejecutar Vitest una vez. |
| `frontend/` | `npm run lint` | Ejecutar ESLint. |
| `frontend/` | `npm run build` | Ejecutar `tsc -b` y generar el build con Vite. |
| `backend/` | `pytest tests` | Ejecutar las pruebas del backend. |

Fuentes: [README.es.md](../README.es.md), [package.json](../frontend/package.json),
[AGENTS.md](../AGENTS.md), [conftest.py](../backend/tests/conftest.py).
Son comandos documentados o definidos; esta revision no acredita su ejecucion exitosa.

## Comunicacion frontend-backend
1. [App.tsx](../frontend/src/App.tsx) solicita `${API_BASE_URL}/api/metrics` con `fetch`. `API_BASE_URL` toma `VITE_API_BASE_URL` o una cadena vacia si la variable no esta definida; en ese caso, la ruta es relativa al mismo origen.
2. En desarrollo, [vite.config.ts](../frontend/vite.config.ts) redirige `/api` a `http://backend:8000`. El nombre `backend` corresponde al servicio de [docker-compose.yml](../docker-compose.yml); fuera de esa red, debe usarse un destino alcanzable.
3. Compose publica frontend en `5173` y backend en `8000`. Tambien publica `5678` para el depurador de desarrollo. Fuente: [docker-compose.yml](../docker-compose.yml).
4. FastAPI registra el router y devuelve movimientos JSON mediante modelos de respuesta Pydantic. Fuentes: [main.py](../backend/app/main.py), [routes.py](../backend/app/routes.py).
5. El frontend calcula KPIs y agregados mensuales a partir de los movimientos. Los campos y enumeraciones coinciden entre Python y TypeScript; la anotacion TypeScript no valida el JSON recibido. Fuentes: [App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts), [financial-types.ts](../frontend/src/lib/financial-types.ts), [routes.py](../backend/app/routes.py).
6. Los imports `@` apuntan a `src` en Vite y TypeScript; mantener ambas configuraciones alineadas. Fuentes: [vite.config.ts](../frontend/vite.config.ts), [tsconfig.app.json](../frontend/tsconfig.app.json).

## Alcance de la verificacion
Contexto basado en codigo y configuracion revisados estaticamente. No acredita
pruebas funcionales aprobadas ni preparacion para produccion. El backend Docker
usa `debugpy` y `--reload`, propios de la configuracion de desarrollo revisada.
Fuentes: [Dockerfile](../backend/Dockerfile),
[engerineering-findings.md](../engerineering-findings.md).