---
name: origen
description: Convenciones, contrato de datos y flujo de trabajo específico del dashboard financiero React/FastAPI de este repositorio.
applyTo:
  - "frontend/src/**"
  - "backend/app/**"
  - "backend/tests/**"
  - "frontend/src/**/*.test.*"
  - "docker-compose.yml"
  - "frontend/vite.config.ts"
---

# Skill `origen`

## Objetivo

Implementar, revisar o documentar cambios en este dashboard financiero sin romper su arquitectura, contrato de API, modelo de datos, experiencia visual ni flujo de validación.

Esta skill complementa las skills generales de accesibilidad, SEO y buenas prácticas de React. Su propósito es aportar el conocimiento específico y verificable de este repositorio.

## Cuándo usar esta skill

Usa esta skill cuando la tarea afecte a uno o más de estos ámbitos:

- Frontend React, TypeScript, Tailwind o Recharts.
- Backend FastAPI, Pydantic o endpoints de métricas.
- Tipos financieros o transformación de movimientos.
- KPIs, agregaciones, filtros, comparativas o alertas.
- Diseño visual del dashboard.
- Tests, lint, TypeScript o build.
- Docker Compose, proxy de Vite o configuración local.
- Documentación de arquitectura, reglas o decisiones del proyecto.

Para cambios puramente genéricos, sigue además las skills comunitarias aplicables.

## Inputs requeridos

Antes de modificar código, identifica y documenta, según corresponda:

1. **Tipo de cambio**: código, contrato API, datos, visual, infraestructura o documentación.
2. **Archivos afectados** y sus dependencias directas.
3. **Comportamiento actual** y comportamiento esperado.
4. **Restricciones del repositorio** que aplican.
5. **Criterios de aceptación** comprobables.
6. **Comandos de validación** que deben ejecutarse.

Si falta información funcional, no inventes un contrato nuevo: conserva el comportamiento existente y pide aclaración cuando la decisión pueda afectar a datos, API o UX.

## Contexto del repositorio

### Arquitectura

- `backend/` es una aplicación FastAPI.
- `frontend/` es una aplicación React 19 + TypeScript + Vite.
- El backend no usa base de datos: genera datos mock en cada petición.
- El frontend solicita datos con `fetch("/api/metrics")`.
- Vite hace proxy de `/api` hacia `VITE_API_PROXY_TARGET`.
- En Docker Compose, el frontend usa el puerto `5173` y el backend el `8000`.
- `docker compose up --build` inicia ambos servicios.

Flujo de datos:

```text
FastAPI
  -> generate_mock_movements(seed=42)
  -> FinancialMovement[]
  -> fetch("/api/metrics")
  -> computeKPIs() / computeMonthlyData()
  -> KPIs y gráficos del dashboard
```

### Datos financieros

- `generate_mock_movements(seed=42)` produce exactamente 360 movimientos: 12 meses por 30 movimientos.
- Los movimientos se ordenan cronológicamente por `create_date`.
- `operation_type` solo puede ser `income` u `outcome`.
- `category` puede ser `suppliers`, `sales`, `operational`, `administrative` u `others`.
- `business_type` puede ser `B2B` o `B2C`.
- Los ingresos suelen pertenecer a `sales` u `others`.
- Los gastos usan las categorías de `OUTCOME_CATEGORIES`.
- Las fechas se generan relativamente a `date.today()`; no asumas años fijos.
- El seed `42` es parte del contrato de reproducibilidad.

### Contrato de tipos

El modelo `FinancialMovement` está duplicado deliberadamente:

- Backend: `backend/app/routes.py`, como modelo Pydantic.
- Frontend: `frontend/src/lib/financial-types.ts`, como interfaz TypeScript.

Cuando cambies un campo, literal, modelo o respuesta, actualiza ambos lados y sus tests. No sustituyas esta duplicación por una generación automática sin una decisión explícita de arquitectura.

### API disponible

Los endpoints actuales son:

- `GET /health`
- `GET /api/metrics`
- `GET /api/metrics/facets`
- `GET /api/metrics/summary`
- `GET /api/metrics/categories/top`
- `GET /api/metrics/comparison`
- `GET /api/metrics/alerts`
- `GET /api/metrics/b2b`
- `GET /api/metrics/b2c`

