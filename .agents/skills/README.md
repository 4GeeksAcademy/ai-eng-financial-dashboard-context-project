# Skills del Dashboard Financiero

Esta carpeta contiene skills (guías accionables) para el desarrollo del dashboard financiero. Las skills se organizan en dos categorías:

## 📚 Skills Comunitarias (Externas)

Instaladas desde comunidades de código abierto.

### 1. **accessibility** (WCAG 2.2)
- **Ubicación:** `accessibility/SKILL.md`
- **Status:** ✅ Implementada
- **Cubre:** Navegación por teclado, ARIA labels, contraste visual, texto alternativo
- **Referencia:** `accessibility/references/WCAG.md`
- **Resultado:** 95% conformidad WCAG AA implementada
- **Archivos modificados:** 7 (index.html, index.css, 5 componentes React, App.tsx)

### 2. **vercel-react-best-practices** (68 reglas)
- **Ubicación:** `vercel-react-best-practices/SKILL.md`
- **Status:** ✅ Auditada, mejoras aplicadas
- **Cubre:** Code-splitting, next/image, metadata, renderizado optimizado
- **Reglas:** Organizadas en subdirectories por tema (bundle, rendering, etc.)
- **Uso:** Referencia durante PRs con cambios React/Next.js

### 3. **performance** (Core Web Vitals)
- **Ubicación:** `performance/SKILL.md`
- **Status:** ✅ Auditada, mejoras aplicadas
- **Cubre:** LCP, CLS, INP, optimizaciones de bundle, lazy loading
- **Referencia:** `performance/references/MEASUREMENT.md` (methodology)

---

## 🏠 Skills Internas (Proyecto)

Creadas específicamente para las convenciones y necesidades de este dashboard.

### 4. **financial-data-formatting** ⭐ NUEVA
- **Ubicación:** `financial-data-formatting.md` (439 líneas)
- **Status:** ✅ Creada, lista para usar
- **Propósito:** Convenciones estándar para formateo de datos monetarios, porcentajes y métricas
- **Cubre:**
  - Formateo de montos USD (`formatCurrency()`)
  - Porcentajes de rentabilidad (`formatPercent()`)
  - Mapeo de categorías técnicas a UI (`formatCategoryLabel()`)
  - Colores e iconos por tipo de operación (`formatOperationTypeLabel()`)
  - Períodos y fechas (`formatPeriodLabel()`)
  - Variación porcentual (`formatDeltaPercent()`)
- **Criterios:** 5 verificables (C1-C5)
- **Valor:** Dominio-específico para financiero (no cubierto por skills comunitarias)
- **Usar cuando:** Se agreguen componentes con datos financieros, se cambien formatos, se implementen nuevas métricas

---

## 🎯 Documentación de Apoyo

### FINANCIAL_SKILL_SUMMARY.md
- **Propósito:** Resumen ejecutivo de por qué la skill aporta valor
- **Contenido:** Cobertura actual, criterios de aceptación, próximos pasos
- **Leer:** Antes de crear PR con datos financieros

### ECOSYSTEM_MAP.md
- **Propósito:** Visión holística de los 3 layers (Accesibilidad → Performance → Lógica)
- **Contenido:** Mapa de integración, checklist de uso, roadmap
- **Leer:** Para entender cómo se interconectan las skills

### memory-bank/productContext.md
- **Propósito:** Referencia centralizada del proyecto
- **Incluye:** Descripción de skills internas bajo sección "Skills Internas del Proyecto"
- **Leer:** Para onboarding de nuevos desarrolladores

---

## 🚀 Cómo Usar Las Skills

### En Componentes Nuevos
```typescript
// Importar formatters de skill financial-data-formatting
import { formatCurrency, formatPercent } from "@/lib/financial-utils";

export function MyMetric({value}: {value: number}) {
  return <span>{formatCurrency(value)}</span>;
}
```

### En Tests
```typescript
// Validar que formato es consistente
it("displays income formatted as currency", () => {
  expect(screen.getByText("$1,500")).toBeInTheDocument();
});
```

### En PRs
1. **Accesibilidad:** ¿Tiene aria-labels en iconos/imágenes? ¿Contraste >= 4.5:1?
2. **Performance:** ¿Usa code-splitting para gráficos? ¿Lazy loading?
3. **Financiero:** ¿Usa formatCurrency()? ¿Tiene tests? ¿Validación de entrada?

---

## 📋 Checklist para PRs

```markdown
## Skills a Aplicar

- [ ] ¿Cambios en componentes visuales?
  → Revisar: accessibility (a11y), performance (bundle)

- [ ] ¿Cambios en datos financieros?
  → Revisar: financial-data-formatting (formateo, precisión)

- [ ] ¿Cambios en rutas/servidor Next.js?
  → Revisar: vercel-react-best-practices (68 reglas)

- [ ] ¿Cambios en bundle size o lazy loading?
  → Revisar: performance (Core Web Vitals)

- [ ] ¿Tests incluidos?
  → Para financial-data-formatting: Vitest + casos edge
  → Para componentes: Verificar a11y con @testing-library/react
```

---

## 🔗 Referencias Cruzadas

| Si trabajas en... | Consulta... |
|------------------|------------|
| Componentes React nuevos | vercel-react-best-practices, accessibility |
| Datos monetarios / porcentajes | financial-data-formatting |
| Gráficos | performance (lazy loading), accessibility (aria-label) |
| Formularios | accessibility (labels, ARIA), financial-data-formatting (validación) |
| Backend API | financial-data-formatting (Decimal vs float) |

---

## 🎓 Onboarding para Nuevos Devs

1. Leer: `memory-bank/productContext.md` → Contexto del proyecto
2. Leer: `ECOSYSTEM_MAP.md` → Visión de skills (5 min)
3. Revisar: `financial-data-formatting.md` → Funciones + ejemplos (10 min)
4. Consultar: Según tipo de tarea (componente, métrica, tests)

---

## 📞 Soporte

- **¿Duda sobre formateo?** → Ver `financial-data-formatting.md` (sección "Referencia Rápida")
- **¿Duda sobre a11y?** → Ver `accessibility/SKILL.md` + `references/WCAG.md`
- **¿Duda sobre performance?** → Ver `performance/SKILL.md` + `references/MEASUREMENT.md`
- **¿Agregar nueva métrica?** → Extender `financial-data-formatting.md` (ver sección "C4: Documentación de Nuevos Formatters")

---

## 🌱 Versionado

Skills internas se versionan con el proyecto en git. Las comunitarias se mantienen como referencias (no comprometidas al repositorio, solo enlaces).

- **Cambios en financial-data-formatting?** → Actualizar versión en comentario de archivo
- **Cambios en criterios C1-C5?** → Documentar en FINANCIAL_SKILL_SUMMARY.md
- **Nuevos formatters?** → Agregar a financial-data-formatting + extender ECOSYSTEM_MAP.md roadmap

---

**Última actualización:** 2025-01-16 | **Status:** ✅ Activo
