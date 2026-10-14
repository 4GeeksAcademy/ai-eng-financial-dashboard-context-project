# Testing minimo con casos positivos y negativos

## Alcance
Pruebas de backend y frontend.

## Regla
Todo cambio funcional debe incluir o actualizar pruebas con al menos:
1. un caso esperado (happy path)
2. un caso negativo o de validacion de errores

## Razon
Las pruebas actuales cubren principalmente casos positivos y pueden dejar pasar regresiones de manejo de errores.
Evidencia de Fase 2: backend/tests/test_routes.py y frontend/src/lib/financial-utils.test.ts.

## Como verificarla
1. Revisar diff de tests en backend/tests/ y frontend/src/.
2. Confirmar presencia de assertions para errores, parametros invalidos o entradas limite.
3. Bloquear PRs funcionales que solo agreguen happy path.