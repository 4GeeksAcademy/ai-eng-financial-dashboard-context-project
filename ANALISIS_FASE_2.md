# Fase 2: analisis del repositorio y reglas propuestas

## Objetivo y alcance

Esta nota registra convenciones observadas, riesgos para futuros cambios y reglas candidatas para evaluar en la Fase 3. Las reglas siguientes son propuestas: no se consideran vigentes hasta que se aprueben, se implementen en `.agents/rules/` y se validen.

Se revisaron el frontend React/TypeScript, el backend FastAPI, Compose, las pruebas y las instrucciones para agentes.

## Hallazgos y reglas propuestas

### Arquitectura y contratos

**Hecho:** el backend declara modelos Pydantic en `backend/app/routes.py`; el frontend define tipos equivalentes en `frontend/src/lib/financial-types.ts`. `frontend/src/App.tsx` consume `/api/metrics`, aunque el backend ofrece otras rutas.

**Regla propuesta:** al cambiar una respuesta de API, actualizar coordinadamente el modelo del backend, el tipo del frontend y las pruebas. Documentar si una ruta es solo una capacidad de API o si está integrada en la interfaz.

**Verificacion sugerida:** pruebas de contrato que comprueben campos y tipos, más una revisión de los consumidores de la ruta afectada.

### Fechas y zonas horarias

**Hecho:** la API entrega `create_date` como fecha sin hora; `frontend/src/lib/financial-utils.ts` la convierte con `new Date(m.create_date)` y obtiene año/mes con getters locales.

**Riesgo:** en zonas horarias al oeste de UTC una fecha ISO sin hora puede interpretarse localmente como el día anterior y cambiar el mes.

**Regla propuesta:** tratar fechas de calendario como fechas, sin conversión implícita a hora local; probar cambios de año/mes en al menos una zona horaria distinta de UTC.

### Fiabilidad y concurrencia

**Hecho:** `docker-compose.yml` usa `depends_on` sin healthcheck. `frontend/src/App.tsx` hace una solicitud inicial y no reintenta si falla. Además, `generate_mock_movements(seed=...)` llama a `random.seed` en `backend/app/routes.py`.

**Regla propuesta:** los consumidores deben tolerar que sus dependencias todavía no estén listas; usar healthchecks/reintentos cuando el arranque dependa de otro servicio. Evitar modificar estado global desde lógica invocada por solicitud.

**Verificacion sugerida:** probar el estado inicial con backend no disponible y llamadas concurrentes al generador.

### Seguridad y configuración

**Hecho:** `backend/app/main.py` configura CORS con `allow_origins=["*"]` y `allow_credentials=True`.

**Regla propuesta:** no usar CORS abierto en despliegues con datos reales o autenticación; configurar explícitamente los orígenes permitidos por entorno.

**Verificacion sugerida:** comprobar que un origen permitido funciona y uno no permitido recibe rechazo.

### Reproducibilidad y despliegue

**Hecho:** `frontend/Dockerfile` ejecuta `npm install` aunque existe `frontend/package-lock.json`; `backend/requirements.txt` no fija versiones. Los Dockerfiles arrancan servidores de desarrollo, con recarga/debug.

**Regla propuesta:** mantener instalaciones reproducibles (usar `npm ci` y fijar/versionar dependencias Python) y separar claramente imágenes/comandos de desarrollo de los de producción.

**Verificacion sugerida:** reconstruir desde cero y comprobar que el build de producción no inicia servidores de desarrollo ni debug.

### Instrucciones para agentes

**Hecho:** `AGENTS.md` exige revisar `.agents/rules`, `.agents/skills` y `memory-bank`, pero esas carpetas no existen en el repositorio revisado.

**Regla propuesta:** en la Fase 3, crear las reglas aprobadas bajo `.agents/rules/` y actualizar `AGENTS.md` para indicar qué ubicaciones son obligatorias y cuáles opcionales. No declarar una regla como activa si solo está descrita en esta nota.

## Convenciones que conviene conservar

- Mantener los cálculos de dominio del frontend en `frontend/src/lib/` y los componentes visuales en `frontend/src/components/`.
- Acompañar cambios de cálculos con pruebas Vitest en `frontend/src/lib/`; probar rutas y validaciones del backend en `backend/tests/`.
- Mantener sincronizados los modelos Pydantic y los tipos TypeScript que representan el mismo contrato.

## Estado de hallazgos anteriores

**Resuelto:** el encabezado ya no muestra el período fijo de 2024. `frontend/src/App.tsx` calcula el período con los meses recibidos; `frontend/src/lib/financial-utils.ts` contiene `formatPeriodRange` y sus pruebas están en `frontend/src/lib/financial-utils.test.ts`.

**No es un error por sí solo:** existen rutas de API que el dashboard todavía no consume. Integrarlas depende del alcance funcional, no de una regla de consistencia.

## Evidencia de verificacion

Según `verification.md` y los comandos ejecutados para este cambio:

- Frontend: 7 pruebas aprobadas; build y TypeScript aprobados.
- Backend: 15 pruebas aprobadas.
- Persisten avisos no bloqueantes de tamaño de bundle (Vite) y obsolescencia de integración `httpx`/Starlette.

## Pendiente para Fase 3

1. Revisar y priorizar las reglas propuestas con el equipo.
2. Convertir solo las aprobadas en archivos concretos de `.agents/rules/`.
3. Aplicar cada regla a una tarea o prueba y ajustar su redacción según el resultado.