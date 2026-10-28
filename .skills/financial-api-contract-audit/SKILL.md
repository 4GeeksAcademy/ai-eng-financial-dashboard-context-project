---
name: financial-api-contract-audit
description: "Audita estáticamente el contrato financiero entre FastAPI y TypeScript. Úsala al revisar cambios o discrepancias en GET /api/metrics, sus filtros, el consumidor React o el proxy de Vite."
user-invocable: true
---

# Auditoría del contrato de API financiera

## Objetivo

Detectar y documentar discrepancias estáticas en el flujo `GET /api/metrics` del dashboard: modelo de respuesta y valores permitidos en FastAPI, tipos TypeScript, filtros, consumidor frontend y proxy de Vite. La auditoría no demuestra el comportamiento en ejecución ni sustituye pruebas.

## Inputs

- Raíz del repositorio.
- `backend/app/routes.py`: ruta, parámetros, tipos `Literal`, modelo Pydantic y funciones de filtrado relacionadas.
- `frontend/src/lib/financial-types.ts`: tipos del movimiento y literales del frontend.
- `frontend/src/App.tsx`: URL y parámetros enviados por `fetchFinancialData`.
- `frontend/vite.config.ts`: prefijo y destino del proxy.
- `backend/tests/test_routes.py` y `frontend/src/lib/financial-utils.test.ts`: cobertura existente relacionada.
- `frontend/package.json`: comandos de prueba declarados, solo si hace falta describir la configuración; no los ejecutes para una auditoría estática.

## Procedimiento

1. Confirma la ruta `GET /api/metrics`, su `response_model` y la función que la implementa en `backend/app/routes.py`. Sigue las definiciones de tipos usadas por la respuesta; no infieras el contrato a partir de nombres de endpoints vecinos.
2. Enumera cada campo de respuesta y compara nombre y tipo entre el modelo Pydantic y el tipo TypeScript. Indica si es obligatorio según ambas declaraciones y registra conversiones explícitas, como `date` a cadena ISO.
3. Compara los miembros exactos de cada `Literal` usado por los campos del movimiento en backend y frontend. Marca diferencias por conjunto, sin asumir que una similitud de nombres equivale a paridad.
4. Enumera todos los parámetros de `GET /api/metrics`, con tipo, valores restringidos si los hay y opcionalidad/default. Comprueba en `App.tsx` si `fetchFinancialData` los envía; no presupongas que tener filtros en backend significa que la pantalla los usa.
5. Sigue la URL construida por el cliente hasta la regla `/api` en `vite.config.ts`. Anota el destino configurado y distingue el proxy de Vite del endpoint FastAPI.
6. Inspecciona únicamente las pruebas existentes indicadas en los inputs. Describe qué contrato o filtro comprueba cada una y si hay una aserción automatizada que compare backend y frontend. No afirmes que una suite pasó ni que un endpoint respondió si no se ejecutó.
7. Devuelve el informe con las secciones de Output esperado y asigna a cada punto uno de estos estados: `coincide`, `discrepancia` o `no verificado`. Incluye rutas y símbolos para cada evidencia. Separa las observaciones estáticas de cualquier dato de ejecución no disponible.

## Output esperado

Un informe breve con:

1. **Alcance:** método y endpoint revisados.
2. **Campos:** tabla con nombre, tipo backend, tipo frontend, obligatoriedad y estado para cada campo.
3. **Valores literales:** miembros backend y frontend comparados para cada tipo relevante y estado.
4. **Filtros:** nombre, tipo, opcionalidad/default, si el consumidor lo envía y estado.
5. **Flujo de URL:** URL construida por el cliente, prefijo y destino del proxy.
6. **Pruebas y límites:** evidencia de pruebas existentes, aspectos no cubiertos y aclaración de que la revisión fue estática.
7. **Veredicto:** paridad estática `completa`, `parcial`, `con discrepancias` o `no verificada`, justificada por los puntos anteriores.

Cada conclusión debe enlazarse a una ruta y un símbolo o declaración identificable. No presentes una cobertura parcial como garantía de paridad total.

## Criterios de aceptación

- Se revisan los cinco campos de `FinancialMovement` en ambos lenguajes y se informa el resultado individualmente.
- Se comparan los conjuntos exactos de `OperationType`, `Category` y `BusinessType`.
- Se identifican los cuatro filtros (`start_date`, `end_date`, `category`, `operation_type`), sus tipos y opcionalidad/default; se indica explícitamente si el consumidor frontend los envía.
- Se traza `/api/metrics` desde `fetchFinancialData` hasta el prefijo y destino del proxy de Vite.
- Se citan las pruebas existentes y se distingue la cobertura de filtros de una comparación automatizada de tipos entre backend y frontend.
- El informe incluye rutas verificables, clasifica cada conclusión y no atribuye resultados de ejecución a una lectura estática.

## Restricciones de seguridad y alcance

- Solo lectura: no edites ni crees archivos durante la auditoría; no instales dependencias, ejecutes pruebas, inicies servicios ni hagas llamadas de red.
- No leas ni expongas valores de secretos, tokens, credenciales o archivos `.env`; el contrato se puede revisar en el código fuente indicado.
- No extrapoles conclusiones a otros endpoints, despliegues o datos de producción. Declara como `no verificado` lo que no pueda determinarse desde los inputs.
