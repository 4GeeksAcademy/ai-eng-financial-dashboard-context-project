# Plan de implementación — Filtro de rango de fechas en el dashboard

Referencia: [spec.md](spec.md) (requisitos EARS RF1–RF11, RNF1–RNF2).

## Alcance de este plan

Solo frontend. Los endpoints `GET /api/metrics/facets` y `GET /api/metrics?start_date&end_date` ya existen en el backend ([backend/app/routes.py](../../../backend/app/routes.py)) y no requieren cambios.

## Pasos

### Paso 1 — Añadir el tipo `MetricsFacets`

- **Archivo**: [frontend/src/lib/financial-types.ts](../../../frontend/src/lib/financial-types.ts).
- **Acción**: crear una `interface MetricsFacets` con los campos `operation_types: OperationType[]`, `business_types: BusinessType[]`, `categories: Category[]`, `min_date: string`, `max_date: string`, replicando el modelo Pydantic `MetricsFacets` de `backend/app/routes.py`.
- **Por qué**: el frontend necesita un tipo propio para tipar la respuesta de `GET /api/metrics/facets`, siguiendo la convención del proyecto de reflejar manualmente los modelos del backend (ver `docs/conventions.md`).
- **Cómo verificar que quedó bien**: el archivo compila sin errores de TypeScript y el tipo puede importarse desde `App.tsx` en el paso 4.
- **Depende de**: ningún paso previo.

### Paso 2 — Añadir un helper de validación de fecha

- **Archivos**: [frontend/src/lib/financial-utils.ts](../../../frontend/src/lib/financial-utils.ts) y su test [financial-utils.test.ts](../../../frontend/src/lib/financial-utils.test.ts).
- **Acción**: crear una función pura y exportada, por ejemplo `isValidDateString(value: string): boolean`, que devuelva `true` solo si el valor cumple el formato `YYYY-MM-DD` y representa una fecha real (por ejemplo usando el regex `/^\d{4}-\d{2}-\d{2}$/` combinado con `Date.parse` o `Number.isNaN(new Date(value).getTime())`).
- **Por qué**: cubre el requisito RF11 del spec (rechazar formatos de fecha inválidos antes de llamar a la API), y debe ser una función pura testeable, según las reglas del proyecto (`docs/rules.md`, sección de testing).
- **Cómo verificar que quedó bien**: agregar casos de test que cubran una fecha válida, una cadena vacía, un formato incorrecto (`"31-01-2024"`) y una fecha inexistente (`"2024-02-30"`); todos los tests deben pasar con `npm run test`.
- **Depende de**: ningún paso previo (puede hacerse en paralelo con el Paso 1).

### Paso 3 — Crear el componente `DateRangeFilter`

- **Archivo nuevo**: `frontend/src/components/dashboard/date-range-filter.tsx`.
- **Acción**:
  1. Definir `interface DateRangeFilterProps` con: `startDate?: string`, `endDate?: string`, `onStartDateChange: (value: string) => void`, `onEndDateChange: (value: string) => void`, `minDate?: string`, `maxDate?: string`, `loading?: boolean`.
  2. Exportar `export function DateRangeFilter(props: DateRangeFilterProps)` (named export, siguiendo la convención del resto de componentes en `components/dashboard/`).
  3. Renderizar dos `<input type="date">` (uno para "Desde", otro para "Hasta"), usando `minDate`/`maxDate` como atributos HTML `min`/`max` cuando estén disponibles.
  4. Mostrar un texto de referencia con el rango disponible, por ejemplo: `Datos disponibles: {minDate} a {maxDate}` (cumple RF2).
  5. En el `onChange` de cada input, antes de invocar `onStartDateChange`/`onEndDateChange`, validar el valor con `isValidDateString` (Paso 2); si el valor no está vacío y no es válido, mostrar un mensaje de error corto bajo el input correspondiente y NO invocar el callback (cumple RF11). Si el valor está vacío, sí invocar el callback (representa "sin filtro").
- **Por qué**: centraliza toda la lógica de UI del filtro de fechas en un componente reutilizable, en vez de mezclarla dentro de `App.tsx`, siguiendo la separación de capas del proyecto.
- **Cómo verificar que quedó bien**: el componente se renderiza sin errores de TypeScript/ESLint (`npm run lint`) y expone los props definidos arriba.
- **Depende de**: Paso 1 (para tipar `minDate`/`maxDate` si se usa `MetricsFacets`) y Paso 2 (para la validación).

### Paso 4 — Integrar el filtro en `App.tsx`