`/api/metrics` admite filtros de fecha, categoría y tipo de operación. Los endpoints agregados pueden admitir agrupación, límite, umbral y tipo de negocio según su firma actual.

Todo endpoint nuevo debe:

- Permanecer en `backend/app/routes.py` salvo que el archivo supere 500 líneas.
- Incluir `response_model`.
- Usar tipos `Literal` para valores cerrados.
- Usar `Query(default=...)` para parámetros con valores por defecto.
- Mantener las funciones endpoint delgadas y delegar la lógica a helpers.

## Procedimiento

### 1. Clasificar el cambio

Clasifica la tarea antes de editar:

| Clase | Validaciones adicionales |
|---|---|
| Código | Tipos, tests, lint y build |
| Contrato API | Modelos backend/frontend, respuestas, filtros y tests HTTP |
| Datos | Seed, cantidad, orden, fórmulas y casos límite |
| Visual | Accesibilidad, responsive, tema oscuro y ausencia de colores hardcodeados |
| Infraestructura | Compose, Docker, proxy, puertos y variables de entorno |
| Documentación | Evidencia en código y coherencia con `README` y `memory-bank` |

### 2. Revisar arquitectura y reglas

Consulta antes de editar:

- `.agents/rules/architecture-rules.md`
- `.agents/rules/coding-conventions.md`
- `.agents/rules/testing-rules.md`
- `.agents/rules/risk-guardrails.md`
- Los archivos fuente relacionados con el cambio.

Aplica cambios mínimos y conserva las decisiones existentes salvo que el requerimiento pida explícitamente cambiarlas.

### 3. Implementar respetando convenciones

#### Frontend

- Usa nombres de archivo `kebab-case`.
- Usa el alias `@/` para imports dentro de `src/`; usa rutas relativas solo entre hermanos.
- Usa `type` en imports que solo importen tipos.
- Usa interfaces para formas de objetos y `type` para uniones.
- Usa exports nombrados para componentes nuevos; `App.tsx` es la excepción con export default.
- Usa Tailwind inline y `cn()`; no crees CSS por componente.
- Usa variables CSS para colores, nunca colores hardcodeados.
- No edites manualmente `frontend/src/components/ui/`; regenera componentes shadcn/ui si es necesario.
- Mantén el soporte para modo oscuro.

#### Backend

En `routes.py`, conserva este orden:

1. `from __future__ import annotations`.
2. Imports.
3. Aliases `Literal`.
4. Constantes.
5. Modelos Pydantic.
6. Helpers privados.
7. Helpers públicos.
8. Endpoints al final.

Añade anotaciones de tipo a parámetros y retornos. No introduzcas base de datos, autenticación o middleware salvo requerimiento explícito.

### 4. Validar la lógica financiera

Para cambios de cálculo, comprueba explícitamente:

- `totalIncome` suma solo `income`.
- `totalOutcome` suma solo `outcome`.
- `profit = totalIncome - totalOutcome`.
- `profitPercent = profit / totalIncome * 100` cuando `totalIncome > 0`; en otro caso es `0`.
- Las agrupaciones mensual, semanal y diaria ordenan sus periodos.
- Los filtros no alteran movimientos fuera de los criterios solicitados.
- Las comparativas calculan correctamente el periodo anterior.
- Las alertas comparan el gasto actual con la media histórica previa.
- Los importes se redondean donde lo exija el contrato de respuesta.

No cambies el seed, el número de movimientos ni las fórmulas sin actualizar primero las pruebas y la documentación afectada.

### 5. Validar la UI

El dashboard existente contiene:

- Cuatro KPIs: ingresos, gastos, beneficio y margen.
- Gráfico mensual de ingresos frente a gastos.
- Gráfico mensual del porcentaje de margen.

Al modificar componentes:

- Conserva estados de carga, error y datos vacíos.
- Reserva espacio para gráficos para evitar layout shift.
- Mantén nombres, semántica y contraste comprensibles en tema claro y oscuro.
- Añade o actualiza tests de interacción o renderizado cuando el comportamiento cambie.

### 6. Ejecutar el gate de QA

