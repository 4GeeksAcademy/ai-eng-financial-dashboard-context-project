# Fase 2: Malas Practicas o Riesgos de Ingenieria

Este documento registra riesgos y malas practicas verificadas, agrupadas por categoria.

## Arquitectura

### Hallazgo R-ARQ-01: Acoplamiento alto entre capa HTTP y logica de dominio
- Descripcion: Un solo modulo concentra modelos, generacion de datos, filtros, agregaciones y definicion de rutas.
- Evidencia: backend/app/routes.py.
- Impacto: Aumenta complejidad ciclomatica y dificulta escalado de cambios.
- Riesgo: Medio.
- Recomendacion: Extraer logica de dominio a modulos de servicios/utilidades sin alterar comportamiento.

## Organizacion

### Hallazgo R-ORG-01: Inconsistencia entre guia de agentes y estructura real
- Descripcion: Se documenta una estructura esperada de .agents/rules y .agents/skills que no esta presente en el repositorio inspeccionado.
- Evidencia: AGENTS.md, README.md, README.es.md; ausencia de carpeta .agents en la raiz durante inspeccion de archivos.
- Impacto: Debilita gobernanza y estandarizacion del trabajo asistido por agentes.
- Riesgo: Medio.
- Recomendacion: Crear y versionar estructura minima de .agents o ajustar la documentacion para reflejar el estado real.

## Responsabilidades

### Hallazgo R-RESP-01: Duplicacion de logica de filtrado por tipo de negocio
- Descripcion: Los endpoints B2B/B2C repiten patron de generacion + filtro + orden, en lugar de reutilizar un flujo unico parametrizado.
- Evidencia: backend/app/routes.py (get_b2b_metrics, get_b2c_metrics).
- Impacto: Mayor costo de mantenimiento y probabilidad de divergencias.
- Riesgo: Medio.
- Recomendacion: Centralizar la variacion por business_type en funcion reutilizable.

## Naming

### Hallazgo R-NAM-01: Metadatos de frontend con naming generico
- Descripcion: El titulo HTML es generico (frontend) y no representa el dominio del producto.
- Evidencia: frontend/index.html (<title>frontend</title>).
- Impacto: Menor claridad en navegacion, bookmarking y contexto del producto.
- Riesgo: Bajo.
- Recomendacion: Usar nombre funcional consistente con el dashboard financiero.

## Testing

### Hallazgo R-TEST-01: Cobertura limitada a casos felices y utilidades puntuales
- Descripcion: No se observan pruebas de escenarios de error, validaciones negativas o pruebas end-to-end FE-BE.
- Evidencia: backend/tests/test_routes.py y frontend/src/lib/financial-utils.test.ts (predominio de casos positivos).
- Impacto: Regresiones en manejo de errores pueden pasar inadvertidas.
- Riesgo: Medio.
- Recomendacion: Agregar pruebas negativas (parametros invalidos, rangos inconsistentes, respuestas vacias) y una prueba de integracion basica.

## Documentacion

### Hallazgo R-DOC-01: Mezcla de idioma en README en espanol
- Descripcion: La version en espanol contiene una linea en ingles en la cabecera.
- Evidencia: README.es.md (_These instructions are available in English_).
- Impacto: Inconsistencia editorial y menor calidad percibida.
- Riesgo: Bajo.
- Recomendacion: Unificar idioma de README.es.md en espanol.

## Mantenibilidad

### Hallazgo R-MAIN-01: Dependencias de backend sin version pinneada
- Descripcion: El archivo de requirements no fija versiones concretas.
- Evidencia: backend/requirements.txt.
- Impacto: Builds no deterministicas y riesgo de cambios incompatibles en el tiempo.
- Riesgo: Medio.
- Recomendacion: Pinnear versiones y establecer proceso de actualizacion controlado.

## DX

### Hallazgo R-DX-01: Falta de mecanismo unico para ejecutar test/lint en backend
- Descripcion: No hay script estandarizado equivalente a npm scripts para backend.
- Evidencia: backend/requirements.txt y ausencia de archivo de tareas/scripts en backend.
- Impacto: Friccion para contribucion y variabilidad en comandos entre colaboradores.
- Riesgo: Medio-bajo.
- Recomendacion: Definir comandos estandar (Makefile o documentacion operativa precisa).

## Seguridad

### Hallazgo R-SEC-01: CORS abierto a cualquier origen con credenciales habilitadas
- Descripcion: La API permite allow_origins=["*"] junto con allow_credentials=True.
- Evidencia: backend/app/main.py.
- Impacto: Superficie de ataque ampliada si se usa fuera de entorno controlado.
- Riesgo: Alto (si llega a entornos no aislados).
- Recomendacion: Restringir origenes por entorno y desactivar credenciales cuando no sean necesarias.

### Hallazgo R-SEC-02: Puerto de debug remoto expuesto
- Descripcion: Se expone y escucha debugpy en 0.0.0.0:5678.
- Evidencia: backend/Dockerfile (debugpy --listen 0.0.0.0:5678) y docker-compose.yml (mapeo 5678:5678).
- Impacto: Riesgo de acceso no autorizado al depurador en entornos mal configurados.
- Riesgo: Alto.
- Recomendacion: Condicionar debugpy solo a perfil de desarrollo local y no exponer puerto en configuraciones compartidas.

## Performance

### Hallazgo R-PERF-01: Regeneracion completa del dataset en cada endpoint
- Descripcion: Cada request reconstruye movimientos mock de 12 meses antes de filtrar/agregar.
- Evidencia: backend/app/routes.py (llamadas repetidas a generate_mock_movements(seed=42) por endpoint).
- Impacto: Sobrecosto computacional evitable y latencia acumulada bajo carga.
- Riesgo: Medio.
- Recomendacion: Reutilizar dataset en memoria para modo demo o introducir capa de cache en lectura.
