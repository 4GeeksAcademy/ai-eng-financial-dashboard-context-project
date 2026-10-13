# Contratos API y casos límite

Este documento resume las tres funcionalidades y separa el contrato que existe en el código de las extensiones requeridas por sus especificaciones. Las declaraciones TypeScript se verificaron contra el código de FastAPI; no se contrastaron con `/openapi.json`. Los nombres exportados `DateRangeFiler`, `AlersResponse` y `TopCategoriesReponse` conservan las erratas del código actual.

Tipos actuales: [api-types.ts](api-types.ts), [param-types.ts](param-types.ts), [financial-types.ts](../src/lib/financial-types.ts). Rutas de referencia: [routes.py](../../backend/app/routes.py). Especificaciones: [001 fechas](001-filtro-por-fechas/spec.md), [002 alertas](002-alertas-anomalias/spec.md), [003 comparativa](003-comparativa-B2B-vs-B2C/spec.md).

## 001 · Filtro por fechas

### Endpoints y tipos

| Endpoint | Parámetros TypeScript | Respuesta TypeScript |
|---|---|---|
| `GET /api/metrics` | `DateRangeFiler` (`start_date?`, `end_date?`) | `FinancialMovement[]` de `src/lib/financial-types.ts` |
| `GET /api/metrics/facets` | Ninguno; actualmente no acepta filtros | `FacetsResponse` |

`FinancialMovement` tiene `create_date: string`, `amount: number`, `operation_type: OperationType`, `category: Category` y `business_type: BusinessType`. `FacetsResponse` tiene `operation_types: OperationType[]`, `business_types: BusinessType[]`, `categories: Category[]`, `min_date: string` y `max_date: string`; sus propiedades son obligatorias y no nulas.

### Parámetros

- `start_date` y `end_date` son opcionales y se envían como fechas `YYYY-MM-DD`; omitir una fecha significa no limitar ese extremo. Omitir ambas devuelve todos los movimientos.
- En backend, los límites son inclusivos. TypeScript solo los declara como `string`; el cliente debe validar el formato, omitir cadenas vacías y rechazar `start_date > end_date` antes de consultar. El endpoint no comprueba el orden del rango.
- `/api/metrics/facets` devuelve `min_date` y `max_date` globales; no recibe fechas y sus facetas no se ajustan a la selección.

### Casos límite y UI

1. **Solo fecha inicial o solo fecha final:** enviar únicamente el parámetro correspondiente. Mantener visible el otro input vacío y mostrar los movimientos dentro del límite abierto; no tratarlo como rango inválido.
2. **Rango válido sin resultados:** la respuesta es `[]`; mostrar estado «No hay datos para este período» y no presentar KPI o gráficos como si tuvieran datos.
3. **Inicio posterior al fin:** no enviar la petición; indicar el error junto a los controles y conservar la pantalla utilizable.
4. **Error de API/facetas:** mostrar el error sin desmontar los controles ni bloquear el dashboard. Si fallan las facetas, no inventar fechas disponibles.

## 002 · Alertas de anomalías

### Endpoint y tipos

| Endpoint | Parámetros TypeScript | Respuesta TypeScript |
|---|---|---|
| `GET /api/metrics/alerts` | `AlertsParams` | `AlersResponse`, alias de `AlertEntry[]` |

`AlertEntry` contiene `period: string`, `outcome_total: number`, `baseline_average: number` e `increase_ratio: number`. La respuesta es un array sin envoltorio y puede ser `[]`. `increase_ratio` es una razón: `0.3` se muestra como `30 %`.

### Parámetros y discrepancias del contrato

