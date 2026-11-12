# Verificación de la fase 1

## Afirmaciones verificadas

| Afirmación | Evidencia y alcance |
| --- | --- |
| Hay dos servicios: frontend y backend. | [`docker-compose.yml`](docker-compose.yml); `docker compose ps` mostró ambos activos. |
| El frontend solicita `/api/metrics` y Vite configura un proxy al backend. | [`App.tsx`](frontend/src/App.tsx), [`vite.config.ts`](frontend/vite.config.ts); la petición al proxy respondió HTTP 200. No se observó la petición desde un navegador. |
| La API devuelve movimientos simulados. | `generate_mock_movements` y `get_metrics` en [`routes.py`](backend/app/routes.py); la respuesta consultada contenía 360 movimientos. |
| El frontend calcula ingresos, gastos, beneficio, margen y agrupaciones mensuales. | `computeKPIs` y `computeMonthlyData` en [`financial-utils.ts`](frontend/src/lib/financial-utils.ts); verificado por inspección del código. |

## Correcciones

- La etiqueta fija `2024 - Full Year` de [`App.tsx`](frontend/src/App.tsx) no describe necesariamente los datos: la respuesta observada abarcó del 2025-11-01 al 2026-10-28. El backend genera fechas según la fecha actual en [`routes.py`](backend/app/routes.py).

## Pendiente de comprobación

- La apariencia del dashboard, la petición desde el navegador y las URL reenviadas de Codespaces no se comprobaron visualmente.
- No se ejecutaron las pruebas automatizadas. Tampoco se verificaron en ejecución las funciones originales de cálculo del frontend: una importación directa con Node falló con `ERR_MODULE_NOT_FOUND`; un segundo intento con el módulo transformado no produjo un resultado utilizable.
- La agrupación usa fechas ISO y componentes de fecha locales, por lo que un desplazamiento de mes según la zona horaria es un riesgo no comprobado en ejecución: [`financial-utils.ts`](frontend/src/lib/financial-utils.ts).
- El backend emitió una advertencia de `debugpy` sobre posibles puntos de interrupción no detectados; no se comprobó la depuración.

## Comandos y resultados observados

- `docker --version`, `docker compose version` y `docker info --format '{{.ServerVersion}}'`: Docker 29.9.2, Compose v5.6.1 y motor accesible.
- `docker compose up --build`: imágenes construidas y servicios iniciados; `docker compose ps` mostró ambos activos.
- `curl -fsS http://localhost:8000/health`: `{"status":"ok"}`.
- `curl -fsS -o /dev/null -w 'Frontend: HTTP %{http_code}\n' http://localhost:5173/`: HTTP 200.
- `curl -fsS -o /dev/null -w 'API metrics: HTTP %{http_code}\n' http://localhost:8000/api/metrics`: HTTP 200.
- `curl -fsS -o /dev/null -w 'Proxy frontend -> API: HTTP %{http_code}\n' http://localhost:5173/api/metrics`: HTTP 200.
- `curl -fsS -o /dev/null -w 'API docs: HTTP %{http_code}\n' http://localhost:8000/docs`: HTTP 200.
- Una consulta mediante Node al proxy devolvió 360 movimientos. Una suma independiente de esa respuesta dio ingresos de 1.258.146,87, gastos de 762.132,26 y beneficio de 496.014,61; no son valores observados en la interfaz.
