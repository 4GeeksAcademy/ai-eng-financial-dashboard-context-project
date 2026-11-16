# Especificación del frontend: tres funcionalidades financieras

## Alcance, estado y fuentes

Este documento permite preparar la implementación sin depender del historial del chat. Describe comportamiento requerido, contratos actuales y cambios de backend pendientes; no afirma que las funcionalidades estén implementadas.

- Las rutas, esquemas y parámetros se verificaron mediante `/docs` y su `/openapi.json`, con respuestas HTTP reales durante la exploración de esta sesión. El backend temporal se detuvo después; no se ha repetido esa comprobación al redactar este README.
- Evidencia y terminología: [api-contract.md](./api-contract.md).
- Tipos existentes: [api-types.ts](./api-types.ts) y [param-types.ts](./param-types.ts).
- Responsabilidades de componentes propuestos: [components.md](./components.md).
- Los datos son simulados. Sus fechas dependen de la ejecución: no fijar años ni copiar el rango de un ejemplo como constante.

## Reglas comunes de integración

- Mantener `VITE_API_BASE_URL ?? ""`, la comprobación de `response.ok` y el tratamiento explícito de errores de [App.tsx](../src/App.tsx).
- Con URL base vacía, las llamadas son relativas; el proxy de desarrollo se configura mediante `VITE_API_PROXY_TARGET` en [vite.config.ts](../vite.config.ts). No fijar `localhost` en componentes.
- Todos los endpoints descritos son GET y reciben parámetros de consulta, no cuerpos JSON. Las respuestas de listas son arrays directos, sin envoltorio `data`.
- Construir la query con `URLSearchParams`, convirtiendo números a string. Omitir valores opcionales ausentes; no enviar fechas vacías ni el texto `"undefined"`.
- Inicio y fin son fechas válidas en `YYYY-MM-DD`, con límites inclusivos. Comparar fechas sin convertirlas a timestamps que desplacen el día por zona horaria.
- Distinguir carga, error y resultado vacío. Un error HTTP nunca equivale a ingresos cero ni a ausencia de alertas.
- Cancelar o descartar respuestas obsoletas, también si la selección cambia a un valor inválido. No mezclar resultados de distintos filtros.
- Reutilizar los formatos existentes: USD sin decimales para presentación y porcentajes con un decimal. No redondear importes antes de calcular porcentajes.
- Los tipos no validan JSON, formatos de fecha, enteros ni intervalos numéricos en ejecución. No usar `any` ni `object` para sustituir contratos concretos.

## Tipos de petición y respuesta

Las interfaces enlazadas ya existen; los siguientes alias auxiliares son definiciones documentales necesarias para completar este mapa, no archivos de implementación adicionales:

```ts
import type {
  AlertsResponse,
  BusinessType,
  FacetsResponse,
  TopCategoriesResponse,
} from "./api-types";
import type {
  AlertsParams,
  DateRangeFilter,
  TopCategoriesParams,
} from "./param-types";
import type { FinancialMovement } from "../src/lib/financial-types";

type MetricsResponse = FinancialMovement[];

interface SummaryEntry {
  /** Identificador del período; con agrupación mensual: YYYY-MM. */
  period: string;
  /** Ingresos agregados del período, como importe numérico. */
  income: number;
  /** Gastos agregados del período, como importe numérico. */
  outcome: number;
  /** Ingresos menos gastos del período, como importe numérico. */
  net: number;
}

type SummaryResponse = SummaryEntry[];

type BusinessTopCategoriesParams = TopCategoriesParams & {
  /** Línea consultada: B2B o B2C. */
  business_type: BusinessType;
  /** En esta vista se consultan exclusivamente ingresos. */
  operation_type: "income";
  /** Máximo solicitado para cada tabla. */
  limit: 5;
};

type BusinessSummaryParams = DateRangeFilter & {
  /** Línea consultada: B2B o B2C. */
  business_type: BusinessType;
  /** En esta vista se consultan exclusivamente ingresos. */
  operation_type: "income";
  /** Agrupación mensual; se suman los ingresos de todos los períodos. */
  group_by: "month";
};

// Propuesta: estos parámetros aún no están disponibles en facets.
type BusinessFacetsParams = {
  /** Línea cuyas categorías se necesitan: B2B o B2C. */
  business_type: BusinessType;
  /** Obtener únicamente categorías de ingresos. */
  operation_type: "income";
};
```