- `start_date?`, `end_date?`: heredados de `DateRangeFiler`, opcionales, formato `YYYY-MM-DD`, inclusivos en backend; omitir los límites no seleccionados.
- `threshold?`: número; backend actual admite cualquier valor `>= 0`, sin máximo, y usa `0.3` como predeterminado. La funcionalidad exige `0.01–1.0` y predeterminado `0.3`; validar ese intervalo en la UI y restringir también el backend a `0.01–1.0` para que el contrato coincida.
- `group_by?`: `'day' | 'week' | 'month'`, predeterminado `'month'`. La tabla de anomalías se define como mensual: enviar `group_by: 'month'` y no mostrar un selector de agrupación.
- `business_type?`: `'B2B' | 'B2C'`; opcional en la API, pero no forma parte del filtro solicitado para esta funcionalidad, así que omitirlo.
- El backend actual compara contra la media de todos los períodos previos que queden dentro del rango filtrado; la spec exige la media de los tres períodos anteriores. Para cumplirla, calcular una ventana móvil de exactamente tres meses previos y conservar ese contexto aunque quede antes del rango; devolver alertas solo para los meses dentro del rango.

### Casos límite y UI

1. **Respuesta `[]` para el umbral seleccionado:** mostrar explícitamente «No hay anomalías para este umbral y período»; nunca dejar una tabla vacía sin explicación.
2. **Menos de tres meses de contexto o media previa igual a cero:** no calcular una razón indefinida ni generar alerta para ese período. Mostrar estado sin alertas; si ningún período tiene referencia suficiente, indicar además que faltan períodos previos para comparar.
3. **Umbral menor que `0.01` o mayor que `1.0`:** rechazarlo en el control y no consultar; el backend debe rechazar también el valor fuera de rango una vez corregido el contrato.
4. **Error de API:** mostrar error en la sección de alertas, conservar el umbral y las fechas, y no presentarlo como «sin anomalías».

## 003 · Comparativa B2B vs B2C

### Endpoints y tipos

| Endpoint | Parámetros TypeScript | Respuesta TypeScript |
|---|---|---|
| `GET /api/metrics/categories/top` | `TopCategoriesParams` | `TopCategoriesReponse`, alias de `CategoryEntry[]` |
| `GET /api/metrics/summary` | **Falta `SummaryParams` en `param-types.ts`**; ruta verificada en backend | **Falta tipo en `api-types.ts`**; backend devuelve `MetricsSummaryItem[]` |
| `GET /api/metrics/facets` | Actualmente ninguno; falta tipo para filtros por grupo | `FacetsResponse`, actualmente facetas globales |

`CategoryEntry` tiene `category: Category`, `operation_type: OperationType` y `total_amount: number`. La respuesta no incluye `business_type`, porcentaje ni total general; cada petición de ranking se hace para un solo grupo.

Para tipar el endpoint existente de resumen, añadir a `api-types.ts`:

```ts
export interface SummaryEntry {
  period: string;
  income: number;
  outcome: number;
  net: number;
}

export type SummaryResponse = SummaryEntry[];
```

Añadir a `param-types.ts` el tipo usado por esta vista:

```ts
export interface SummaryParams extends DateRangeFiler {
  group_by?: 'day' | 'week' | 'month';
  operation_type?: OperationType;
  business_type?: BusinessType;
}
```

El backend también admite `category?: Category` en `/api/metrics/summary`; la comparativa no lo envía. Usar `group_by: 'month'`, `operation_type: 'income'`, `business_type: 'B2B' | 'B2C'` y el mismo rango para ambos grupos. Sumar `income` de todas las filas mensuales para obtener el total completo del grupo y calcular `total_amount / totalIncome * 100` para cada categoría.

### Parámetros y discrepancias del contrato

