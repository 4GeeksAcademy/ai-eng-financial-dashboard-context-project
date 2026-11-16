# Financial Data Formatting Skill

## Objetivo

Establecer convenciones estándar para formateo y visualización de datos monetarios, porcentajes y métricas ejecutivas en el dashboard financiero. Garantizar consistencia de representación en UI, alertas, reportes y logs del sistema, respetando locales, precisión numérica y cumplimiento de estándares de dominio financiero.

---

## Inputs Definidos

### 1. Valor Monetario (`amount: number | Decimal`)

**Rango esperado:**
- Mínimo: 0 (no hay montos negativos en dominio; operaciones se clasifican por `operation_type`)
- Máximo: sin límite explícito (considerar Decimal en backend si > 2^53-1)

**Moneda:** USD exclusivamente (configurada en dominio, ver `frontend/src/lib/financial-utils.ts`)

**Precisión:**
- Backend: Usar `Decimal` para acumulaciones y cálculos intermedios (no float)
- Frontend: Recibir números JSON, aplicar formateo solo en borde de visualización

**Contexto esperado:**
- KPI principal (ej: "Total Income", "Total Outcome")
- Punto de dato mensual (ej: valor de mes en gráfico)
- Alerta de threshold (ej: "Outcome increased by $5,000")
- Comparación período (ej: "Previous period: $12,000")

### 2. Porcentaje de Rentabilidad (`percent: number`)

**Rango esperado:**
- Mínimo: -100% (pérdida total)
- Máximo: sin límite (casos raros pero válidos)
- Típico: 0% a 50% en dashboard

**Escenarios:**
- Margen de ganancia (profit / income * 100)
- Variación período (delta / baseline * 100)
- Contribución categoría (categoria_total / total_general * 100)

**Precisión:**
- Mostrar 1 decimal en KPI (ej: "23.5%")
- Mostrar 2 decimales en análisis detallado (ej: tabla comparativa "23.47%")
- Mostrar 0 decimales solo si es consenso visual/UX

### 3. Categoría Financiera (`category: string`)

**Dominio:** `suppliers | sales | operational | administrative | others`

**Visualización:**
- Siempre título (Sentence case o Title Case según contexto)
- En gráficos: etiqueta corta máximo 15 caracteres
- En tablas: nombre completo con línea suave de separación

**Locales:** Mantener identificadores técnicos en código; labels de UI en español.

### 4. Tipo de Operación (`operation_type: 'income' | 'outcome'`)

**Colores canónicos (do not hardcode, usar CSS vars):**
- Income: `--success` o `hsl(142, 76%, 36%)` (verde)
- Outcome: `--destructive` o `hsl(0, 84%, 60%)` (rojo)

**Iconos canónicos:**
- Income: TrendingUp (Lucide) o similar
- Outcome: TrendingDown (Lucide) o similar

**Negatividad visual:**
- Nunca mostrar "Total Outcome" con signo negativo (ya es operación de salida)
- Mostrar profit/delta con "-" cuando sea pérdida: "-$1,250" (no "Negative $1,250")

### 5. Fecha y Período (`date: string | Date`)

**Formato en datos:** ISO 8601 (`YYYY-MM-DD`)

**Formato de visualización:**
- Label de mes: "Jan 2025" (ej: en gráficos)
- Label de período: "January 1 - January 31, 2025" (ej: en cabecera)
- Label de comparación: "Previous 30 days vs Current" (ej: en alertas)

**Localización:** Usar `Intl.DateTimeFormat` con `'en-US'` (actual) o según parámetro de locale futuro.

---

## Output Esperado

### Funciones de Formato

Cada función debe:
1. Aceptar entrada tipada (number, Decimal, string, Date)
2. Retornar string formateado y listo para render
3. No tener efectos secundarios
4. Incluir documentación JSDoc con ejemplos

#### `formatCurrency(value: number, options?: {decimals?: 0|1|2}): string`

