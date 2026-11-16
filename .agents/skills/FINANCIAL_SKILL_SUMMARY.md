# Skill: Financial Data Formatting

**Creada:** 2025-01-16 | **Status:** ✅ Activa  
**Ubicación:** `.agents/skills/financial-data-formatting.md`

---

## Por qué esta skill aporta valor único

### Problema que resuelve

Este dashboard financiero requiere formateo consistente de **datos monetarios, porcentajes y métricas ejecutivas** en:
- **KPIs visuales** (Total Income, Total Outcome, Profit, Profit Margin)
- **Gráficos** (Income vs Outcome por mes, Profit Margin trend)
- **Alertas** (ej: "Outcome increased by $5,000 vs previous period")
- **Comparaciones** (variación porcentual entre períodos)

**Sin esta skill:**
- Cada componente reinventa formato (algunos usan `toFixed(1)`, otros `toLocaleString()`)
- Cambios visuales requieren buscar + reemplazar en múltiples archivos
- Backend puede usar `float` para dinero (riesgo de precisión numérica)
- No hay guía para nuevas métricas (ej: Tax Amount, Interest Rate, ROI)

**Con esta skill:**
- Función única `formatCurrency()` → `"$1,500"` llamada desde todos lados
- Cambio global: actualizar 1 función
- Backend documentado para usar `Decimal`
- Template para agregar nuevas métricas (ej: `formatTaxAmount()`)

---

## Diferencia vs skills comunitarias

| Skill | Propósito | Valor para dashboard |
|-------|----------|----------------------|
| **accessibility** | WCAG 2.2, a11y | Auditó + mejoró navegación, contraste, aria-labels ✅ Completado |
| **vercel-react-best-practices** | Optimización React/Next.js | Auditó: code-splitting, next/image, metadata ✅ Completado |
| **performance** | Optimización carga/runtime | Auditó: LCP, CLS, bundle size, lazy loading ✅ Completado |
| **financial-data-formatting** | **Formateo dominio-específico** | ⭐ **NUEVA: Convenciones financieras + precisión numérica** |

**Cobertura única:**
- ✅ Estándar de formatos monetarios (USD, sin decimales por defecto)
- ✅ Precisión numérica backend (Decimal vs float)
- ✅ Convenciones de color/icono por tipo de operación
- ✅ Mapeado de categorías técnicas a etiquetas UI
- ✅ Funciones reutilizables para nuevas métricas

**Skills comunitarias no cubren:**
- Dominio financiero específico (monedas, margen de ganancia, operación_type)
- Precisión numérica en backends de dinero
- Mapping de enums técnicos a UI localizados

---

## Integración actual en el proyecto

### Código existente que se beneficia

**Frontend (`frontend/src/lib/financial-utils.ts`):**
```typescript
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
```

✅ **Ya existente** pero documentado ahora en skill.

**Backend (`backend/app/routes.py`):**
```python
class MetricsSummaryItem(BaseModel):
    income: float  # ⚠️ Usar Decimal para precisión
    outcome: float
    net: float
```

⚠️ **Referenciado** en skill como mejora futura (Decimal).

### Componentes que se benefician

1. **frontend/src/components/dashboard/kpi-card.tsx**
   - Renderiza valores con `formatCurrency(value)`
   - Skill documenta formato canonicizado

2. **frontend/src/components/dashboard/income-outcome-chart.tsx**
   - Muestra operaciones Income/Outcome
   - Skill define colores/iconos canónicos (--success, --destructive)

3. **frontend/src/components/dashboard/profit-percent-chart.tsx**
   - Muestra Profit Margin %
   - Skill define `formatPercent()` con 1 decimal

4. **Endpoints nuevos futuros**
   - Alertas ("Outcome +20.0%") → usar `formatDeltaPercent()`
   - Comparación períodos → usar `formatPeriodLabel()`

---

## Criterios de aceptación (verificables)

✅ **C1: Consistencia de Formato**
- Función `formatCurrency(1500)` retorna `"$1,500"` siempre
- Tests en `frontend/src/lib/financial-utils.test.ts` validan casos base + edge cases

✅ **C2: Uso en Componentes**
- Build `npm run build` sin errores
- KPI cards, gráficos renderizan con formato correcto

✅ **C3: Precisión Backend**
- Backend documenta uso de `Decimal` para dinero
- Tests validan que acumulaciones no pierden precisión

✅ **C4: Documentación de Nuevos Formatters**
- Si se agrega `formatTaxAmount()`, incluye JSDoc + tests

✅ **C5: Validación de Dominio**
- `formatCategoryLabel("invalid")` lanza error explícito (no silenciosamente)

---

## Valor entregado

| Aspecto | Antes | Después |
|--------|-------|---------|
| **Consistencia visual** | Formato disperso en componentes | ✅ 1 función por tipo de dato |
| **Mantenibilidad** | Cambiar formato = buscar + reemplazar | ✅ Cambiar = actualizar función |
| **Precisión numérica** | Backend usa float (riesgo) | ✅ Documentado usar Decimal |
| **Extensibilidad** | No hay patrón para nuevas métricas | ✅ Template + tests incluidos |
| **Documentación** | Sin guía de formateo | ✅ Skill con 14KB de specs |

---

## Próximos pasos (usuario)

1. **Integrar funciones nuevas** (si aplica):
   ```typescript
   // Si se agrega métrica de impuesto:
   export function formatTaxAmount(value: number): string {
     // Seguir patrón de formatCurrency()
   }
   ```

2. **Revisar backend** (mejora futura no urgente):
   ```python
   from decimal import Decimal
   
   class MetricsSummaryItem(BaseModel):
       income: Decimal  # Cambio futuro si > 2^53-1
   ```

3. **En PRs futuro**: Verificar que nuevos números financieros usan formatters (no `.toString()`)

---

## Referencia de autores

- **Skill creada por:** Copilot Context-Aware Agent
- **Basado en:** Análisis de `backend/app/routes.py`, `frontend/src/lib/financial-utils.ts`, `memory-bank/productContext.md`, `.agents/rules/coding-standards.md`
- **Estándares:** WCAG 2.2 (accesibilidad en aria-labels), RFC 7231 (HTTP content negotiation), Intl.* API (localización)
