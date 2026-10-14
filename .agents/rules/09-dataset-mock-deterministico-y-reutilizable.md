# Dataset mock deterministico y reutilizable

## Alcance
Generacion y consumo de datos mock en endpoints de metricas.

## Regla
Mantener semilla fija para reproducibilidad en modo demo y evitar regenerar dataset completo por cada endpoint cuando no sea necesario.
Priorizar reutilizacion en memoria o cache de lectura para el mismo ciclo de ejecucion.

## Razon
El determinismo actual es una buena practica, pero la regeneracion repetida agrega costo evitable por request.
Evidencia de Fase 2: backend/app/routes.py.

## Como verificarla
1. Revisar llamadas a generate_mock_movements en backend/app/routes.py.
2. Confirmar uso de seed fija para flujos de demo.
3. Confirmar que endpoints relacionados reutilicen fuente de datos comun en lugar de recomputar siempre.