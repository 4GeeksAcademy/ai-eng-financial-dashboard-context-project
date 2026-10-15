# Reglas de ingeniería

Reglas basadas en los archivos revisados. La revisión fue estática; no se ejecutaron pruebas.

> `README.es.md` describe reglas en `.agents/rules/<nombre>.md`. Por solicitud, este documento concentra las reglas en `.agents/rules.md` y no crea carpetas.

## Backend

### 1. Contratos y validación

**Nombre:** Validar el contrato de la API  
**Alcance:** Modelos de respuesta y parámetros de FastAPI.  
**Justificación:** El código define explícitamente las formas de respuesta y los valores permitidos.  
**Guía específica del proyecto:** Usa los modelos Pydantic y tipos `Literal` existentes en `backend/app/routes.py`; limita parámetros con `Query`, como `limit` entre 1 y 20 en `/api/metrics/categories/top`.

## Frontend

### 2. Lógica de negocio

**Nombre:** Separar cálculos de presentación  
**Alcance:** Agregaciones, formatos y componentes del dashboard.  
**Justificación:** El proyecto ya separa los cálculos financieros de la interfaz y los prueba de forma aislada.  
**Guía específica del proyecto:** Mantén funciones como `computeKPIs` y `computeMonthlyData` en `frontend/src/lib/financial-utils.ts`; sus pruebas están en `frontend/src/lib/financial-utils.test.ts`.

## Integración

### 3. Contrato compartido

**Nombre:** Sincronizar los tipos frontend-backend  
**Alcance:** Campos y valores del contrato de movimientos.  
**Justificación:** El contrato está declarado tanto en modelos Pydantic como en tipos TypeScript.  
**Guía específica del proyecto:** Al cambiar un campo o literal, actualiza `backend/app/routes.py` y `frontend/src/lib/financial-types.ts`; por ejemplo, ambos lados usan `income | outcome` para el tipo de operación.