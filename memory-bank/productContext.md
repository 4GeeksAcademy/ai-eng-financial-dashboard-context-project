# Product Context

## Resumen del producto

Este proyecto implementa un dashboard de metricas financieras para visualizar ingresos, egresos y rentabilidad en una vista ejecutiva. El frontend presenta KPIs y graficas de evolucion mensual. El backend expone una API de metricas y analitica sobre movimientos financieros.

Actualmente el producto opera con datos simulados deterministas (seed fija) generados en el backend, sin persistencia en base de datos.

## Problemas financieros que resuelve

- Consolidar en una sola vista ingresos y egresos acumulados.
- Mostrar rentabilidad total y margen de ganancia.
- Detectar variaciones de gasto y posibles alertas de aumento en outcome.
- Permitir segmentacion analitica por fecha, categoria, tipo de operacion y tipo de negocio (B2B/B2C) desde la API.
- Comparar periodos para medir variacion absoluta y porcentual del resultado neto.

## Usuarios objetivo

- Perfil ejecutivo o de analisis de negocio que necesita lectura rapida del estado financiero.
- Equipos tecnicos que consumen API de metricas para construir visualizaciones o reportes.

## Alcance funcional actual

### Lo que ya esta implementado en UI

- Carga de datos desde endpoint de metricas.
- Render de 4 KPIs:
  - Total Income
  - Total Outcome
  - Profit
  - Profit Margin
- Grafica de linea Income vs Outcome por mes.
- Grafica de linea de Profit Margin por mes.
- Estado loading con skeletons.
- Estado de error de carga en pantalla.

### Lo que ya esta implementado en API

- Healthcheck: status del servicio.
- Listado base de movimientos con filtros por fecha, categoria y tipo.
- Facetas para construir filtros (categorias, operation types, business types, min/max date).
- Resumen agrupado por dia, semana o mes.
- Top categorias por tipo de operacion.
- Comparacion de periodos (actual vs previo).
- Alertas por incremento de outcome contra baseline historico.
- Endpoints dedicados para B2B y B2C.

### Limites actuales del alcance

- No hay autenticacion ni autorizacion.
- No existe multi-tenant ni control por organizacion.
- No hay persistencia real de movimientos (solo mock generado en runtime).
- La UI actual consume solo el endpoint base de metricas; no consume facetas, summary, comparison o alerts.
- El periodo visible en cabecera esta hardcodeado.

## Valor actual entregado

- Entrega una base funcional de dashboard financiero con UX limpia.
- Ofrece una API de analitica util para evolucionar hacia producto real con datos persistentes.
- Incluye pruebas automatizadas que validan flujos principales de calculo y endpoints.

## Oportunidades de evolucion de producto

- Integrar fuentes de datos reales (ERP, contabilidad, facturacion).
- Agregar filtros interactivos en UI conectados a facetas y summary del backend.
- Agregar vistas comparativas y alertas en frontend usando endpoints ya existentes.
- Definir perfiles de usuario y acceso por rol.
- Incorporar historico de cierres mensuales y exportacion de reportes.

---

## Skills Internas del Proyecto

### financial-data-formatting (v1.0)

**Ubicación:** `.agents/skills/financial-data-formatting.md`

**Propósito:** Convenciones estándar de formateo para datos monetarios, porcentajes y métricas ejecutivas.

**Cubre:**
- Formateo de montos USD (sin decimales por defecto)
- Porcentajes de rentabilidad (1-2 decimales según contexto)
- Mapeo de categorías técnicas a etiquetas UI
- Colores e iconos por tipo de operación (income/outcome)
- Períodos y variación porcentual

**Funciones principales:**
- `formatCurrency(value: number)` → "$1,500"
- `formatPercent(value: number)` → "23.5%"
- `formatCategoryLabel(category: Category, context?)` → "Suppliers"
- `formatOperationTypeLabel(type: OperationType)` → {label, icon, color}
- `formatPeriodLabel(start: Date, end: Date)` → "January 1 - 31, 2025"
- `formatDeltaPercent(previous: number, current: number)` → "+20.0%"

**Criterios de aceptación:** 5 (C1-C5) verificables en SKILL.md

**Oportunidad de valor:** Resuelve problemas de formateo disperso, precisión numérica backend (Decimal), y extensibilidad para nuevas métricas.

**Usar en PRs cuando:** Se agreguen componentes con datos financieros, se cambien formatos visuales, se implementen nuevas métricas.
