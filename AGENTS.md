# Agent Guidance

Agents working on this project **must**:

- Look for **work instructions and rules** in the directory:  
  `./.agents/rules`

- Look for available **agent skills** in the directory:  
  `./.agents/skills`

- Look for the **project memory bank** in:  
  `./memory-bank`  
  _(if the directory exists)_

Before taking action (analyzing code, modifying files, or generating outputs), always review the latest files in these locations to ensure compliance with project conventions, context, and operational constraints.

- Antes de analizar o modificar el frontend, lee `./.agents/rules/frontend.md`.
- Antes de analizar o modificar el backend, lee `./.agents/rules/backend.md`.
- Si el trabajo afecta frontend y backend, lee ambas reglas antes de empezar.

## Proyecto

Dashboard de métricas financieras con frontend React + TypeScript y backend FastAPI. Docker Compose define el entorno local conjunto.

## Stack tecnológico y estructura

- `frontend/src/components/dashboard`: componentes del dashboard y gráficos.
- `frontend/src/lib`: tipos financieros, utilidades, pruebas de utilidades y datos mock.
- `backend/app`: aplicación FastAPI y rutas/modelos de la API.
- `backend/tests`: pruebas del backend.
- `docker-compose.yml`: servicios frontend y backend.

## Comandos

- Iniciar los servicios: `docker compose up --build`.
- Desde `frontend`: `npm run dev`, `npm run build`, `npm run lint`, `npm test` y `npm run test:coverage` (scripts definidos en `frontend/package.json`).
- Las pruebas backend están en `backend/tests/test_routes.py`; `pytest` está incluido en `backend/requirements.txt`.
- Las URLs documentadas son `http://localhost:5173` para el frontend, `http://localhost:8000` para el backend y `http://localhost:8000/docs` para la documentación API.

## Convenciones

- Mantener alineados los modelos Pydantic de la API y los tipos TypeScript del frontend.
- Mantener los cálculos financieros y formateadores en utilidades puras, fuera de los componentes de presentación, y probarlos.
- Reutilizar en las rutas los helpers compartidos de filtrado y ordenamiento de movimientos.
- En el frontend, representar explícitamente los estados de carga y error de las solicitudes API.

## Reglas de dominio

- Los tipos de operación son `income` y `outcome`; los tipos de negocio son `B2B` y `B2C`.
- Las categorías son `suppliers`, `sales`, `operational`, `administrative` y `others`.
- Las agrupaciones de resumen disponibles en backend son `day`, `week` y `month`.
- Tratar `create_date` como fecha de calendario al agregar movimientos; las conversiones dependientes de la zona horaria pueden cambiar el mes de una fecha sin hora.
- Mantener el período presentado por el dashboard consistente con las fechas de los datos.

## Formas de trabajar

- Si cambia el contrato de la API, actualizar el esquema backend y los tipos frontend en el mismo cambio.
- Si cambian los cálculos o agregaciones, ampliar las pruebas correspondientes, incluidos los límites de mes y año para fechas.
- Al añadir filtros o rutas, reutilizar los helpers existentes en lugar de duplicar comportamiento.
- Mantener README y ejemplos de configuración sincronizados con los archivos existentes.
- Después de cada nueva implementación, revisar y actualizar el documento pertinente de `memory-bank/` para reflejar el estado vigente. Actualizar `progress.md` con cambios, limitaciones y verificaciones ejecutadas; actualizar `product.md` o `stack.md` cuando cambien el comportamiento del producto o la arquitectura. No afirmar que se ejecutó una verificación si no se hizo.

## Límites

- Hallazgo conocido: `frontend/src/App.tsx` muestra el período fijo `2024 - Full Year`, mientras backend genera datos relativos a la fecha actual. No asumir que este comportamiento es correcto o que ya está corregido.
- Hallazgo conocido: `frontend/src/lib/financial-utils.ts` parsea fechas sin hora y usa getters locales; cubrir la zona horaria antes de ampliar la lógica de agrupación.
- No usar `random.seed()` para reinicializar el generador global desde la generación de datos; `backend/app/routes.py` actualmente lo hace y puede afectar otros usos de `random`.
- `frontend/src/lib/mock-data.ts` contiene datos estáticos, pero el flujo actual del dashboard consulta `/api/metrics`; no asumir que ese fixture alimenta la pantalla.
- Los README mencionan `frontend/.env.example`, pero el archivo no está presente. No indicarlo como archivo disponible sin añadirlo.
- `.agents/rules` contiene reglas de frontend y backend. Al momento de esta revisión no existen `.agents/skills` ni `memory-bank` en el workspace.

## Verificación

- Ejecutar desde `frontend` los scripts definidos: `npm run lint`, `npm test` y `npm run build`.
- Ejecutar `pytest` desde `backend` para las pruebas ubicadas en `backend/tests`.
- Para verificar el entorno integrado, usar `docker compose up --build` y consultar las URLs documentadas en la sección de comandos.
- No afirmar que una verificación pasó si no se ejecutó en el cambio actual.