**Propósito:** Formatear montos monetarios en USD.

**Entrada:**
- value: 1500.75
- options: undefined o {decimals: 0}

**Salida:**
- "$1,501" (si decimals: 0, redondea)
- "$1,500.75" (si decimals: 2, default)

**Implementación base (actual):**
```typescript
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
```

**Reglas:**
- No decimales por defecto (decisión UX ejecutiva)
- Si future = "detallado", permitir 2 decimales
- Preservar signo negativo si valor < 0
- Manejar muy grandes valores (ej: 1,000,000+) sin degradación de legibilidad

#### `formatPercent(value: number, options?: {decimals?: 0|1|2}): string`

**Propósito:** Formatear porcentajes (margen, variación, contribución).

**Entrada:**
- value: 23.456
- options: {decimals: 1}

**Salida:**
- "23.5%" (con 1 decimal, redondeado)

**Implementación base (actual):**
```typescript
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
```

**Reglas:**
- Rango permitido: -100% a +∞
- Si value > 100%, mostrar sin truncar (ej: "250%") pero indicar en contexto que es anomalía
- Para margen de ganancia: 1 decimal (KPI) o 2 decimales (tabla)
- Para variación período: 2 decimales (precisión para análisis)
- Nunca omitir "%" símbolo

#### `formatCategoryLabel(category: Category, context?: 'short' | 'long'): string`

**Propósito:** Traducir categoría técnica a etiqueta UI.

**Entrada:**
- category: "suppliers"
- context: "short" (gráfico) o "long" (tabla)

**Salida:**
- "Suppliers" (long)
- "Supp." (short, máx 5 chars)

**Mapping:**
| Técnico | Long | Short |
|---------|------|-------|
| suppliers | Suppliers | Supp. |
| sales | Sales | Sale |
| operational | Operational | Oper. |
| administrative | Admin | Adm. |
| others | Others | Othr. |

**Reglas:**
- Context "short" = máx 7 caracteres (para ejes de gráfico compactos)
- Context "long" = nombre descriptivo (para tablas, tooltips)
- Validar que `category` está en dominio permitido; lanzar error si no

#### `formatOperationTypeLabel(type: OperationType): {label: string; icon: string; color: string}`

**Propósito:** Retornar label visual, referencia de icono y CSS var de color para tipo de operación.

**Entrada:**
- type: "income"

**Salida:**
```typescript
{
  label: "Income",
  icon: "trending-up",
  color: "var(--success)"
}
```

**Mapping:**
| Tipo | Label | Icono | Color Var |
|------|-------|-------|-----------|
| income | Income | trending-up | --success |
| outcome | Outcome | trending-down | --destructive |

**Reglas:**
- Icon es cadena tipo Lucide (sin "lucide-" prefix)
- Color es variable CSS (nunca valor hardcoded)
- Consumidores de esta función deben validar que `icon` está registrado en sistema de iconos del proyecto

#### `formatPeriodLabel(startDate: Date | string, endDate: Date | string): string`

**Propósito:** Generar etiqueta de período legible para cabecera o alertas.

**Entrada:**
- startDate: "2025-01-01"
- endDate: "2025-01-31"

**Salida:**
- "January 1 - January 31, 2025"

**Reglas:**
- Si startDate y endDate están en mismo mes: "January 1-31, 2025"
- Si spans múltiples meses/años: "January 1, 2025 - February 28, 2025"
- Usar `Intl.DateTimeFormat` con {month: 'long', day: 'numeric', year: 'numeric'}

#### `formatDeltaPercent(previous: number, current: number, options?: {sign?: boolean}): string`

**Propósito:** Formatear variación porcentual entre dos períodos.

**Entrada:**
- previous: 1000
- current: 1200
- options: {sign: true}

**Salida:**
- "+20.0%" (con signo positivo, si options.sign=true)
- "20.0%" (sin signo)