- `start_date?`, `end_date?`: opcionales en `TopCategoriesParams` y `SummaryParams`, formato `YYYY-MM-DD`, límites inclusivos; enviar los mismos valores a rankings y resúmenes de ambos negocios.
- `operation_type?`: `'income' | 'outcome'`, predeterminado `'outcome'` en ranking. Enviar explícitamente `'income'` en los dos rankings; para resumen también fijarlo a `'income'` para que la intención de la petición sea explícita.
- `limit?`: entero entre `1` y `20`, predeterminado `5`; la UI envía `5`. Es máximo, no garantía de cinco filas.
- `business_type?`: `'B2B' | 'B2C'`; omitirlo agrega ambos negocios, por lo que cada consulta de ranking/resumen debe establecerlo.
- `group_by?` de resumen: `'day' | 'week' | 'month'`, predeterminado `'month'`; fijarlo en `'month'` para sumar un período seleccionado. Los tipos actuales de TypeScript aún no representan este endpoint.
- `/api/metrics/facets` devuelve categorías globales, no categorías por grupo, y no acepta parámetros. Para cumplir la spec 003 hay que ampliarlo y declarar `FacetsParams` con `business_type?: BusinessType` y `operation_type?: OperationType`. Decisión de respuesta: esos filtros limitan `categories`; `min_date`, `max_date`, `business_types` y `operation_types` se mantienen globales para que el selector de fechas no pierda su rango disponible.
- El simulador solo genera ingresos en `sales` y `others`; aunque se solicite `limit=5`, la API puede devolver dos, menos o ninguna.

### Casos límite y UI

1. **Top vacío para B2B:** mostrar dentro del panel B2B «No hay categorías de ingreso para B2B en este período»; mantener visible el panel B2C y su contenido.
2. **Top vacío para B2C:** mostrar dentro del panel B2C «No hay categorías de ingreso para B2C en este período»; mantener visible el panel B2B y su contenido.
3. **Una a cuatro categorías devueltas:** mostrar todas las filas recibidas, sin completar hasta cinco con categorías ficticias. Esta decisión interpreta “top cinco” como máximo cinco categorías reales; el criterio de aceptación de la spec 003 debe decir “hasta cinco” para coincidir con el contrato y los datos simulados.
4. **Resumen vacío o total de ingresos cero:** tratar el total del grupo como `0`; mostrar el gráfico con ambos valores solo cuando ambos resúmenes hayan respondido, y porcentajes como `0 %` (sin división por cero). Si falla uno de los resúmenes, mostrar error y no presentar una comparación parcial como completa.
5. **Facetas globales disponibles pero endpoint sin filtros:** no reutilizar la lista global como si fueran categorías específicas de B2B/B2C; mostrar error de integración o bloquear la comparativa hasta ampliar el contrato.

## Resoluciones para evitar preguntas de seguimiento

- **¿Un límite de fecha necesita su pareja?** No. Cada límite es independiente, inclusivo y opcional; el extremo sin valor queda abierto. El rango invertido sí se rechaza antes de solicitar datos.
- **¿Cómo se calcula una alerta al inicio del rango?** Se toma el contexto de los tres meses calendario anteriores, aunque esté fuera del rango visible; solo se muestran alertas cuyo mes cae dentro del rango.
- **¿“Top cinco” significa exactamente cinco?** No se inventan resultados. Se muestran hasta cinco categorías reales y se debe actualizar el criterio de la spec 003 para reflejarlo; de lo contrario, el criterio no se puede satisfacer con el generador actual.
- **¿Ya existen todos los contratos TypeScript necesarios?** No. `SummaryParams`, `SummaryEntry`/`SummaryResponse` y `FacetsParams` son adiciones pendientes; no deben confundirse con las interfaces exportadas actualmente.
- **¿Las facetas por negocio ya funcionan?** No. La ruta existe, pero solo devuelve valores globales y no acepta filtros. La sección 003 depende de ampliar backend y tipos antes de integrar ese filtro.

Referencias adicionales: [planes técnicos](001-filtro-por-fechas/plan.md), [plan de alertas](002-alertas-anomalias/plan.md), [plan de comparativa](003-comparativa-B2B-vs-B2C/plan.md), [verificación de tipos API](api-verification.md), [componentes propuestos](components.md), [pruebas del backend](../../backend/tests/test_routes.py) y [cálculos financieros del frontend](../src/lib/financial-utils.ts).