| Uso | Petición TypeScript | Respuesta TypeScript |
|---|---|---|
| Movimientos del dashboard | `DateRangeFilter` | `MetricsResponse` |
| Rango global disponible | Sin parámetros | `FacetsResponse` |
| Alertas del dashboard | `AlertsParams` | `AlertsResponse` |
| Top de ingresos por negocio | `BusinessTopCategoriesParams` | `TopCategoriesResponse` |
| Total de ingresos por negocio | `BusinessSummaryParams` | `SummaryResponse` |
| Categorías disponibles por negocio | `BusinessFacetsParams`, pendiente de backend | `FacetsResponse` |

`AlertsParams` y `TopCategoriesParams` describen los subconjuntos solicitados, no todos los parámetros que admite cada endpoint. En particular, el segundo no incluye `business_type`: la comparativa debe utilizar el tipo ampliado anterior.

## Funcionalidad 1 — Filtro de rango de fechas

### Endpoints y parámetros

- `GET /api/metrics`: enviar `start_date?` y `end_date?` como strings `YYYY-MM-DD`. Sin valores predeterminados ni límites de fecha fijos.
- `GET /api/metrics/facets`: no declara parámetros actualmente.
- Métricas también admite `category?` (`suppliers`, `sales`, `operational`, `administrative`, `others`) y `operation_type?` (`income`, `outcome`), sin valores predeterminados; no añadir estos controles en esta funcionalidad.

`FinancialMovement` contiene `create_date: string`, `amount: number`, `operation_type: "income" | "outcome"`, `category` y `business_type: "B2B" | "B2C"`. La fecha del movimiento se llama `create_date`, no `date`.

`FacetsResponse` contiene `operation_types`, `business_types` y `categories` como arrays de valores disponibles, y `min_date` y `max_date` como strings `YYYY-MM-DD`.

### Comportamiento y casos límite

- Dos inputs opcionales arriba del dashboard, vacíos inicialmente y con aplicación automática.
- Mostrar el rango de facets cerca de los controles como referencia, no como fechas preseleccionadas. El rango disponible y el período del encabezado son conceptos distintos.
- KPIs, ambos gráficos y período del encabezado se calculan sobre la misma respuesta filtrada.

| Caso | Qué debe mostrar o hacer la UI |
|---|---|
| Ambos campos vacíos | Todos los movimientos disponibles, sin parámetros de fecha. |
| Solo un extremo | Datos desde inicio o hasta fin, sin inventar el otro extremo. |
| Inicio posterior a fin | Error de validación visible; no consultar y conservar los últimos datos válidos. |
| Inicio igual a fin | Datos de ese día, si existen, pues los límites son inclusivos. |
| Rango sin movimientos, incluso fuera del dataset | Estado vacío en gráficos, KPIs a cero y período «No data»; no es un error HTTP. |
| Fallo de facets | Error visible del rango disponible; la carga independiente de métricas puede continuar sin inventar fechas de referencia. |

## Funcionalidad 2 — Tabla de alertas de anomalías

### Endpoint y parámetros

`GET /api/metrics/alerts`

| Parámetro | API actual | Uso requerido |
|---|---|---|
| `threshold?` | Número >= 0, sin máximo; defecto `0.3` | Ratio entre `0.01` y `1.0`, incluidos; inicio `0.3`. |
| `start_date?`, `end_date?` | Fechas opcionales | Mismo rango del dashboard; formato `YYYY-MM-DD`. |
| `group_by?` | `day`, `week`, `month`; defecto `month` | Mantener mensual, sin selector adicional. |
| `business_type?` | `B2B` o `B2C` | Omitir: las alertas del dashboard abarcan ambos negocios. |

`AlertsResponse` es `AlertEntry[]`. Cada entrada contiene `period: string`, `outcome_total: number`, `baseline_average: number` e `increase_ratio: number`.

### Semántica y cambios pendientes

- Tabla debajo de los gráficos: período, outcome registrado, media móvil de 3 períodos e incremento porcentual.
- La API actual devuelve una media acumulada. Debe cambiarse para usar los 3 períodos anteriores dentro del rango seleccionado, excluyendo el actual y sin generar alertas hasta disponer de los 3.
- Mantener los períodos mensuales representados por movimientos, sin insertar meses artificiales. Un filtro que corta un mes utiliza únicamente sus movimientos incluidos.
- Alerta si `(outcome - media) / media > threshold`. Con media cero no generar una alerta por división indefinida.
- El backend también debe restringir el umbral a `0.01–1.0`; documentarlo no implica que la validación ya exista.
- Aplicación automática de valores válidos. `increase_ratio=0.3` se presenta como `30.0%`; el input sigue mostrando el ratio `0.3`.