**Fórmula:** `((current - previous) / previous) * 100`

**Reglas:**
- Si previous = 0: retornar "N/A" (no se puede calcular delta)
- Si options.sign = true: prefijo "+" si delta > 0, "-" si delta < 0
- Siempre 1 decimal (contexto de comparación)

---

## Criterios de Aceptación Verificables

### C1: Consistencia de Formato

**Test:** Ejecutar `npm run test -- --run` en `frontend/`

```typescript
describe("formatCurrency consistency", () => {
  it("formats $1500 as '$1,500'", () => {
    expect(formatCurrency(1500)).toBe("$1,500");
  });

  it("formats $1,500.75 with decimals option", () => {
    expect(formatCurrency(1500.75, {decimals: 2})).toBe("$1,500.75");
  });

  it("handles large values without truncation", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000");
  });
});

describe("formatPercent consistency", () => {
  it("formats 23.456 as '23.5%'", () => {
    expect(formatPercent(23.456)).toBe("23.5%");
  });

  it("formats negative percent correctly", () => {
    expect(formatPercent(-15.2)).toBe("-15.2%");
  });

  it("handles edge case of 0%", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });
});

describe("formatCategoryLabel consistency", () => {
  it("maps 'suppliers' to 'Suppliers' (long) or 'Supp.' (short)", () => {
    expect(formatCategoryLabel("suppliers", "long")).toBe("Suppliers");
    expect(formatCategoryLabel("suppliers", "short")).toBe("Supp.");
  });

  it("throws on invalid category", () => {
    expect(() => formatCategoryLabel("invalid")).toThrow();
  });
});

describe("formatOperationTypeLabel consistency", () => {
  it("returns correct object for 'income'", () => {
    expect(formatOperationTypeLabel("income")).toEqual({
      label: "Income",
      icon: "trending-up",
      color: "var(--success)"
    });
  });

  it("returns correct object for 'outcome'", () => {
    expect(formatOperationTypeLabel("outcome")).toEqual({
      label: "Outcome",
      icon: "trending-down",
      color: "var(--destructive)"
    });
  });
});

describe("formatDeltaPercent consistency", () => {
  it("calculates delta from 1000 to 1200 as '+20.0%'", () => {
    expect(formatDeltaPercent(1000, 1200, {sign: true})).toBe("+20.0%");
  });

  it("handles zero previous value gracefully", () => {
    expect(formatDeltaPercent(0, 500)).toBe("N/A");
  });
});
```

**Criterio de paso:** Todos los tests pasan sin warnings.

### C2: Uso en Componentes

**Test:** Componentes que consumen formatters deben ser auditables sin regression visual.

**Archivos a verificar:**
- `frontend/src/components/dashboard/kpi-card.tsx` (usa `formatCurrency`)
- `frontend/src/components/dashboard/income-outcome-chart.tsx` (usa categorías y operaciones)
- `frontend/src/lib/financial-utils.ts` (funciones públicas de formato)

**Criterio de paso:**
- Build sin errores TypeScript: `npm run build`
- Componentes renderizan KPIs con format correcto
- Gráficos etiquetan operaciones y categorías consistentemente

### C3: Precisión Backend

**Test:** Validar que backend no pierde precisión decimal.

**Archivos a verificar:**
- `backend/app/routes.py` (tipos de retorno)
- `backend/tests/test_routes.py` (tests de precisión)

**Criterio de paso:**
- Si hay valores > 2^53-1, usar `Decimal` en Pydantic y JSON encoder custom
- Tests de agregación en backend validan redondeo solo en serialización HTTP

**Test backend sugerido:**
```python
def test_metrics_summary_no_float_accumulation_error():
    # Acumular 100 movimientos de $10.01 cada uno = $1001.00 exacto
    response = client.get("/api/metrics/summary")
    summary = response.json()
    # Validar que total es exacto, no $1000.9999999
    assert summary[0]["income"] == 1001.0
```

