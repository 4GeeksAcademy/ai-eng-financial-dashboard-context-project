# Contratos de API tipados y explicitos

## Alcance
Backend FastAPI en rutas y modelos de respuesta.

## Regla
Cada endpoint nuevo o modificado debe declarar response_model y usar modelos Pydantic explicitos para request y response.

## Razon
En el repositorio actual, los contratos tipados ya mejoran consistencia y validacion de datos en tiempo de ejecucion.
Evidencia de Fase 2: backend/app/routes.py.

## Como verificarla
1. Revisar backend/app/routes.py u otros modulos de rutas.
2. Confirmar que cada decorador de ruta use response_model cuando corresponda.
3. Confirmar que no se retornen dicts anonimos cuando existe un contrato de dominio.