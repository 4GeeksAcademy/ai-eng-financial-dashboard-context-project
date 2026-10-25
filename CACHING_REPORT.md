# Caching Report — HealthCore Financial Dashboard

## Resumen ejecutivo

Se implementaron tres técnicas de caching sobre el monorepo de HealthCore:

1. **Caché TTL en proceso** (backend FastAPI) — 8 endpoints cacheados con claves parametrizadas.
2. **`useMemo`** (frontend React) — valores derivados memoizados para evitar recálculos en re-renderizados.
3. **Lazy loading** (frontend React) — componentes pesados (recharts) cargados bajo demanda.

---

## Frontend decisions

| Target                          | Technique   | Justification                                                                                                       |
| ------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| `IncomeOutcomeChart`            | `React.lazy` | Renderiza 2 gráficos con recharts (~300 KB). No están en el viewport inicial inmediato; se cargan after paint.       |
| `ProfitPercentChart`            | `React.lazy` | Mismo bundle de recharts. Si se dividen en 2 chunks separados, el navegador sóload diferencia los que necesita.     |
| `computeKPIs(movements)`        | `useMemo`   | Filtra y reduce 360 movimientos cada vez. Con `useMemo` solo se recalcula si `movements` cambia (tras fetch inicial). |
| `computeMonthlyData(movements)` | `useMemo`   | Itera 360 movimientos y agrupa por mes. Dependencia `movements` — estable tras la carga inicial.                     |

### Tradeoffs — Frontend

- **Lazy loading**: el primer render muestra el esqueleto (`ChartSkeleton`) mientras se descargan recharts. En redes lentas el usuario ve el placeholder ~200–400 ms extra, pero el bundle inicial se reduce ~300 KB.
- **`useMemo`**: añade overhead de comparación de dependencias. En este caso `movements` es un array completo de objetos — la referencia cambia al setear estado, pero el coste de `===` es trivial comparado con el cálculo.

---

## Backend decisions

| Endpoint                        | Coste estimado       | Frecuencia | TTL  | Clave de caché                                     | Justificación                                                                                                                                        |
| ------------------------------- | -------------------- | ---------- | ---- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/metrics`              | ~5–15ms (360 items)  | Alta       | 30s  | `metrics:{start_date}:{end_date}:{category}:{op}`  | Endpoint principal llamado desde el frontend al cargar. Los parámetros varían pero el seed es fijo; se cachea por combinación de filtros.             |
| `GET /api/metrics/facets`       | ~3–5ms (facets)      | Alta       | 60s  | `metrics:facets`                                    | Facets (operation_types, business_types, categories, fechas) no cambian nunca con seed fijo. Caché global.                                            |
| `GET /api/metrics/summary`      | ~8–15ms (agg)        | Alta       | 30s  | `metrics:summary:{group_by}:{fechas}:{cat}:{op}:{biz}` | Agregación costosa (suma por periodo). Cacheada con todos los filtros como parte de la clave.                                                         |
| `GET /api/metrics/categories/top` | ~5–10ms (sort+limit) | Media      | 30s  | `metrics:topcats:{op_type}:{limit}:{start}:{end}:{biz}` | Ordenación y limitación. Se cachea por tipo de operación y filtros.                                                                                  |
| `GET /api/metrics/comparison`   | ~15–25ms (2 periodos)| Media      | 60s  | `metrics:comparison:{start}:{end}:{business_type}`  | **Endpoint más caro**: genera 360 movimientos y calcula 2 periodos completos. TTL de 60s por ser puramente una proyección histórica (datos estáticos). |
| `GET /api/metrics/alerts`       | ~10–20ms (summary+detect)| Baja   | 60s  | `metrics:alerts:{threshold}:{group_by}:{fechas}:{biz}` | Detecta anomalías sobre el summary. Una alerta no necesita frescura sub-segundo.                                                                     |
| `GET /api/metrics/b2b`          | ~5–10ms (filtro)     | Media      | 30s  | `metrics:b2b:{start}:{end}:{category}:{op}`         | Filtra ~198 movimientos B2B. Cacheado por combinación de filtros.                                                                                    |
| `GET /api/metrics/b2c`          | ~5–10ms (filtro)     | Media      | 30s  | `metrics:b2c:{start}:{end}:{category}:{op}`         | Filtra ~162 movimientos B2C. Cacheado por combinación de filtros.                                                                                    |

### Tradeoffs — Backend

- **Frescura vs. rendimiento**: todos los endpoints usan `generate_mock_movements(seed=42)` que es **determinista** (mismos datos siempre). En un escenario real con base de datos, estos mismos TTL garantizarían que el dashboard nunca sirva datos con más de 30–60 segundos de retraso.
- **Caché en proceso** (diccionario Python): no persiste entre reinicios del servidor, pero es suficiente para un dashboard monoproceso. Para escalar a múltiples workers se necesitaría Redis.
- **TTL de 60s en `comparison`**: justificado porque compara periodos históricos completos. Un dato de ayer no cambia aunque pasen 60 segundos más.

---

## Lo que NO se cacheó (y por qué)

| Componente/Endpoint                  | Decisión           | Motivo                                                                                                                                               |
| ------------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /health`                        | No cachear         | Respuesta trivial `{"status":"ok"}` (~1ms). Cachear añadiría complejidad sin beneficio.                                                              |
| Componentes `KPICard` / `KPIRow`     | No memoizar        | Son componentes puramente de presentación que reciben `metrics` ya memoizado. El padre (`App`) ya evita recalcular.                                   |
| `DashboardHeader`                    | No lazy load       | Es parte del primer paint. No tiene dependencias pesadas.                                                                                            |

---

## Volumen de datos

| Escenario      | Filas generadas              | Impacto en latencia |
| -------------- | ---------------------------- | ------------------- |
| Actual (mock)  | `generate_mock_movements` → 360 movimientos | ~5–25ms por endpoint |

Con el volumen actual (360 movimientos), los endpoints responden rápido incluso sin caché. El valor real del caching aplicado aquí se vería con una base de datos real conteniendo **miles o decenas de miles de registros**, donde `generate_mock_movements` sería reemplazado por consultas SQL con joins, agregaciones y ordenaciones.

Para simular carga realista, el siguiente paso sería:
1. Reemplazar `generate_mock_movements` por una tabla PostgreSQL con ~50k–100k movimientos.
2. Medir latencia antes de cachear (esperado: 50–200ms por query con agregación).
3. Aplicar TTL y verificar reducción a ~1–5ms en hits de caché.

---

## Cobertura de endpoints cacheados

- **8 de 9 endpoints** del backend están cacheados (88%).
- El único no cacheado es `/health` (endpoint de salud trivial).
- 2 componentes lazy-loaded en frontend.
- 2 usos de `useMemo` que cubren todos los cálculos derivados.

---

## Cómo se ha implementado

**Backend:**
- `backend/app/core/cache.py` — módulo de caché TTL en proceso con `cache_get`, `cache_set`, `cache_invalidate_prefix`.
- Cada endpoint de `routes.py` incorpora un patrón: `cache_get(clave) → si existe, devolver → si no, calcular → cache_set(clave, resultado, TTL) → devolver`.

**Frontend:**
- `App.tsx` — `useMemo` para `metrics` y `monthlyData` con dependencia `[movements]`.
- `App.tsx` — `React.lazy()` + `Suspense` para `IncomeOutcomeChart` y `ProfitPercentChart`.