| Caso | Qué debe mostrar o hacer la UI |
|---|---|
| Menos de 3 períodos previos o ninguna anomalía | Contenedor visible y «No se detectaron anomalías para el umbral actual». |
| Umbral vacío, no numérico o fuera de `0.01–1.0` | Error junto al control; no consultar. Si se conservan resultados anteriores, indicar que corresponden al último umbral válido. |
| Incremento igual al umbral | No mostrar alerta: la comparación es estrictamente mayor. |
| Fallo de la petición | Error de carga, no el mensaje de ausencia de anomalías. |

## Funcionalidad 3 — Comparativa B2B vs B2C

### Endpoints y parámetros

Para cada negocio consultar:

1. `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B`, y su equivalente B2C.
2. `GET /api/metrics/summary?operation_type=income&group_by=month&business_type=B2B`, y su equivalente B2C.
3. `GET /api/metrics/facets` con la ampliación por negocio y operación descrita más abajo.

Añadir el mismo `start_date?` y `end_date?` a top y resumen; no son filtros actualmente admitidos por facets.

| Endpoint | Parámetros válidos y restricciones actuales |
|---|---|
| `categories/top` | `operation_type?`: `income` o `outcome`, defecto **`outcome`**. `limit?`: entero `1–20`, defecto `5`. `business_type?`: `B2B` o `B2C`. Fechas opcionales `YYYY-MM-DD`. |
| `summary` | `operation_type?`: `income` o `outcome`, sin defecto. `group_by?`: `day`, `week`, `month`, defecto `month`. `business_type?`: `B2B` o `B2C`. Fechas opcionales `YYYY-MM-DD`. También acepta `category?` con los mismos valores de métricas; omitirla para obtener el total completo. |
| `facets` | Sin parámetros actuales. Propuesta necesaria: `business_type?` (`B2B`, `B2C`) y `operation_type?` (`income`, `outcome`), ambos sin defecto. |

`TopCategoriesResponse` es `CategoryEntry[]`: `category`, `operation_type` y `total_amount: number`. No incluye porcentajes ni el total completo del negocio. `SummaryResponse` contiene los períodos con `income`, `outcome` y `net` numéricos.

### Semántica y cambios pendientes

- Página `#/comparativa`, sin dependencias nuevas. Compartir inicio y fin con el dashboard principal, conservándolos al navegar.
- Dos tablas en paralelo en escritorio y apiladas en móvil: categoría, ingresos y porcentaje sobre todos los ingresos del grupo.
- Obtener categorías disponibles desde facets por negocio e ingresos. El endpoint actual solo ofrece categorías globales: ampliar el backend antes de dar esta parte por implementada, sin fijar categorías locales como sustitución.
- La ampliación debe conservar el contrato sin filtros y el rango global del dataset. Si una combinación no contiene movimientos, devolver listas vacías conservando esa referencia global.
- Sumar `income` de todos los períodos del resumen para cada negocio. Calcular `total_amount / total_del_negocio × 100`, sin usar solo la suma del top 5.
- Un único gráfico debajo de ambas tablas compara esos mismos totales completos mediante dos barras, B2B y B2C.

| Caso | Qué debe mostrar o hacer la UI |
|---|---|
| Menos de 5 categorías | Solo filas reales. El dataset actual produce ingresos en `sales` y `others`; no inventar tres categorías más. |
| Un grupo sin ingresos | Mensaje explícito en su tabla, sin porcentajes indefinidos; barra de cero solo si la consulta terminó correctamente. |
| Más de 5 categorías | Hasta cinco filas; sus porcentajes pueden sumar menos del 100 %, pues el denominador incluye todas. |
| Fallo de top, resumen o facets de un grupo | Error explícito en la sección afectada. Si falta un total, no presentar el gráfico comparativo como completo ni sustituirlo por cero. |
| Navegación o cambios rápidos de fechas | Mantener los inputs compartidos y mostrar únicamente resultados coherentes con el rango vigente, respetando la validación de la Funcionalidad 1. |

## Errores HTTP, límites de verificación y entrega

- Las consultas válidas devuelven 200; una lista vacía es un resultado válido.
- Los errores de validación de parámetros declarados devuelven 422 con `detail` como lista de errores. No asumir que la API rechaza rangos invertidos: la UI debe validarlos.
- Se verificó que el umbral `1.1` aún devuelve 200 y que la media de alertas es acumulada; son diferencias pendientes, no contratos ya corregidos.
- La exploración HTTP está registrada en [api-contract.md](./api-contract.md). El contraste del patrón frontend fue estático.
- El acceso al compilador TypeScript quedó bloqueado por la política de la organización; no afirmar que se ejecutó una compilación estricta.
- Este README solo especifica. No incorpora código ejecutable, nuevas dependencias, tests ni cambios en los contratos del backend.
