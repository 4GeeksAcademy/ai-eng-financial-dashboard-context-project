# Contrato de movimientos financieros

## Propósito
Mantener coherente la forma JSON de `/api/metrics` entre FastAPI y el cliente TypeScript.

## Alcance
Aplicar al modelo y endpoint en `backend/app/routes.py`, al tipo `FinancialMovement` en `frontend/src/lib/financial-types.ts` y a las pruebas del endpoint en `backend/tests`.

## Evidencia y hallazgo
El backend define `FinancialMovement` con Pydantic y `Literal`; el frontend mantiene una interfaz paralela con los mismos campos API. El riesgo de divergencia está documentado como ENG-ARCH-01, y la ausencia de verificación de pantalla/contrato como ENG-TEST-01 en `engineering-findings.md`.

## Instrucciones
- Al cambiar un campo, tipo o valor permitido del payload, actualizar el modelo backend y la interfaz TypeScript en el mismo cambio.
- Mantener los nombres JSON API en `snake_case`; no renombrar campos derivados de UI como si fueran campos del API.
- Mantener una prueba de endpoint que compruebe los nombres y tipos básicos del movimiento serializado.

## Validación
La respuesta de `/api/metrics` debe incluir `create_date`, `amount`, `operation_type`, `category` y `business_type`, con tipos JSON compatibles con el modelo declarado.