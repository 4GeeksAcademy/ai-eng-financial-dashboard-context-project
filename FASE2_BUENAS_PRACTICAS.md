# Fase 2: Buenas Practicas de Ingenieria

Este documento registra buenas practicas verificadas en el repositorio, agrupadas por categoria.

## Arquitectura

### Hallazgo BP-ARQ-01: Contratos de API tipados con modelos explicitos
- Descripcion: El backend define modelos Pydantic para entidades y respuestas de endpoints.
- Evidencia: backend/app/routes.py (FinancialMovement, MetricsFacets, MetricsSummaryItem, TopCategoryItem, MetricsComparison, MetricsAlert) y uso de response_model en rutas.
- Impacto: Mejora consistencia de datos y validacion de entrada/salida.
- Riesgo: Bajo.
- Recomendacion: Mantener este enfoque y extenderlo a cualquier endpoint nuevo.

## Organizacion

### Hallazgo BP-ORG-01: Separacion clara entre frontend y backend
- Descripcion: La estructura separa codigo de cliente y servidor en carpetas dedicadas con sus propios Dockerfiles y configuraciones.
- Evidencia: frontend/, backend/, frontend/Dockerfile, backend/Dockerfile, docker-compose.yml.
- Impacto: Facilita navegacion, ownership y despliegue por componente.
- Riesgo: Bajo.
- Recomendacion: Preservar esta separacion y evitar mezclar concerns entre capas.

## Responsabilidades

### Hallazgo BP-RESP-01: Utilidades puras para metricas en frontend
- Descripcion: Los calculos de KPI y agregacion mensual estan encapsulados en funciones puras reutilizables.
- Evidencia: frontend/src/lib/financial-utils.ts (computeKPIs, computeMonthlyData, formatCurrency, formatPercent).
- Impacto: Mejora testabilidad y reduce complejidad en componentes de UI.
- Riesgo: Bajo.
- Recomendacion: Mantener logica de negocio de frontend fuera de componentes presentacionales.

## Naming

### Hallazgo BP-NAM-01: Nombres de funciones y tipos semanticos
- Descripcion: Los nombres reflejan intencion de negocio y comportamiento tecnico.
- Evidencia: backend/app/routes.py (filter_movements, build_top_categories, detect_outcome_alerts), frontend/src/lib/financial-types.ts (FinancialMovement, KPIMetrics, MonthlyDataPoint).
- Impacto: Reduce ambiguedad y acelera onboarding.
- Riesgo: Bajo.
- Recomendacion: Conservar convenciones semanticas y evitar abreviaturas opacas.

## Testing

### Hallazgo BP-TEST-01: Cobertura de endpoints y utilidades criticas
- Descripcion: Existen pruebas backend para endpoints y pruebas frontend para funciones de calculo.
- Evidencia: backend/tests/test_routes.py, frontend/src/lib/financial-utils.test.ts.
- Impacto: Detecta regresiones funcionales en rutas y en calculos de KPI/series.
- Riesgo: Medio-bajo.
- Recomendacion: Mantener estas suites como umbral minimo para cambios.

## Documentacion

### Hallazgo BP-DOC-01: Documentacion operativa de arranque local
- Descripcion: El repositorio documenta ejecucion local y puertos de servicios.
- Evidencia: README.md y README.es.md (docker compose up --build, URLs de frontend/backend/docs).
- Impacto: Mejora transferibilidad y reduce friccion de setup.
- Riesgo: Bajo.
- Recomendacion: Actualizar README al cambiar puertos, rutas o variables.

## Mantenibilidad

### Hallazgo BP-MAIN-01: Configuracion de TypeScript orientada a calidad
- Descripcion: TypeScript activa reglas que previenen codigo muerto y errores comunes.
- Evidencia: frontend/tsconfig.app.json y frontend/tsconfig.node.json (noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch).
- Impacto: Disminuye deuda tecnica accidental.
- Riesgo: Bajo.
- Recomendacion: Evitar relajar estas flags sin justificacion tecnica.

## DX

### Hallazgo BP-DX-01: Alias de imports para reducir paths fragiles
- Descripcion: Se usa alias @ para imports de src.
- Evidencia: frontend/vite.config.ts (resolve.alias), frontend/tsconfig.app.json (paths).
- Impacto: Mejora legibilidad y reduce errores por rutas relativas largas.
- Riesgo: Bajo.
- Recomendacion: Estandarizar el uso de alias en nuevos modulos.

## Seguridad

### Hallazgo BP-SEC-01: Politica de gitignore para secretos y artefactos
- Descripcion: Se excluyen archivos de entorno y artefactos de build/cache del control de versiones.
- Evidencia: .gitignore (.env, .env.*, caches de frontend/backend, coverage, venv).
- Impacto: Reduce exposicion accidental de secretos y ruido en commits.
- Riesgo: Medio-bajo.
- Recomendacion: Mantener .env.example actualizado y nunca versionar secretos reales.

## Performance

### Hallazgo BP-PERF-01: Uso de seed fija para dataset deterministico
- Descripcion: El backend genera datos mock de forma reproducible con semilla fija.
- Evidencia: backend/app/routes.py (generate_mock_movements(seed=42) invocado en endpoints).
- Impacto: Facilita diagnostico y comparabilidad en pruebas manuales.
- Riesgo: Bajo en entorno educativo/demo.
- Recomendacion: Mantener determinismo en entorno de aprendizaje; para produccion, separar modo demo de modo real.
