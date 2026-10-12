# Progreso del proyecto

## Funcion

- La interfaz React/Vite sirve el documento HTML en el puerto `5173`; en la salida compartida Vite anunció `ready` y `curl http://localhost:5173/` respondió `200` con el HTML de la app. Esto confirma que Vite respondió localmente, no que la interfaz se haya renderizado correctamente en el navegador. [App.tsx](../frontend/src/App.tsx), [main.tsx](../frontend/src/main.tsx)
- La pantalla solicita `GET /api/metrics`, calcula KPI y datos mensuales en frontend, y presenta cuatro indicadores junto con dos gráficos. [App.tsx](../frontend/src/App.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts), [kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx)
- El backend expone `/health` y rutas de movimientos, filtros, resúmenes, comparaciones y alertas. Los logs compartidos muestran respuestas `200` para `/health` y varias solicitudes a `/api/metrics`. [routes.py](../backend/app/routes.py)
- La comprobación de TypeScript `npx tsc -b --pretty false` terminó con código 0 en una ejecución compartida. No se ha documentado aquí una ejecución satisfactoria de las suites `npm test` o `pytest`. [package.json](../frontend/package.json), [test_routes.py](../backend/tests/test_routes.py)

## Limitaciones Actuales

- Los movimientos son simulados: el generador produce 360 registros, usa semilla `42` y asigna años relativos a `date.today()`; no hay base de datos declarada. [routes.py](../backend/app/routes.py), [docker-compose.yml](../docker-compose.yml)
- El encabezado del frontend está fijado en `2024 - Full Year`, pero el rango generado depende de la fecha actual. [App.tsx](../frontend/src/App.tsx), [routes.py](../backend/app/routes.py)
- La pantalla principal consume `/api/metrics`; no se ha observado que use las demás rutas analíticas de la API. [App.tsx](../frontend/src/App.tsx), [routes.py](../backend/app/routes.py)
- Vite reenvía `/api` a `172.18.0.1:8000`, una dirección fija con comentario local explicando que se cambió tras un problema de conectividad. [vite.config.ts](../frontend/vite.config.ts)
- Aunque hubo respuesta local `200`, el navegador de Codespaces mostró `502` para el puerto reenviado `5173`. Además, una ejecución reciente de `docker compose up --build` terminó con código `1`; no se cuenta aquí con su salida de error para atribuir la causa. [docker-compose.yml](../docker-compose.yml)
- Compose usa `depends_on`, que ordena el inicio pero no espera a que la API esté lista. No declara healthcheck. [docker-compose.yml](../docker-compose.yml)

## Proximos Pasos Sugeridos

1. Diagnosticar el `502` de Codespaces y la salida `1` de Compose usando el estado de servicios y sus logs; distinguir fallo de reenvío del puerto de fallo del contenedor.
2. Cuando el puerto `5173` sea accesible, comprobar el render de React en navegador además de la respuesta HTML local.
3. Implementar el selector anual acordado para que cambie solo el KPI Income, sumando los registros simulados disponibles para ese año; cubrir años distintos, ausencia de ingresos y extremos de fechas con pruebas frontend.
4. Acordar si el encabezado debe reflejar el rango real y si los análisis adicionales del backend deben aparecer en la interfaz.
5. Si se requiere persistencia o años completos, definir primero el alcance de datos; la implementación actual solo genera movimientos simulados y no garantiza doce meses para cada año.
