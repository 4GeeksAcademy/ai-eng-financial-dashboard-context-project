# Reglas propuestas para contribuir

Estado: propuestas para revisión del equipo; no se consideran convenciones aprobadas todavía.

## Datos y contratos

1. Mantén una fuente de datos coherente para el dashboard. Si cambias la fuente, actualiza o elimina los fixtures que puedan confundirse con ella y conserva alineados los tipos TypeScript y los modelos de API.
   - Evidencia: `frontend/src/App.tsx` consume `GET /api/metrics`; `frontend/src/lib/mock-data.ts` contiene otra serie fija de 2024 que no usa la app; el contrato está representado en `frontend/src/lib/financial-types.ts` y `backend/app/routes.py`.

2. No dupliques cálculos financieros sin definir cuál es la fuente autoritativa. Si el mismo indicador se calcula en frontend y backend, añade una prueba que compruebe que ambos resultados coinciden.
   - Evidencia: `frontend/src/lib/financial-utils.ts` calcula KPI y agregados mensuales; `backend/app/routes.py` implementa resumen, neto y métricas comparativas.

3. Deriva el período mostrado de los datos o mantén fijo el período de la fuente. No presentes un rango fijo si la fuente usa fechas dinámicas.
   - Evidencia: `frontend/src/components/dashboard/dashboard-header.tsx` muestra `2024 - Full Year`; `backend/app/routes.py` construye fechas a partir de `date.today()`.

4. Trata `create_date` como una fecha de calendario, no como una hora local. Cubre con pruebas las fechas del primer día del mes y las zonas horarias relevantes antes de cambiar su parseo o agrupación.
   - Evidencia: `frontend/src/lib/financial-utils.ts` convierte el valor ISO con `new Date(...)` y luego usa `getFullYear()`/`getMonth()`; `frontend/src/lib/financial-utils.test.ts` no prueba una fecha del día 1 bajo distintas zonas horarias.

## Pruebas y ejecución

5. Acompaña cambios de comportamiento con pruebas en la suite propietaria: API y filtros en `backend/tests/test_routes.py`; agregaciones del frontend en `frontend/src/lib/financial-utils.test.ts`.
   - Evidencia: esas suites prueban las rutas y utilidades actuales, respectivamente.

6. No dependas solo del orden de inicio de Compose para asegurar que la API está lista. Si el cliente hace una solicitud al arrancar, define cómo recuperarse de una API aún no disponible y prueba ese comportamiento.
   - Evidencia: `docker-compose.yml` declara `depends_on` sin healthcheck; `frontend/src/App.tsx` hace una solicitud inicial sin reintento.

## Seguridad y determinismo

7. Limita CORS a los orígenes requeridos por el entorno; no uses el permiso global en despliegues.
   - Evidencia: `backend/app/main.py` configura `allow_origins=["*"]` y `allow_credentials=True`.

8. Aísla la aleatoriedad de cada generación de datos; evita cambiar el estado aleatorio global del proceso.
   - Evidencia: `backend/app/routes.py` llama `random.seed(seed)` dentro de `generate_mock_movements`.