- **Archivo**: [frontend/src/App.tsx](../../../frontend/src/App.tsx).
- **Acción**:
  1. Agregar dos estados nuevos: `const [startDate, setStartDate] = useState<string | undefined>(undefined)` y lo mismo para `endDate`.
  2. Agregar un estado `const [facets, setFacets] = useState<MetricsFacets | null>(null)`.
  3. Crear una función `fetchFacets()` que llame a `GET /api/metrics/facets` y guarde el resultado en `facets`; invocarla en un `useEffect` que se ejecute una sola vez al montar el componente (array de dependencias vacío), cumpliendo RF3.
  4. Modificar la función existente `fetchFinancialData` para que reciba `startDate`/`endDate` como parámetros opcionales y construya la URL usando `URLSearchParams`, agregando `start_date`/`end_date` únicamente si tienen valor (cumple RF4, RF5, RF6, RNF1).
  5. Modificar el `useEffect` que llama a `fetchFinancialData` para que se vuelva a ejecutar cuando cambien `startDate` o `endDate` (agregarlos al array de dependencias), reutilizando los estados `loading`/`error` ya existentes (cumple RF7, RF8, RF10).
  6. Renderizar `<DateRangeFilter />` (Paso 3) cerca de `<DashboardHeader />`, pasando `startDate`, `endDate`, `onStartDateChange={setStartDate}`, `onEndDateChange={setEndDate}`, `minDate={facets?.min_date}`, `maxDate={facets?.max_date}` y `loading={loading}`.
- **Por qué**: conecta el estado de los filtros de fecha con el fetch de datos y con el resto de la UI existente (KPIs y gráficos), sin duplicar la lógica de agregación que ya vive en `financial-utils.ts`.
- **Cómo verificar que quedó bien**: al cambiar las fechas en la UI, `KPIRow`, `IncomeOutcomeChart` y `ProfitPercentChart` deben actualizarse con los datos filtrados; con ambos campos vacíos, deben mostrar el dataset completo (igual que el comportamiento actual antes de este cambio).
- **Depende de**: Pasos 1, 2 y 3.

### Paso 5 — Verificación manual funcional

- **Acción**: levantar el proyecto (`docker compose up --build` desde la raíz, o `npm run dev` dentro de `frontend/` si el backend ya corre aparte) y probar manualmente:
  1. Al cargar el dashboard sin tocar nada, se muestran todos los datos y el rango disponible junto a los inputs.
  2. Seleccionar una fecha "Desde" y otra "Hasta" válidas dentro del rango disponible: los KPIs y gráficos deben cambiar para reflejar solo ese rango.
  3. Vaciar uno de los dos campos: los datos deben volver a incluir todo el histórico de ese lado del rango (por ejemplo, solo "Hasta" definido = todo lo anterior a esa fecha).
  4. Elegir un rango de fechas en el que no haya movimientos: la interfaz no debe romperse, mostrando KPIs en cero y gráficos vacíos.
  5. Si el input del navegador permite escribir un valor no válido (por ejemplo, pegando texto), verificar que se muestra el mensaje de error y no se dispara ninguna llamada a la API con ese valor.
- **Por qué**: es la única forma de confirmar que los requisitos RF1–RF11 se cumplen de extremo a extremo, ya que el spec no exige pruebas automatizadas de integración end-to-end.
- **Depende de**: Paso 4 completado.

### Paso 6 — Pruebas automatizadas y lint

- **Acción**: ejecutar `npm run lint` y `npm run test` (Vitest) dentro de `frontend/`; confirmar que ambos pasan sin errores nuevos. No se requieren cambios ni pruebas nuevas en `backend/`, ya que no se modifica el backend.
- **Por qué**: regla del proyecto de no mergear cambios que rompan lint o reduzcan cobertura de tests (`docs/rules.md`, checklist de PR).
- **Depende de**: Pasos 2 (nuevos tests del helper) y 4 (componente y `App.tsx` ya integrados).

## Archivos a modificar/crear (resumen)

- `frontend/src/lib/financial-types.ts` — añadir `MetricsFacets`.
- `frontend/src/lib/financial-utils.ts` / `financial-utils.test.ts` — helper de validación de fecha y sus tests.
- `frontend/src/components/dashboard/date-range-filter.tsx` — nuevo componente.
- `frontend/src/App.tsx` — nuevo estado, fetch parametrizado y renderizado del filtro.

## Fuera de alcance

Cambios de backend, filtros adicionales (categoría/tipo/business_type), persistencia del filtro en URL o `localStorage` (ver `spec.md`, sección "Fuera de alcance").
