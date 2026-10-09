# Guía de agentes

## 1. Proyecto

Este proyecto es un dashboard de métricas financieras. La interfaz muestra ingresos, gastos, beneficio y margen a partir de movimientos financieros. El endpoint principal genera datos de ejemplo en el backend; no trates esos datos como registros persistidos o como información financiera real. Referencias: [frontend/src/App.tsx](frontend/src/App.tsx), [backend/app/routes.py](backend/app/routes.py).

## 2. Stack y estructura

- Front-end: React, TypeScript, Vite y Recharts.
- Back-end: Python, FastAPI y Pydantic; Uvicorn sirve la API.
- `frontend/src/App.tsx`: pantalla principal y carga de datos.
- `frontend/src/components/dashboard/`: KPI y gráficos.
- `frontend/src/lib/`: tipos, utilidades financieras y datos de ejemplo.
- `backend/app/main.py`: creación de la aplicación FastAPI.
- `backend/app/routes.py`: modelos, generación de movimientos y endpoints.
- `frontend/src/lib/financial-utils.test.ts` y `backend/tests/test_routes.py`: pruebas existentes.
- `docker-compose.yml`: servicios de desarrollo.

## 3. Comandos

Antes de iniciar los servicios o verificar la conexión con el backend, comprueba la configuración de entorno del front-end. Si el entorno requiere una URL explícita del backend, debe existir `frontend/.env` con `VITE_API_BASE_URL` definida:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Usa el origen del backend accesible desde el navegador (en Codespaces, la URL pública del puerto 8000), sin `/api` ni barra final: la pantalla añade `/api/metrics`. No uses `http://backend:8000`, que solo es accesible desde la red interna de Compose. Si falta el archivo o la variable en un entorno que los necesita, solicita su configuración antes de continuar y registra la verificación como bloqueada por configuración, no como un fallo del backend. No sobrescribas un archivo de entorno existente ni incluyas secretos en variables `VITE_*`, que son públicas en el navegador. Reinicia Vite después de modificar el archivo; si verificas una compilación, vuelve a compilar.

En el modo predeterminado de Compose, `VITE_API_BASE_URL` puede estar vacía o ausente porque Vite utiliza el proxy de `/api`. Confirma qué modo se está verificando antes de exigir una URL explícita. Referencias: [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/vite.config.ts](frontend/vite.config.ts), [README.es.md](README.es.md).

Ejecuta desde la raíz del repositorio:

```bash
docker compose up --build
```

Con los servicios levantados, ejecuta las verificaciones:

```bash
docker compose exec backend pytest -q
docker compose exec frontend npm test
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
```

El front-end se publica en el puerto `5173`, la API en `8000` y el puerto de depuración del backend en `5678`. Scripts de front-end: [frontend/package.json](frontend/package.json); servicios y puertos: [docker-compose.yml](docker-compose.yml).

## 4. Convenciones

- Mantén los cálculos financieros en funciones de [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts); los componentes deben presentar los datos recibidos, no duplicar las fórmulas.
- Por defecto, llama a la API desde el navegador usando la ruta relativa `/api`. Vite reenvía esas solicitudes a `http://backend:8000`; ese hostname es para la red de Compose, no una URL del navegador. Para un backend con origen explícito, configura `VITE_API_BASE_URL` en `frontend/.env` como se indica en la sección de comandos. Referencias: [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/vite.config.ts](frontend/vite.config.ts).
- Conserva los contratos explícitos: tipos de movimiento en [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts), y modelos de respuesta, tipos permitidos y límites de parámetros en [backend/app/routes.py](backend/app/routes.py). Si cambia el contrato, actualiza ambos lados.
- Sigue el estilo visible del lenguaje: nombres `snake_case` en Python y `camelCase` para funciones TypeScript; los tipos TypeScript usan `PascalCase`.

## 5. Reglas de dominio

