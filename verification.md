# Verificación del proyecto

Esta guía contrasta el resumen del proyecto con el código y el estado observado en esta sesión.

## Significado de los símbolos

- **✓ Confirmado:** aparece en el código o la configuración, o el comando indicado terminó correctamente.
- **✗ No coincide:** el código no implementa lo esperado o existe una discrepancia comprobada.
- **? Pendiente:** no se pudo comprobar en ejecución.

## Qué hace

- **✓** El frontend React/TypeScript solicita `GET /api/metrics`, calcula ingresos, gastos, beneficio y margen, y construye los datos mensuales de sus gráficos.
- **✓** FastAPI define `GET /health` y `GET /api/metrics`. La segunda ruta genera 360 movimientos financieros ficticios con semilla fija (`42`) y acepta filtros de fecha, categoría y tipo de operación.
- **✗** El título del dashboard está fijado a `2024 - Full Year`, pero los movimientos se generan en relación con la fecha actual. A fecha de esta verificación (octubre de 2026), el generador asigna movimientos a 2025 y 2026, no a 2024.
- **✓** El backend también define rutas B2B/B2C, facets, resumen, categorías principales, comparación y alertas; sus contratos están cubiertos por los tests de `backend/tests/test_routes.py`.

## Cómo se ejecuta y conecta

- **✓** `docker compose config --services` devuelve `backend` y `frontend`.
- **✓** Compose publica el frontend en `5173` y la API en `8000`; el contenedor frontend depende del backend.
- **✓** El frontend llama a `/api/metrics` y Vite reenvía `/api` a `http://backend:8000` dentro de la red de Compose. Desde el navegador se entra por `http://localhost:5173`; la API también queda accesible en `http://localhost:8000`.
- **✓** El README indica que se inicia el proyecto con:

	```bash
	docker compose up --build
	```

- **✓** La documentación interactiva de FastAPI está prevista en `http://localhost:8000/docs`.
- **✗** Compose no declara un `healthcheck`; que un contenedor figure como activo no asegura que la API ya responda.

## Estado comprobado en esta sesión

- **✓** `docker compose config --services` terminó correctamente y listó los dos servicios.
- **✗** `docker compose ps` no mostró contenedores activos; ahora mismo no hay servicios levantados.
- **?** No se verificaron respuestas HTTP de `/health` ni `/api/metrics`: al no haber backend activo, no se confirmó su respuesta en ejecución.
- **?** `pytest -q backend/tests/test_routes.py` no pudo recolectar los tests: el entorno no tiene instalado `fastapi` (`ModuleNotFoundError`). Por eso no se puede afirmar que los tests pasen.

## Cómo repetir la comprobación

Arranca los servicios y consulta sus respuestas:

```bash
docker compose up --build
```

En otra terminal:

```bash
curl -i http://localhost:8000/health
curl -i http://localhost:8000/api/metrics
```

Se espera HTTP `200` en ambos casos; `/health` debe devolver `{"status":"ok"}` y `/api/metrics` una lista JSON. Para revisar el estado de los contenedores, usa `docker compose ps`.