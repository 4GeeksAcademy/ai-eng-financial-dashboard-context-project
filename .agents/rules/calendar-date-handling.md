# Fechas calendario del API

## Propósito
Evitar que una fecha de movimiento sin hora cambie de día o de mes por la zona horaria del navegador.

## Alcance
Aplicar al manejo de `FinancialMovement.create_date` y a las funciones que agrupan o presentan esos movimientos en `frontend/src`.

## Evidencia y hallazgo
El backend declara `create_date` como `date` en `backend/app/routes.py`; el cliente lo convierte con `new Date(m.create_date)` y luego usa getters locales en `frontend/src/lib/financial-utils.ts`. El caso de zona horaria está registrado como ENG-DATA-01 en `engineering-findings.md`.

## Instrucciones
- Tratar el valor API `YYYY-MM-DD` como fecha calendario, no como instante local.
- No calcular año o mes de una fecha API date-only con getters locales después de `new Date(string)`.
- Añadir una prueba con una fecha del primer día de mes y comprobarla bajo una zona horaria UTC negativa.

## Validación
La agregación de `2025-03-01` debe seguir perteneciendo a marzo cuando la suite se ejecuta con `TZ=America/Los_Angeles`.