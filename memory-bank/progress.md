# Progress

## Estado actual del proyecto

## Funcionalidad operativa confirmada

- Backend levanta API FastAPI con healthcheck y endpoints de metricas.
- Frontend renderiza dashboard con KPIs y dos graficas.
- Integracion principal frontend-backend funciona sobre GET /api/metrics.
- Pruebas backend pasan (15 tests).
- Pruebas frontend pasan (5 tests).
- Dependencias de backend y frontend ya instaladas en el entorno de desarrollo actual.

## Que funciona bien hoy

- Contratos de respuesta claros en backend mediante response_model.
- Validaciones de query params en endpoints sensibles (por ejemplo limit y threshold).
- Codigo de calculo financiero en frontend desacoplado de la capa de UI.
- UX basica cuidada para estados loading y error.
- Proxy de Vite simplifica desarrollo local con servicios Docker separados.

## Que esta a medio hacer o parcialmente integrado

- La API tiene varios endpoints analiticos listos, pero el frontend solo consume uno.
- No hay filtros interactivos en UI pese a existir endpoint de facetas.
- No hay vista de comparacion de periodos ni alertas, aunque la API ya lo soporta.
- Header muestra un periodo fijo y no dinamico.
- Existe mock-data en frontend que no participa en el flujo principal.

## Deuda tecnica identificada

## Alta prioridad

- Persistencia inexistente: todo el dominio depende de datos mock generados en runtime.
- Precision monetaria: se usan float para importes en backend.
- Seguridad de CORS: configuracion abierta con allow_origins amplio.

## Prioridad media

- Duplicacion de endpoints b2b y b2c con logica similar a filtros existentes.
- Manejo de errores frontend sin logging estructurado.
- Falta de observabilidad (sin metricas, tracing o logging estandarizado).

## Prioridad baja

- Uniformidad de estilo: coexistencia de estilos de comillas/formatos entre modulos.
- Dependencias npm con vulnerabilidades reportadas por auditoria local.

## Riesgos para futuros cambios

- Cambios de contrato en backend pueden romper frontend si no se sincronizan tipos.
- Evolucion a datos reales exigira redisenar capa de acceso a datos y tests de integracion.
- Sin autenticacion, cualquier exposicion publica de API implicaria riesgos de seguridad.

## Proximos hitos recomendados

1. Integrar en UI los endpoints de summary, comparison, alerts y facets.
2. Introducir capa de persistencia y repositorios en backend.
3. Endurecer seguridad de CORS por entorno y configurar variables para origenes permitidos.
4. Migrar montos a Decimal en backend y revisar tests de precision.
5. Consolidar endpoints redundantes y mantener compatibilidad hacia atras.
6. Agregar pipeline de CI con lint, tests y cobertura minima.