### C4: Documentación de Nuevos Formatters

**Criterio:**
- Si se agrega nuevo formatter (ej: `formatTaxAmount`, `formatInterestRate`), debe incluir:
  1. Función con JSDoc + ejemplos
  2. Test de casos base + edge cases
  3. Archivo `memory-bank/` o comentario de integración si afecta comportamiento esperado

### C5: Validación de Dominio

**Criterio:**
- Funciones como `formatCategoryLabel` deben validar entrada contra enum permitido
- Fallar explícitamente con error descriptivo, no silenciosamente

**Ejemplo de validación:**
```typescript
export function formatCategoryLabel(
  category: Category,
  context: "short" | "long" = "long"
): string {
  const validCategories: Record<Category, {long: string; short: string}> = {
    suppliers: {long: "Suppliers", short: "Supp."},
    sales: {long: "Sales", short: "Sale"},
    operational: {long: "Operational", short: "Oper."},
    administrative: {long: "Admin", short: "Adm."},
    others: {long: "Others", short: "Othr."},
  };

  if (!(category in validCategories)) {
    throw new Error(`Invalid category: ${category}`);
  }

  return validCategories[category][context];
}
```

---

## Integración con Skill

### Cuándo Aplicar Esta Skill

Usar **financial-data-formatting** cuando:

1. **Crear componente nuevo** que renderiza KPIs, montos, porcentajes o métricas
   - ✅ Usar `formatCurrency()`, `formatPercent()`, `formatOperationTypeLabel()`
   - ❌ Hardcodear formato "$ " + value.toString()

2. **Cambiar punto de representación visual** de un número financiero
   - ✅ Consultar esta skill para formato canonicizado
   - ❌ Cambiar solo el `toFixed()` sin revisar convención global

3. **Agregar alerta, comparación o métrica nueva**
   - ✅ Usar `formatDeltaPercent()` o nueva función documentada aquí
   - ❌ Calcular delta manualmente sin función reutilizable

4. **Backend: generar respuesta JSON con montos**
   - ✅ Acumular con `Decimal`, serializar a float en JSON
   - ❌ Usar float en acumulaciones intermedias

### Colaboración con Otras Skills

- **performance:** Algunos formatters (`toLocaleString`) pueden ser lentos en listas grandes; usar con `useMemo` o virtualization
- **vercel-react-best-practices:** Pasar strings formateados (nunca funciones) a componentes hijos, recordar usar `useMemo` para valores calculados
- **accessibility:** Formatters generan texto; ensure aria-label text incluye formato legible ("Twenty-three point five percent" no "23.5%")

---

## Referencia Rápida

| Dato | Función | Entrada | Salida |
|------|---------|---------|--------|
| Monto USD | `formatCurrency(1500)` | 1500 | "$1,500" |
| Margen % | `formatPercent(23.5)` | 23.5 | "23.5%" |
| Categoría | `formatCategoryLabel("suppliers")` | "suppliers" | "Suppliers" |
| Operación | `formatOperationTypeLabel("income")` | "income" | {label, icon, color} |
| Período | `formatPeriodLabel("2025-01-01", "2025-01-31")` | dates | "January 1 - 31, 2025" |
| Delta % | `formatDeltaPercent(1000, 1200)` | previous, current | "20.0%" |

---

## Notas de Mantenimiento

- **Review en PRs:** Si PR modifica formato visual de número, pedir que use función de esta skill (no valor literal)
- **Cambios de locale futuro:** Funciones Intl.* están preparadas para parámetro de locale; al soportar español/otros, actualizar `'en-US'` a parámetro dinámico
- **Precisión Decimal en backend:** No es urgente (números son pequeños actualmente), pero documentar cuando sea crítica (ej: 7+ dígitos de precisión)
- **Tests de regresión visual:** Si cambias tonos/colores en formatOperationTypeLabel, correr UI test de componentes dependientes (KPI cards, charts)