- Un movimiento tiene `create_date`, `amount`, `operation_type`, `category` y `business_type`. Los tipos permitidos son `income`/`outcome`, las categorías declaradas en el modelo y `B2B`/`B2C`. Referencias: [backend/app/routes.py](backend/app/routes.py), [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts).
- El beneficio se calcula como ingresos menos gastos. El porcentaje de beneficio es beneficio dividido entre ingresos, expresado como porcentaje; si no hay ingresos, el front-end devuelve `0`. Referencia: [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts).
- Al agrupar por mes, conserva año y mes para no combinar el mismo mes de años distintos. Trata `create_date` como una fecha de calendario y evita que la zona horaria local altere el mes. Referencias: [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts), [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts).
- Los movimientos del endpoint principal se generan con `seed=42`, 30 por mes, y sus años dependen de la fecha actual. Si cambias la semilla o las reglas de fecha, actualiza las pruebas correspondientes. Referencia: [backend/app/routes.py](backend/app/routes.py).

## 6. Forma de trabajar

- Antes de trabajar en el front-end, lee [`.agents/rules/frontend.md`](.agents/rules/frontend.md); antes de trabajar en el back-end, lee [`.agents/rules/backend.md`](.agents/rules/backend.md). Si el cambio afecta a ambos, lee las dos reglas.
- Antes de analizar, editar o generar cambios, revisa las instrucciones vigentes en `./.agents/rules` y las skills en `./.agents/skills`, si existen, además de `./memory-bank`, si existe.
- Después de cada nueva implementación o cambio importante en el código —por ejemplo, una funcionalidad, un contrato de API, la arquitectura o dependencias, una regla de negocio o el proceso de verificación— actualiza los documentos pertinentes de `./memory-bank` para que reflejen la realidad vigente del proyecto. Mantén [memory-bank/product.md](memory-bank/product.md) alineado con las capacidades y límites del producto, [memory-bank/techcontext.md](memory-bank/techcontext.md) con el stack y los flujos técnicos, y [memory-bank/progress.md](memory-bank/progress.md) con las funciones implementadas, limitaciones actuales y próximos pasos. Distingue los hechos verificados de las sugerencias; no describas trabajo pendiente como si ya estuviera implementado.
- Antes de añadir un filtro a la interfaz, confirma que el endpoint elegido lo admite. Cada endpoint puede aceptar parámetros distintos. Referencias: [frontend/src/App.tsx](frontend/src/App.tsx), [backend/app/routes.py](backend/app/routes.py).
- Cuando cambies cálculos, contratos, filtros o fechas, modifica o añade pruebas junto con el cambio y conserva las verificaciones que cubren el comportamiento existente.
- Mantén alineado el período anunciado por la interfaz con las fechas devueltas por el backend; no asumas que el rótulo fijo `2024 - Full Year` describe los datos generados actualmente. Referencias: [frontend/src/App.tsx](frontend/src/App.tsx), [backend/app/routes.py](backend/app/routes.py).

## 7. Límites y verificación

- El front-end tiene pruebas unitarias para utilidades financieras, pero no pruebas del flujo de `App` hacia la API. Si cambias la carga, los estados de error o el proxy, comprueba la integración además de ejecutar las pruebas unitarias. Referencias: [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts), [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/vite.config.ts](frontend/vite.config.ts).
- La prueba llamada `test_generate_mock_movements_returns_full_year_sorted_data` comprueba que hay 360 movimientos y que están ordenados; no comprueba el año ni el intervalo de fechas. No tomes el nombre de una prueba como garantía de lo que verifica. Referencia: [backend/tests/test_routes.py](backend/tests/test_routes.py).
- Verifica los filtros en las rutas concretas: no todos los endpoints aceptan los mismos. Referencias: [backend/app/routes.py](backend/app/routes.py), [backend/tests/test_routes.py](backend/tests/test_routes.py).
- No cambies ni crees reglas, skills o memoria del proyecto fuera del alcance pedido. Revisa primero si esas ubicaciones existen y sigue su contenido cuando estén presentes.