Después de cualquier cambio de código, ejecuta desde la raíz los comandos equivalentes:

```bash
cd backend && pytest
cd ../frontend && npm run test
cd ../frontend && npx tsc --noEmit
cd ../frontend && npm run lint
```

Para cambios de build o configuración frontend, ejecuta también:

```bash
cd frontend && npm run build
```

Para cambios de Docker o proxy, valida además:

```bash
docker compose config
docker compose ps
curl -I http://localhost:8000/docs
curl http://localhost:8000/api/metrics
curl -I http://localhost:5173
```

Si un comando no puede ejecutarse, indícalo como validación pendiente; no afirmes que pasó.

## Output esperado

La entrega debe incluir:

1. Archivos modificados y una descripción breve del cambio.
2. Contratos o tipos actualizados en ambos lados cuando corresponda.
3. Tests nuevos o ajustados para el comportamiento cambiado.
4. Resultado real de cada comando de QA ejecutado.
5. Validaciones pendientes, limitaciones o riesgos conocidos.
6. Si el cambio es documental, referencias a la evidencia que lo justifica.

Para cambios de infraestructura, incluye también las variables, puertos y servicios afectados.

## Criterios de aceptación

Un cambio cumple esta skill cuando todas las condiciones aplicables son verdaderas:

- [ ] Respeta la arquitectura React/Vite + FastAPI existente.
- [ ] Mantiene `/api/metrics` como ruta relativa del frontend y no rompe el proxy.
- [ ] Mantiene sincronizados los tipos Python y TypeScript.
- [ ] No cambia `seed=42`, los 360 movimientos ni las fórmulas financieras sin cobertura y documentación actualizadas.
- [ ] Los endpoints nuevos tienen `response_model` y validación de parámetros.
- [ ] Los componentes nuevos siguen nombres, imports, exports y estilos del repositorio.
- [ ] No se editaron manualmente los componentes generados de `components/ui/`.
- [ ] Se preservan accesibilidad, estados de carga/error/vacío, tema oscuro y espacio de gráficos.
- [ ] Se añadieron o actualizaron pruebas para el comportamiento modificado.
- [ ] Pasan `pytest`, Vitest, TypeScript y ESLint, o se reportan claramente las excepciones.
- [ ] Los cambios de Docker/proxy se validaron con la configuración y endpoints correspondientes.
- [ ] La documentación refleja el comportamiento real del código.
- [ ] No se introdujeron dependencias nuevas sin verificar compatibilidad.

## Restricciones y riesgos conocidos

- No elimines `frontend/src/lib/mock-data.ts`; es material de referencia para tests y fallbacks.
- No edites manualmente `frontend/src/components/ui/`.
- No dividas `backend/app/routes.py` mientras no supere 500 líneas.
- No añadas dependencias Python sin ejecutar la suite backend.
- No uses `export default` para componentes nuevos.
- No uses colores hardcodeados ni CSS aislado por componente.
- No olvides el modificador `type` en imports TypeScript de tipos.
- No documentes como verificado un comando que no se haya ejecutado.
- No conviertas datos mock en una base de datos o servicio externo sin aprobación explícita.

## Ejemplos de uso

### Añadir un filtro de negocio

1. Añadir el parámetro y su `Literal` en FastAPI.
2. Aplicarlo antes de agregaciones o cálculos.
3. Actualizar el tipo y el hook/cliente frontend.
4. Cubrir B2B, B2C y ausencia de filtro en tests.
5. Ejecutar el gate completo de QA.

### Cambiar un KPI

1. Localizar la fórmula en `frontend/src/lib/financial-utils.ts`.
2. Confirmar si el backend debe seguir devolviendo movimientos crudos.
3. Actualizar tests de totales, beneficio y casos sin ingresos.
4. Verificar renderizado, formato y accesibilidad de la tarjeta.

### Modificar el proxy o Docker

1. Revisar `docker-compose.yml`, `frontend/vite.config.ts` y `README.md`.
2. Mantener la URL de aplicación relativa `/api/metrics`.
3. Validar `docker compose config`, servicios, frontend y backend.
4. Documentar variables de entorno y cualquier limitación del entorno local.
