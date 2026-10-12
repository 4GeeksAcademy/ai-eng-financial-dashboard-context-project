# Instrucciones para agentes

Antes de analizar, modificar archivos o generar contenido, revisa las instrucciones y el contexto local disponibles:

- Reglas del proyecto en `./.agents/rules`, si existe.
- Skills del proyecto en `./.agents/skills`, si existe.
- Memoria del proyecto en `./memory-bank`, si existe.

En `memory-bank/`, consulta la nota pertinente antes de trabajar: `product.md` resume el producto y sus límites; `techContext.md` describe stack, estructura y comunicación; `progress.md` registra el estado comprobado y los próximos pasos.

Revisa los archivos actuales antes de editarlos. No supongas que una ruta opcional existe ni la crees salvo que la tarea lo pida.

- Antes de analizar o modificar archivos de `frontend/`, lee `./.agents/rules/frontend.md`.
- Antes de analizar o modificar archivos de `backend/`, lee `./.agents/rules/backend.md`.
- Si una tarea afecta frontend y backend, lee ambas reglas antes de empezar.

## Proyecto

Panel de métricas financieras con frontend React + TypeScript y backend FastAPI. Actualmente el backend genera movimientos simulados; no hay una base de datos declarada en la configuración revisada.

## Stack y estructuras

- `frontend/`: React, TypeScript y Vite. La pantalla principal está en `src/App.tsx`; tipos, cálculos y pruebas de utilidades están en `src/lib/`; componentes de dashboard en `src/components/dashboard/`.
- `backend/`: FastAPI, Pydantic y Uvicorn. La aplicación está en `app/main.py`, las rutas y lógica financiera en `app/routes.py`, y las pruebas en `tests/`.
- `docker-compose.yml` declara los servicios `frontend` y `backend`; publica los puertos 5173, 8000 y 5678.
- La estructura propuesta para reglas y skills del agente está documentada en `README.es.md`.

## Comandos

Desde la raíz, el README documenta el arranque conjunto:

```bash
docker compose up --build
```

En `frontend/`, usa los scripts declarados en `package.json`: `npm run dev`, `npm test`, `npm run build` y `npm run lint`. `npm run test:watch` y `npm run test:coverage` también están disponibles.

En `backend/`, `pytest` ejecuta las pruebas declaradas en `tests/`; las dependencias de test están en `requirements.txt`.

## Convenciones

- Mantén alineados los campos y valores del contrato entre los modelos Pydantic de `backend/app/routes.py` y los tipos de `frontend/src/lib/financial-types.ts`.
- Conserva la separación existente: carga y estados de pantalla en `App.tsx`, cálculos puros en `financial-utils.ts` y presentación en componentes de dashboard.
- Reutiliza los helpers de filtrado, orden y agregación del backend en vez de duplicar esas reglas por endpoint.
- Las vistas con datos deben representar estados de carga, error y ausencia de datos.

## Reglas de dominio

- Un movimiento tiene fecha, importe, tipo de operación (`income` o `outcome`), categoría y tipo de negocio (`B2B` o `B2C`). Conserva las uniones y categorías definidas en los modelos de backend y tipos de frontend.
- El frontend calcula beneficio como ingresos menos gastos; el margen es beneficio dividido por ingresos, expresado como porcentaje, y es cero cuando no hay ingresos. No cambies estas fórmulas sin un requisito de producto explícito y pruebas actualizadas.
- El generador usa una semilla aleatoria, pero asigna años con `date.today()`. Si se requiere reproducibilidad entre fechas distintas, controla también la fecha de referencia.
- El encabezado del período y el rango real de datos deben permanecer coherentes; el encabezado actual está fijado en 2024 mientras el generador usa fechas relativas a la fecha actual.

## Forma de trabajar

- Antes de cambiar un contrato API, identifica sus consumidores y actualiza backend, frontend y pruebas en conjunto.
- Para cambios de cálculo, añade o actualiza pruebas enfocadas en `financial-utils.test.ts` o `backend/tests/test_routes.py`, según corresponda.
- Confirma la intención funcional antes de conectar o eliminar rutas analíticas: la pantalla principal consume `/api/metrics`, mientras el backend declara otras rutas.
- Mantén los cambios acotados y no presentes recomendaciones de `engineering-findings.md` como reglas ya formalizadas sin verificarlas.
- Después de cada nueva implementación, actualiza la nota pertinente de `memory-bank/` (`product.md` para cambios funcionales del producto, `techContext.md` para cambios técnicos o de arquitectura, `progress.md` para el estado y las verificaciones). Registra solo hechos respaldados por el código o por verificaciones ejecutadas; no marques pruebas como exitosas si no se ejecutaron.

## Límites

- Los movimientos actuales son simulados; no trates la API como conectada a datos financieros persistentes o reales.
- `depends_on` en Compose establece orden de inicio, no disponibilidad del backend.
- El proxy de Vite usa actualmente `172.18.0.1:8000` según `frontend/vite.config.ts`. No lo sustituyas por otra dirección sin probar la conexión desde el entorno frontend previsto; el comentario del archivo documenta que fue cambiado por un problema de conectividad.
- No afirmes que pruebas, builds o conectividad fueron verificados si no ejecutaste la comprobación correspondiente.

## Verificaciones

- Frontend: ejecuta `npm test`, `npm run build` y `npm run lint` desde `frontend/` para cambios que afecten sus cálculos, componentes o tipos.
- Backend: ejecuta `pytest` desde `backend/` para cambios en lógica o rutas.
- Integración: inicia con `docker compose up --build`, comprueba la interfaz en `http://localhost:5173`, la salud de la API en `http://localhost:8000/health` y la documentación en `http://localhost:8000/docs`.
- Al cambiar el proxy o el arranque, valida también una solicitud del frontend a `/api/metrics`; no infieras conectividad solo por la configuración.
