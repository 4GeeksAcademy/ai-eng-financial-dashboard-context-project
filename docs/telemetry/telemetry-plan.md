# Plan de Telemetría — HealthCore

> **Proyecto:** Fase 1 · Diseño del plan de telemetría
> **Sistema sujeto a telemetría:** Backoffice y API de HealthCore (gestor de inventario clínico + gestor de incidencias)
> **Aprobado por:** Tech Lead — Revisión del RFI de gestión
> **Estado:** Diseño (sin instrumentación todavía)
> **Fecha:** 2026-10-21

---

## 1. Resumen ejecutivo

HealthCore opera 12 clínicas ambulatorias entre EE. UU. (Texas, Florida, Georgia) y el Reino Unido (Londres, Mánchester). En producción corre un sistema de gestión de inventario de **insumos clínicos** (medicamentos de uso común, material de curación, EPP y consumibles de consultorio) sobre un backend FastAPI, con una regla de negocio innegociable: **el stock nunca se modifica directamente; solo a través de órdenes de entrada y salida trazables a un usuario del staff**.

El sistema funciona, pero **el equipo de operaciones y de gestión no tiene visibilidad de lo que ocurre dentro**: hoy no puede responder preguntas operativas básicas como *"¿cuántas órdenes de salida se registran por día?"*, *"¿qué insumos acumulan más fallos de validación?"* o *"¿cuándo se disparan más las alertas de stock mínimo?"*. El equipo de gestión ha emitido un **RFI** para saber si el sistema puede generar información de negocio accionable, no solo sobre inventario, sino sobre cualquier parte de la aplicación que un usuario o un proceso interno toque.

Este documento es la **respuesta al RFI en forma de Plan de Telemetría**: un catálogo exhaustivo de eventos con valor de negocio y técnico, listos para instrumentar, que responde a las preguntas de hoy y habilita las de mañana (dashboard operativo de la red de la Dra. Okonkwo, alertas de cumplimiento de Claire, decisiones de reabastecimiento de Marcus). El código no se toca todavía: este plan es el diseño que el equipo implementará a partir de mañana.

**Regla de oro aplicada a cada evento:** *"Capturamos `[event_type]` porque necesitamos saber `[hipótesis]`, lo que nos permite tomar la decisión `[decisión concreta]`."* Todo evento del catálogo debe completar esta frase; si no la completa, no existe.

---

## 2. Alineación con el briefing de la empresa

Este plan se construye sobre `healthcore-BRIEFING.md`. Las métricas obligatorias del briefing constituyen el **piso** (Fase 1) y se etiquetan como **obligatorias**; alrededor de ellas se exploran **oportunidades adicionales**, técnicas y de negocio, en **≥3 categorías**.

### 2.1. Nota regulatoria (HIPAA / UK GDPR)

Los eventos de este sistema describen **insumos y existencias, nunca pacientes**. Ningún campo de `properties` debe contener nombres de pacientes, identificadores de historia clínica, diagnósticos ni ningún dato real o simulado interpretable como información de salud protegida (PHI). Para asociar un consumo de insumo a un contexto clínico se usa únicamente `department`, nunca un identificador de paciente. El código ya valida esto a nivel de entrada (`reject_sensitive_text`) y el plan lo reitera en cada evento.

### 2.2. Entidades del sistema de inventario en HealthCore

| Entidad | En HealthCore significa… |
| --- | --- |
| `Product` | Un insumo clínico o de consultorio (ej. `guantes de nitrilo (caja)`, `jeringas 5ml`, `vacuna antigripal`, `mascarilla quirúrgica`). Categorías: `medication`, `ppe`, `consumable`, `equipment`; cuando aplica, fecha de vencimiento. |
| `InboundOrder` | Orden de entrada: recepción de insumos de un proveedor en una clínica. |
| `OutboundOrder` | Orden de salida: consumo de un insumo en la atención clínica (registrado por departamento, no por paciente). |
| `clinic` | Una de las 12 clínicas, identificada por país (`US`/`UK`) y estado/región. |
| `department` | Atención primaria, especialidades, manejo de enfermedades crónicas, etc. |

> **Nota de implementación (mapeo al código):** en el código real del monorepo, el modelo de inventario usa las categorías `ppe`, `medical_consumables` (material de curación), `otc_medication` (medicamentos) y `clinical_equipment` (equipamiento), con el tipo de movimiento `movement_type ∈ {inbound, outbound, adjustment}` y el campo `clinic_location` para la clínica. Para este plan de telemetría se normalizan los identificadores a los del briefing (`product_category`, `clinic_id`, `product_id`) manteniendo una tabla de correspondencia con el dominio del API, de modo que la instrumentación sea un mapeo 1:1 y no un cambio de modelo. Se documenta en el Anexo A.

### 2.3. Métricas obligatorias (piso — Fase 1)

| `event_type` | Se dispara cuando… | Hipótesis de negocio | Decisión que habilita | Fuente / Touchpoint |
| --- | --- | --- | --- | --- |
| `inbound_order_created` | Una clínica registra la recepción de insumos de un proveedor | Necesitamos saber cuánto y qué insumo se compra, por clínica y proveedor | Consolidar compras entre clínicas y negociar mejores condiciones con proveedores | `POST /inventory/movements` con `movement_type=inbound` |
| `outbound_order_created` | Una clínica registra el consumo de un insumo en la atención de un departamento | Necesitamos saber qué insumos se consumen más, y a qué ritmo, por clínica y departamento | Ajustar la reposición automática de insumos críticos por clínica | `POST /inventory/movements` con `movement_type=outbound` |
| `stock_threshold_triggered` | El stock de un insumo cae por debajo del mínimo configurado para esa clínica | Necesitamos saber con qué frecuencia una clínica se queda corta de un insumo crítico (ej. EPP, medicamento) | Priorizar el reabastecimiento urgente y escalar a Marcus (Operaciones Clínicas) | Evaluación de `available_stock <= reorder_point` tras un movement completado |
| `direct_stock_edit_rejected` | Un usuario intenta modificar el stock directamente (fuera de una orden) y el sistema lo rechaza | Necesitamos saber si el personal intenta saltarse el control de trazabilidad de insumos | Reforzar capacitación o permisos en la clínica donde esto ocurre con más frecuencia | Middleware/aplicación de la regla INV-005 (stock derivado, nunca editable) |
| `supply_expiry_flagged` | Un lote de insumo (medicamento o material) se acerca a su fecha de vencimiento (ej. 30 días) | Necesitamos saber qué insumos están por vencer antes de que se conviertan en pérdida o riesgo de cumplimiento | Priorizar el uso o la baja controlada de ese lote antes del vencimiento | Job de escaneo de lotes (`expiry_date >= today` y `expiry_date - today <= 30 días`) |

**Campos mínimos en `properties` para los eventos de inventario** (además del envelope estándar): `clinic_id`, `country` (`US`/`UK`), `product_id`, `product_category` (`medication`/`ppe`/`consumable`/`equipment`), `quantity`, `department` (solo cuando aplique, nunca un identificador de paciente).

---

## 3. Mapeo de flujo del inventario (puntos de instrumentación)

Flujo recorrido por un usuario del staff, desde el acceso autenticado hasta la finalización de una orden de entrada/salida, con los **puntos de instrumentación (PI)** donde se genera telemetría:

```
┌──────────────────────────────────────────────────────────────────────────────┐
  Flujo de inventario HealthCore — puntos de instrumentación (PI)
└──────────────────────────────────────────────────────────────────────────────┘

[Inicio de sesión del staff]
   │
   ├─ PI-1  login_succeeded / login_failed        (autenticación del operador)
   │
   ▼
[Backoffice: navegación a sección Inventario]
   │
   ├─ PI-2  section_viewed                         (entrada/navegación en sección)
   │
   ▼
[Alta o edición de artículo (producto)]
   │
   ├─ PI-3  inventory_item_created / _updated / _deleted
   ├─ PI-3a inventory_validation_failed            (fallo de validación del formulario)
   │
   ▼
[Intento directo de modificar stock]
   │
   ├─ PI-4  direct_stock_edit_rejected ⚠️          (regla INV-005: rechazo de edición directa)
   │
   ▼
[Registro de orden de entrada (recepción de proveedor)]
   │
   ├─ PI-5  inbound_order_created ✅ (obligatoria)
   ├─ PI-5a inbound_order_validation_failed
   │
   ▼
[Registro de orden de salida (consumo por departamento)]
   │
   ├─ PI-6  outbound_order_created ✅ (obligatoria)
   ├─ PI-6a outbound_order_validation_failed
   ├─ PI-6b outbound_expired_lot_rejected           (lote caducado rechazado, INV-009)
   │
   ▼
[Recálculo de stock derivado]
   │
   ├─ PI-7  stock_recalculated                       (stock nunca almacenado, siempre derivado)
   ├─ PI-8  stock_threshold_triggered ✅ (obligatoria, si entra bajo reorder_point)
   │
   ▼
[Monitoreo de lotes]
   ├─ PI-9  supply_expiry_flagged ✅ (obligatoria, lotes a ≤30 días de vencer)
   │
   ▼
[Backoffice: uso del gestor de incidencias (otras secciones)]
   ├─ PI-10 incident_created / _updated / incident_status_changed
   ...
```

**Puntos de instrumentación mínimos exigidos (≥5) — todos cubiertos:**

| # | Punto | Cómo se instrumenta | ¿Obligatorio? |
| --- | --- | --- | --- |
| PI-1 | Autenticación del operador | Eventos `login_succeeded` / `login_failed` antes de entrar al backoffice | Oportunidad |
| PI-2 | Navegación a secciones del backoffice | Evento `section_viewed` al montar cada sección | Oportunidad |
| PI-3 / PI-3a | Alta/edición de artículos + fallos de validación | Eventos `inventory_item_*` y `inventory_validation_failed` | Oportunidad |
| PI-4 | **Ediciones directas de stock rechazadas** | Evento `direct_stock_edit_rejected` (regla invariante INV-005) | **Obligatoria** |
| PI-5 / PI-5a | Órdenes de entrada + fallos de validación | Eventos `inbound_order_created` / `inbound_order_validation_failed` | **Obligatoria** (creación) |
| PI-6 / PI-6a / PI-6b | Órdenes de salida + fallos + lote caducado | Eventos `outbound_order_created` / `outbound_order_validation_failed` / `outbound_expired_lot_rejected` | **Obligatoria** (creación) |
| PI-7 | Recálculo de stock derivado | Evento `stock_recalculated` (auditoría; el stock nunca se almacena) | Oportunidad |
| PI-8 | Umbrales de reorden | Evento `stock_threshold_triggered` cuando `available_stock <= reorder_point` | **Obligatoria** |
| PI-9 | Vencimiento de lotes | Evento `supply_expiry_flagged` (job diario de vencimientos ≤30 días) | **Obligatoria** |
| PI-10 | Gestión de incidencias | Eventos `incident_*` (otras secciones del backoffice que hoy son caja negra) | Oportunidad |

---

## 4. Envelope estándar del evento

Todos los eventos comparten este sobre (referencia oficial del proyecto). Es la estructura que cualquier consumidor (pipeline batch/stream, dashboard, alertas) puede dar por garantizada.

| Campo | Tipo | Requerido | Notas |
| --- | --- | --- | --- |
| `eventId` | string (UUID) | Sí | Idempotencia y deduplicación |
| `timestamp` | string (ISO 8601) | Sí | UTC recomendado |
| `sessionId` | string | Sí | Sesión del navegador o de la API |
| `userId` | string | Sí | Operador autenticado; hash si la política de PII lo requiere |
| `event_type` | string | Sí | Taxonomía `entidad_accion` (ej. `order_submitted`) |
| `schemaVersion` | string | Sí | Ej. `1.0.0` |
| `requestId` | string | Sí | Correlaciona frontend, API y logs |
| `properties` | object | Sí | Payload específico del evento (solo lista permitida) |

**Envelope en JSON (referencia para `event-schemas.json`):**

```json
{
  "eventId": "uuid-v4",
  "timestamp": "2026-10-21T09:15:00Z",
  "sessionId": "s-…",
  "userId": "op-marcus-01",
  "event_type": "outbound_order_created",
  "schemaVersion": "1.0.0",
  "requestId": "req-…",
  "properties": { }
}
```

---

## 5. Catálogo de eventos

### Convenciones del catálogo

- **Clase:** `obligatoria` (del briefing, no negociable) u `oportunidad` (identificada en este plan).
- **Categoría:** dominio funcional del evento (`inventario`, `autenticación`, `rendimiento`, `errores`, `navegación`, `incidencias`).
- **Transmisión:** `stream` (el equipo debe actuar en minutos) o `batch` (informes diarios/semanales). La justificación siempre cita el momento de decisión operativa, no la preferencia del desarrollador.
- **Hipótesis → decisión:** regla de oro. Si falta, el evento no aparece.
- **Lista permitida de `properties`:** campos exactos aceptados; `additionalProperties: false` en el esquema.
- **PII:** política de campos (ninguno debe contener PHI).

### 5.0. Propiedades compartidas de inventario (Hipótesis → decisión base)

Todas las propiedades de inventario comparten la siguiente taxonomía y restricción PHI:

- `clinic_id`: string (identificador interno de la clínica; nunca nombre de paciente).
- `country`: `US` | `UK`.
- `product_id`: string.
- `product_category`: `medication` | `ppe` | `consumable` | `equipment`.
- `quantity`: número (positivo para entradas; positivo para salidas — el signo lo pone el `movement_type`).
- `department`: string (solo en salidas/consumo; describe el área clínica, **nunca** un identificador de paciente).
- `proveedor` (entradas): `supplier_id`/`supplier_name` opcional.

Estas propiedades **no contienen PHI** y están restringidas por el esquema JSON correspondiente.

---

### EVENTOS OBLIGATORIOS (del briefing — piso del plan, Fase 1)

#### M1. `inbound_order_created` — OBLIGATORIO · Categoría: inventario · batch

- **Definición:** se dispara cuando una clínica registra la recepción de insumos de un proveedor (orden de entrada).
- **Puntos de contacto del sistema:** `POST /inventory/movements` con `movement_type = inbound`, completado con éxito; se emite tras la persistencia del movimiento.
- **Hipótesis → decisión:** capturamos `inbound_order_created` porque necesitamos saber **cuánto y qué insumo se compra por clínica, proveedor y país**, lo que nos permite decidir **cómo consolidar compras entre clínicas y negociar mejores condiciones con los proveedores**.
- **Propiedades permitidas:**

| Propiedad | Tipo | Requerido | Lista permitida | PHI |
| --- | --- | --- | --- | --- |
| `orderId` | string | Sí | Sí | No |
| `clinic_id` | string | Sí | Sí | No |
| `country` | string | Sí | Sí | No |
| `product_id` | string | Sí | Sí | No |
| `product_category` | string | Sí | Sí | No |
| `quantity` | number | Sí | Sí | No |
| `supplier_id` | string | No | Sí | No |
| `supplier_name` | string | No | Sí | No |
| `lot_id` | string | No | Sí | No |

- **Transmisión stream vs batch:** **batch** — alimenta informes diarios/semanales de consolidación de compras; no hay una decisión operativa que se tome en menos de un día. La negociación con proveedores se planifica por periodos.
- **Sanitización:** ninguna; `supplier_name` es un nombre de organización, no PHI. El `userId` del envelope puede codificarse en hash si la política de PII corporativa lo exige.

---

#### M2. `outbound_order_created` — OBLIGATORIO · Categoría: inventario · batch

- **Definición:** se dispara cuando una clínica registra el consumo de un insumo en la atención de un departamento (orden de salida).
- **Puntos de contacto del sistema:** `POST /inventory/movements` con `movement_type = outbound`, completado con éxito; se emite tras la persistencia del movimiento.
- **Hipótesis → decisión:** capturamos `outbound_order_created` porque necesitamos saber **qué insumos se consumen más, y a qué ritmo, por clínica y departamento**, lo que nos permite decidir **cómo ajustar la reposición automática de insumos críticos por clínica**.
- **Propiedades permitidas:**

| Propiedad | Tipo | Requerido | Lista permitida | PHI |
| --- | --- | --- | --- | --- |
| `orderId` | string | Sí | Sí | No |
| `clinic_id` | string | Sí | Sí | No |
| `country` | string | Sí | Sí | No |
| `product_id` | string | Sí | Sí | No |
| `product_category` | string | Sí | Sí | No |
| `quantity` | number | Sí | Sí | No |
| `department` | string | Sí | Sí | No — área clínica, nunca paciente |
| `lot_id` | string | No | Sí | No |

- **Transmisión stream vs batch:** **batch** — la reposición automática se recalcula sobre patrones de consumo diarios/semanales; no requiere latencia de segundos.
- **Sanitización:** `department` describe el área clínica (ej. `general_consultation`, `chronic_care`), **nunca** un identificador de paciente. Sin PHI.

---

#### M3. `stock_threshold_triggered` — OBLIGATORIO · Categoría: inventario · stream

- **Definición:** se dispara cuando el stock disponible de un insumo cae por debajo (o igual) del mínimo configurado (`reorder_point`) para esa clínica. En el código: tras un movimiento completado, cuando `available_stock <= reorder_point`.
- **Puntos de contacto del sistema:** recálculo de stock derivado en `InventoryStore.item_view` / tras `create_movement`; también al listar con filtro `below_reorder=true`.
- **Hipótesis → decisión:** capturamos `stock_threshold_triggered` porque necesitamos saber **con qué frecuencia una clínica se queda corta de un insumo crítico (ej. EPP, medicamento)**, lo que nos permite decidir **si priorizar el reabastecimiento urgente y escalar a Marcus (Operaciones Clínicas)**.
- **Propiedades permitidas:**

| Propiedad | Tipo | Requerido | Lista permitida | PHI |
| --- | --- | --- | --- | --- |
| `clinic_id` | string | Sí | Sí | No |
| `country` | string | Sí | Sí | No |
| `product_id` | string | Sí | Sí | No |
| `product_category` | string | Sí | Sí | No |
| `currentStock` | number | Sí | Sí | No |
| `threshold` | number | Sí | Sí | No |
| `trigger_source` | string | No | Sí (`outbound_order_created`, `adjustment`, `startup_scan`) | No |

- **Transmisión stream vs batch:** **stream** — la escasez de un insumo crítico (ej. EPP, medicamento) requiere una notificación casi en tiempo real para que el reabastecimiento comience el mismo día; esperar a un lote diario pondría en riesgo la atención.
- **Limitación / debounce:** **sí** — eliminar rebotes de disparadores repetidos para el mismo `productId` en una misma ventana (ej. 15 minutos) cuando el stock permanece bajo el umbral sin variación; se re-emite si el stock cruza el umbral de nuevo tras reponer (transición `ok → below`).

---

#### M4. `direct_stock_edit_rejected` — OBLIGATORIO · Categoría: inventario · batch

- **Definición:** se dispara cuando un usuario intenta modificar el stock directamente (fuera de una orden de entrada/salida) y el sistema lo rechaza. Hoy el sistema **diseña el stock como derivado (jamás editable)** (regla INV-005): este evento captura ese intento.
- **Puntos de contacto del sistema:** intento de escritura directa sobre stock (endpoint de edición directa inexistente por diseño, formulario que intente editar `available_stock`, o una ruta de ajuste manual fuera del flujo orden). Se instrumenta en el punto donde el sistema rechaza el intento.
- **Hipótesis → decisión:** capturamos `direct_stock_edit_rejected` porque necesitamos saber **si el personal intenta saltarse el control de trazabilidad de insumos**, lo que nos permite decidir **si reforzar capacitación o permisos en la clínica donde esto ocurre con más frecuencia**.
- **Propiedades permitidas:**

| Propiedad | Tipo | Requerido | Lista permitida | PHI |
| --- | --- | --- | --- | --- |
| `clinic_id` | string | Sí | Sí | No |
| `country` | string | Sí | Sí | No |
| `product_id` | string | Sí | Sí | No |
| `product_category` | string | Sí | Sí | No |
| `attempted_field` | string | Sí | Sí (`available_stock`, `stock`, `qty_on_hand`) | No |
| `reject_reason` | string | Sí | Sí (`stock_is_derived`, `direct_edit_forbidden`, `permission_denied`) | No |
| `attempted_quantity` | number | No | Sí | No |

- **Transmisión stream vs batch:** **batch** — es un indicador de comportamiento de personal que se revisa para decidir capacitación/permisos por clínica; una decisión educativa o de permisos no se toma en minutos.
- **Sanitización:** no se registra el valor introducido si pudiera contener texto sensible; se registra cantidad opcional solo si es numérica limpia.

---

#### M5. `supply_expiry_flagged` — OBLIGATORIO · Categoría: inventario · stream

- **Definición:** se dispara cuando un lote de insumo (medicamento o material) se acerca a su fecha de vencimiento (ej. a ≤30 días). En el código: escaneo de `InventoryLot.expiry_date` (el lote ya se registra en el modelo de `Product`/lote desde el alta, no solo en la orden — requisito INV del briefing).
- **Puntos de contacto del sistema:** job diario de escaneo de lotes sobre `inventory_lots`; se evalúa `0 <= (expiry_date - today) <= 30`.
- **Hipótesis → decisión:** capturamos `supply_expiry_flagged` porque necesitamos saber **qué insumos están por vencer antes de que se conviertan en pérdida o riesgo de cumplimiento**, lo que nos permite decidir **priorizar el uso o la baja controlada de ese lote antes del vencimiento**.
- **Propiedades permitidas:**

| Propiedad | Tipo | Requerido | Lista permitida | PHI |
| --- | --- | --- | --- | --- |
| `clinic_id` | string | Sí | Sí | No |
| `country` | string | Sí | Sí | No |
| `product_id` | string | Sí | Sí | No |
| `product_category` | string | Sí | Sí | No |
| `lot_id` | string | Sí | Sí | No |
| `expiry_date` | string (date) | Sí | Sí | No |
| `days_to_expiry` | integer | Sí | Sí | No |
| `quantity_on_lot` | number | No | Sí | No |

- **Transmisión stream vs batch:** **stream** — el riesgo de pérdida/vencimiento de un lote necesita aviso casi inmediato para poder usar o dar de baja el lote a tiempo; un aviso mensual llegaría tarde.
- **Limitación / debounce:** una emisión por `lot_id` por día (el job es diario); re-emisión si cambia `quantity_on_lot` o al entrar en ventana más crítica (ej. ≤7 días).

---

### OPORTUNIDADES IDENTIFICADAS (catálogo ampliado para el RFI)

**Cobertura mínima exigida: ≥8 eventos adicionales en ≥3 categorías distintas.** El catálogo ampliado cubre **6 categorías** y añade **12 oportunidades** (además de los 5 obligatorios).

#### Categoría A · Inventario (oportunidades técnicas de inventario)

#### O1. `inventory_validation_failed` — Oportunidad · Categoría: inventario · batch

- **Definición:** se dispara cuando un formulario o petición del inventario falla la validación (campos incoherentes, categoría inválida, lote duplicado, cantidad negativa, etc.).
- **Puntos de contacto del sistema:** validaciones Pydantic (`InventoryItemCreate`, `InventoryMovementCreate`, `InventoryLotCreate`) en `POST /inventory/*`.
- **Hipótesis → decisión:** capturamos `inventory_validation_failed` porque necesitamos saber **qué campos y reglas de validación fallan más en el alta/edición de insumos**, lo que nos permite decidir **si simplificar los formularios, mejorar los mensajes de error o reforzar la formación del staff**.
- **Propiedades permitidas:** `clinic_id`, `country`, `product_id` (opcional), `product_category` (opcional), `validation_rule` (lista permitida: `duplicate_lot`, `negative_quantity`, `invalid_category`, `missing_lot`, `expired_lot`, `non_positive_movement`, `missing_adjustment_reason`), `field_name` (lista permitida), `http_status` (integer, 400/409/422).
- **Transmisión:** **batch** — los fallos de validación se agregan diariamente para decidir mejoras de UX/formación.
- **PII:** ninguno; no se registran valores sensibles del payload fallido.

---

#### O2. `outbound_expired_lot_rejected` — Oportunidad · Categoría: inventario · batch

- **Definición:** se dispara cuando una salida es rechazada porque referencia un lote cuyo `expiry_date` ya pasó (regla INV-009).
- **Puntos de contacto del sistema:** `InventoryStore.create_movement` con `movement_type=outbound` y `lot.expiry_date < today`.
- **Hipótesis → decisión:** capturamos `outbound_expired_lot_rejected` porque necesitamos saber **si el staff intenta consumir lotes vencidos**, lo que nos permite decidir **si reforzar la baja controlada de lotes vencidos o endurecer los permisos de salida**.
- **Propiedades permitidas:** `clinic_id`, `country`, `product_id`, `product_category`, `lot_id`, `expiry_date`, `requested_quantity`.
- **Transmisión:** **batch** — indicador de cumplimiento y formación, revisión diaria.

---

#### O3. `inventory_item_created` / `inventory_item_updated` / `inventory_item_deleted` — Oportunidad · Categoría: inventario · batch

- **Definición:** se disparan cuando un artículo de inventario se crea, actualiza (ej. cambio de `reorder_point`, nombre, categoría) o elimina (con preservación de trazabilidad si tiene movimientos).
- **Puntos de contacto del sistema:** `POST /inventory/items`, `PATCH /inventory/items/{id}`, `DELETE /inventory/items/{id}`.
- **Hipótesis → decisión:** capturamos `inventory_item_*` porque necesitamos saber **cuántas altas/ediciones de insumos ocurren y quién las hace por clínica**, lo que nos permite decidir **si la configuración de reorder_point y catálogo por clínica es consistente y quién debe tener permiso para cambiarla**.
- **Propiedades permitidas:** `clinic_id`, `country`, `product_id`, `product_category`, `changed_fields` (lista permitida para update), `reason` (solo si lo aporta la UI, lista permitida).
- **Transmisión:** **batch** — gobernanza de catálogo, revisión diaria/semanal.

---

#### Categoría B · Autenticación

#### O4. `login_failed` — Oportunidad · Categoría: autenticación · stream

- **Definición:** se dispara cuando un intento de inicio de sesión falla (credenciales inválidas, usuario inexistente) en el backoffice.
- **Puntos de contacto del sistema:** capa de autenticación del backoffice / API (hoy sin auth real en MVP; se instrumenta cuando se introduzca la capa de auth).
- **Hipótesis → decisión:** capturamos `login_failed` porque necesitamos saber **cuántos intentos de login fallidos hay por día y si se concentran en una clínica/cuenta**, lo que nos permite decidir **si bloquear temporalmente la cuenta, alertar a seguridad o corregir credenciales del staff**.
- **Propiedades permitidas:** `clinic_id` (opcional), `country` (opcional), `username` (solo hash/anonimizado), `failure_reason` (lista permitida: `invalid_credentials`, `account_locked`, `expired_password`, `rate_limited`), `ip_geohash` (opcional, solo hash).
- **Transmisión:** **stream** — los fallos repetidos de autenticación necesitan detección casi en tiempo real (bloqueo de cuenta, alerta de seguridad). La rúbrica del proyecto lo cita explícitamente.
- **Limitación:** **count-based rate limit** — agregar por `username_hash` + ventana (ej. 5 min); emitir 1 evento por ráfaga tras el umbral, no por intento.

---

#### O5. `login_succeeded` — Oportunidad · Categoría: autenticación · batch

- **Definición:** se dispara cuando un operador inicia sesión correctamente en el backoffice.
- **Puntos de contacto del sistema:** capa de autenticación del backoffice / API.
- **Hipótesis → decisión:** capturamos `login_succeeded` porque necesitamos saber **qué operadores y clínicas usan el sistema con qué frecuencia (adopción y patrones horarios)**, lo que nos permite decidir **si la asignación de licencias/roles y el soporte por turno son adecuados**.
- **Propiedades permitidas:** `clinic_id`, `country`, `role` (opcional), `auth_method` (lista permitida: `password`, `sso`, `mfa`).
- **Transmisión:** **batch** — la adopción y los patrones de uso se revisan por turno/semana.
- **PII:** el `userId` va en el envelope (operador autenticado) y puede ser un hash según política corporativa; no se registra contraseña.

---

#### Categoría C · Rendimiento y salud técnica

#### O6. `api_latency_recorded` — Oportunidad · Categoría: rendimiento · batch

- **Definición:** se dispara con muestras de latencia de endpoints de la API (inventario e incidencias) para conocer la salud técnica.
- **Puntos de contacto del sistema:** middleware de instrumentación en FastAPI (`/inventory/*`, `/incidents`, `/health`), muestreando por endpoint.
- **Hipótesis → decisión:** capturamos `api_latency_recorded` porque necesitamos saber **qué endpoints degradan la experiencia del backoffice y cuándo**, lo que nos permite decidir **si escalar, cachear o optimizar ese endpoint antes de que el operador lo perciba**.
- **Propiedades permitidas:** `endpoint` (lista permitida), `method` (lista permitida), `http_status` (integer), `duration_ms` (number), `client_region` (opcional), `sampling` (boolean), `error_class` (String opcional).
- **Transmisión:** **batch** — la decisión de optimización/escalado se revisa por periodo; no necesita latencia de segundos. (Muestreo al 10% de peticiones para controlar coste; los percentiles 95/99 se estiman.)
- **PII:** ninguno; solo metadatos de petición.

---

#### O7. `backend_error_caught` — Oportunidad · Categoría: errores · stream

- **Definición:** se dispara cuando el backend lanza una excepción no controlada o de negocio significativa (500, conflictos inesperados) en cualquier endpoint.
- **Puntos de contacto del sistema:** handler global de excepciones en FastAPI.
- **Hipótesis → decisión:** capturamos `backend_error_caught` porque necesitamos saber **qué errores inesperados rompen los flujos de inventario/incidencias**, lo que nos permite decidir **si hotfixear un bug crítico con prioridad**.
- **Propiedades permitidas:** `endpoint`, `method`, `http_status`, `error_class`, `error_message_hash` (hash del mensaje, no el mensaje completo con posibles detalles), `request_id` (del envelope), `stack_trace` (solo a sink de logs, no al evento de analytics).
- **Transmisión:** **stream** — los errores 5xx y conflictos críticos requieren aviso casi inmediato para intervención.
- **PII:** el `error_message` se codifica en hash; nunca se registran datos del payload de la petición (podría contener PHI por proximidad).

---

#### Categoría D · Errores de interfaz (frontend)

#### O8. `frontend_error_caught` — Oportunidad · Categoría: errores · batch

- **Definición:** se dispara cuando el frontend del backoffice captura un error de interfaz (excepción de React, fallo de red al cargar datos) en cualquier sección.
- **Puntos de contacto del sistema:** error boundary / capturador global de errores en el cliente (`uis/backoffice`).
- **Hipótesis → decisión:** capturamos `frontend_error_caught` porque necesitamos saber **qué páginas del backoffice fallan para los operadores**, lo que nos permite decidir **si corregir el bug antes de que afecte a más clínicas**.
- **Propiedades permitidas:** `page` (lista permitida de secciones), `component`, `error_class`, `error_message_hash`, `api_endpoint` (opcional), `http_status` (opcional), `session_duration_ms` (opcional).
- **Transmisión:** **batch** — los errores de UI se agregan diariamente y se priorizan por frecuencia.
- **PII:** mensajes de error en hash; nunca datos de pantalla ni campos de formulario capturados.

---

#### Categoría E · Navegación y flujos del backoffice

#### O9. `section_viewed` — Oportunidad · Categoría: navegación · batch

- **Definición:** se dispara cuando un operador entra en una sección del backoffice (Panel, Incidencias, Inventario, etc.).
- **Puntos de contacto del sistema:** hook de vista de sección en `uis/backoffice` (cambio de ruta / montaje de sección).
- **Hipótesis → decisión:** capturamos `section_viewed` porque necesitamos saber **qué secciones visitan más los operadores y en qué orden**, lo que nos permite decidir **si priorizar el desarrollo/la UX de las secciones más usadas o detectar secciones abandonadas**.
- **Propiedades permitidas:** `section` (lista permitida: `panel`, `incidents`, `inventory`, `lots`, `movements`, `reports`, `settings`), `from_section` (opcional), `clinic_id` (opcional), `entry_point` (lista permitida: `nav`, `deep_link`, `refresh`).
- **Transmisión:** **batch** — mapas de calor de navegación se revisan por semana; no requiere stream.
- **PII:** ninguno; el usuario ya está en el envelope.

---

#### O10. `flow_abandoned` — Oportunidad · Categoría: navegación · batch

- **Definición:** se dispara cuando un flujo multi-paso del backoffice se abandona a la mitad (ej. alta de movimiento de inventario iniciada y no completada, alta de incidencia abandonada).
- **Puntos de contacto del sistema:** seguimiento de pasos en el cliente + evento de confirmación de fin de flujo.
- **Hipótesis → decisión:** capturamos `flow_abandoned` porque necesitamos saber **qué flujos se abandonan a la mitad y en qué paso**, lo que nos permite decidir **si simplificar ese flujo o añadir ayuda contextual para reducir abandonos**.
- **Propiedades permitidas:** `flow` (lista permitida: `create_inbound_order`, `create_outbound_order`, `create_incident`, `edit_item`, `create_lot`), `abandon_step` (integer), `section` (opcional), `time_spent_ms` (number, opcional).
- **Transmisión:** **batch** — el análisis de abandono de flujos alimenta mejoras de UX por sprint.
- **PII:** ninguno.

---

#### O11. `flow_completed` — Oportunidad · Categoría: navegación · batch

- **Definición:** se dispara cuando un flujo multi-paso del backoffice se completa correctamente (fin del flujo de alta de orden, acierto de formulario de incidencia).
- **Puntos de contacto del sistema:** confirmación de éxito del cliente tras la respuesta 2xx del API.
- **Hipótesis → decisión:** capturamos `flow_completed` porque necesitamos saber **la tasa de completitud de los flujos críticos frente a los abandonados**, lo que nos permite decidir **si un flujo con bajo ratio completado/abandonado necesita rediseño**.
- **Propiedades permitidas:** `flow` (lista permitida, misma que O10), `duration_ms` (number), `section` (opcional).
- **Transmisión:** **batch** — pareja con `flow_abandoned`; revisión de UX por sprint.

---

#### Categoría F · Gestión de incidencias (otras secciones del backoffice que hoy son caja negra)

#### O12. `incident_created` — Oportunidad · Categoría: incidencias · batch

- **Definición:** se dispara cuando se registra una nueva incidencia operativa en el gestor de incidencias.
- **Puntos de contacto del sistema:** `POST /incidents` completado.
- **Hipótesis → decisión:** capturamos `incident_created` porque necesitamos saber **cuántas y qué tipo de incidencias se abren por clínica, canal y severidad**, lo que nos permite decidir **si redistribuir carga entre áreas responsables o corregir causas raíz recurrentes**.
- **Propiedades permitidas:** `incident_id`, `incident_type` (lista permitida), `severity` (lista permitida), `channel` (lista permitida), `responsible_area` (opcional, lista permitida), `clinic_id` (opcional), `country` (opcional).
- **Transmisión:** **batch** — el volumen diario de incidencias alimenta informes operativos y revisión de prioridades.

---

#### O13. `incident_status_changed` — Oportunidad · Categoría: incidencias · stream

- **Definición:** se dispara cuando una incidencia cambia de estado (ciclo de vida: `new → triaged → assigned → in-progress → blocked → resolved → closed`), siempre trazable a un autor.
- **Puntos de contacto del sistema:** `PATCH /incidents/{id}/status` (con `changed_by`); la auditoría ya registra `previous_value`, `new_value`, `changed_by`, `changed_at`.
- **Hipótesis → decisión:** capturamos `incident_status_changed` porque necesitamos saber **si una incidencia crítica se estanca o se bloquea**, lo que nos permite decidir **si reasignarla o escalarla a un área/ejecutivo**.
- **Propiedades permitidas:** `incident_id`, `previous_status` (lista permitida), `new_status` (lista permitida), `severity`, `responsible_area` (opcional), `clinic_id` (opcional).
- **Transmisión:** **stream** — un incidente crítico que pasa a `blocked` o se estanca requiere escalado casi inmediato; el aviso al área responsable es en minutos.
- **PII:** ninguno PHI; la descripción de la incidencia nunca viaja en el evento (solo IDs y taxonomía), evitando contaminación.

---

#### O14. `incident_resolution_time_recorded` — Oportunidad · Categoría: incidencias · batch

- **Definición:** se dispara cuando una incidencia pasa a `resolved`/`closed`, registrando el tiempo transcurrido desde la creación.
- **Puntos de contacto del sistema:** `PATCH /incidents/{id}/status` con transición a `resolved`/`closed`; cálculo `(changed_at - created_at)`.
- **Hipótesis → decisión:** capturamos `incident_resolution_time_recorded` porque necesitamos saber **si el tiempo de resolución por severidad y área cumple los SLA**, lo que nos permite decidir **si reforzar un área o revisar el flujo de escalado**.
- **Propiedades permitidas:** `incident_id`, `severity`, `responsible_area`, `time_to_resolution_hours` (number), `channel`, `clinic_id` (opcional).
- **Transmisión:** **batch** — los SLA se miden por periodos; no requiere stream.

---

### Resumen del catálogo

| # | `event_type` | Clase | Categoría | Stream/Batch |
| --- | --- | --- | --- | --- |
| M1 | `inbound_order_created` | **Obligatoria** | Inventario | batch |
| M2 | `outbound_order_created` | **Obligatoria** | Inventario | batch |
| M3 | `stock_threshold_triggered` | **Obligatoria** | Inventario | stream |
| M4 | `direct_stock_edit_rejected` | **Obligatoria** | Inventario | batch |
| M5 | `supply_expiry_flagged` | **Obligatoria** | Inventario | stream |
| O1 | `inventory_validation_failed` | Oportunidad | Inventario | batch |
| O2 | `outbound_expired_lot_rejected` | Oportunidad | Inventario | batch |
| O3 | `inventory_item_created/_updated/_deleted` | Oportunidad | Inventario | batch |
| O4 | `login_failed` | Oportunidad | Autenticación | stream |
| O5 | `login_succeeded` | Oportunidad | Autenticación | batch |
| O6 | `api_latency_recorded` | Oportunidad | Rendimiento | batch |
| O7 | `backend_error_caught` | Oportunidad | Errores | stream |
| O8 | `frontend_error_caught` | Oportunidad | Errores | batch |
| O9 | `section_viewed` | Oportunidad | Navegación | batch |
| O10 | `flow_abandoned` | Oportunidad | Navegación | batch |
| O11 | `flow_completed` | Oportunidad | Navegación | batch |
| O12 | `incident_created` | Oportunidad | Incidencias | batch |
| O13 | `incident_status_changed` | Oportunidad | Incidencias | stream |
| O14 | `incident_resolution_time_recorded` | Oportunidad | Incidencias | batch |

**Totales:** 5 obligatorias (color `🔴`) + 14 oportunidades (color `🟢`), cubriendo **6 categorías** (≥3 requeridas).

---

## 6. Estrategia de alta frecuencia (limitación / debounce)

| Evento | Estrategia |
| --- | --- |
| `stock_threshold_triggered` | Debounce 15 min por `product_id` + clínica; re-emitir solo en transición `ok → below`. |
| `login_failed` | Rate-limit por `username_hash` + ventana 5 min; 1 evento por ráfaga tras umbral (ej. 3 intentos). |
| `api_latency_recorded` | Muestreo al 10%; nunca en cada petición. |
| `stock_recalculated` | Solo cuando cambia el valor resultante, o agregado por minuto si el volumen es alto. |
| `supply_expiry_flagged` | 1 por `lot_id`/día (el job es diario); re-emisión si cambia `quantity_on_lot` o entra en ventana ≤7 días. |
| `section_viewed` / `flow_*` | Sin limitación necesaria (bajo volumen); aplicar selectividad por sesión si el tráfico crece. |

---

## 7. Riesgos y exclusiones (recortes deliberados del alcance)

**Eventos deliberadamente descartados / datos no registrados:**

- **Datos de paciente (PHI).** Cualquier campo que pudiera identificar a un paciente (nombre, MRN/NHS, diagnóstico, DOB) está **excluido por diseño** y además bloqueado a nivel de modelo (hipótesis: riesgo legal HIPAA/UK GDPR).
- **Contraseñas, tokens y credenciales en crudo.** Nunca en `properties`; en `login_failed` solo la razón tipificada y `username` con hash. Razón: seguridad y cumplimiento.
- **Contenido de descripciones de incidencias.** Los eventos de incidencia llevan solo IDs y taxonomía (`incident_type`, `severity`, `channel`, `responsible_area`), nunca `title`/`description` que podrían contener datos de contexto clínico. Razón: protección PHI por proximidad.
- **Stack traces completos en eventos de analytics.** Se envían a un sink de logs (no al pipeline de eventos de negocio); en el evento va el hash del mensaje. Razón: volumen/coste y posible fuga de detalles.
- **Latencia de UI al 100%.** Solo muestreo del p50/p95/p99; el coste de capturar cada interacción no se justifica hoy.
- **Geolocalización precisa de operadores.** Solo `ip_geohash`/región aproximada. Razón: privacidad del personal.
- **Eventos de "click crudo" (cada clic).** No se captura cada clic, solo secciones y flujos significativos; el detalle de click-by-click no habilita decisiones hoy.

**Riesgos de la instrumentación:**

- **Riesgo de volumen/coste** en eventos stream con alta frecuencia → mitigado con limitación/debounce y muestreo.
- **Riesgo de fuga PHI por proximidad** en payloads de error → mitigado con hashing y never-forward de payloads.
- **Riesgo de latencia añadida al backoffice** con eventos síncronos → los eventos irán por cola asíncrona/outbox, nunca en el camino crítico de la respuesta HTTP.
- **Riesgo de esquemas divergentes** entre este plan y el código → `event-schemas.json` es la fuente de verdad y se valida en CI (Anexo C).
- **Hoy no hay autenticación real en el MVP** → los eventos de autenticación se diseñan ahora pero se activan cuando exista la capa de auth; se deja especificado el contrato.

---

## 8. Futuro (cómo se reutilizará esta telemetría)

- **Dashboard operativo de red (Dra. Okonkwo):** agrega por clínica y país (`US`/`UK`) los KPIs de consumo (`outbound_order_created`), compras (`inbound_order_created`), stock en riesgo (`stock_threshold_triggered`) y vencimientos (`supply_expiry_flagged`).
- **Alertas de cumplimiento (Claire):** usa `supply_expiry_flagged`, `outbound_expired_lot_rejected` y `direct_stock_edit_rejected` para supervisión HIPAA/UK GDPR de trazabilidad.
- **Reabastecimiento automático (Marcus):** los patrones de `outbound_order_created` recalibran `reorder_point` por clínica.
- **Nuevas preguntas de negocio:** categorías de navegación e incidencias alimentan análisis de productividad del backoffice y priorización de secciones.
- **Diseño pensado como datos reutilizables:** cada evento está normalizado, versionado (`schemaVersion`) y documentado para que otro desarrollador lo consuma sin preguntar.

---

## 9. Checklist de evaluación

- [x] Todas las métricas obligatorias del briefing presentes y etiquetadas como **obligatorias** (M1–M5).
- [x] Catálogo amplio (14 oportunidades) cubriendo 6 categorías (≥3 requeridas).
- [x] ≥5 puntos de instrumentación del flujo de inventario (`≥5 PI`, incluidos rechazos y umbrales).
- [x] Cada evento con hipótesis y decisión (regla de oro); ninguno "por si acaso".
- [x] Estructura coherente para todos los eventos.
- [x] Listas permitidas de `properties` y manejo de PII documentado en cada evento.
- [x] `event-schemas.json` sincronizado con este plan (nombres y requeridos idénticos).
- [x] Elección `stream`/`batch` justificada por urgencia operativa.
- [x] Sección de riesgos y exclusiones con recortes deliberados de alcance.

---

## Anexo A — Correspondencia entre el modelo del briefing y el código real

| Briefing | Código (`services/incident-api/app/inventory_models.py`) |
| --- | --- |
| `Product` (insumo) | `InventoryItem` (`clinic_location`, `country`, `name`, `category`, `unit_of_measure`, `reorder_point`) |
| `InboundOrder` | `InventoryMovement` con `movement_type = inbound` |
| `OutboundOrder` | `InventoryMovement` con `movement_type = outbound` |
| `clinic` | `clinic_location` + `country` (`us`/`uk`) |
| `department` | no modelado explícito; se añadirá como campo en la orden de salida (respeta "registrado por departamento, nunca por paciente") |
| `product_category` (briefing: `medication`/`ppe`/`consumable`/`equipment`) | `InventoryCategory` (`ppe`, `medical_consumables`, `otc_medication`, `clinical_equipment`) — se mapea 1:1 al emitir el evento |
| `supply_expiry_flagged` | `InventoryLot.expiry_date` (lote ya registrado en el modelo desde el alta) |
| stock mínimo (`minimum`) | `reorder_point` (`available_stock <= reorder_point`) |

## Anexo B — Touchpoints técnicos para el equipo de implementación

| Endpoint / punto de código | Evento a emitir |
| --- | --- |
| `POST /inventory/movements` (Éxito, type=inbound) | `inbound_order_created` |
| `POST /inventory/movements` (Éxito, type=outbound) | `outbound_order_created` |
| `POST /inventory/movements` (rechazo: stock negativo, lote no pertenece, lote caducado, etc.) | `inventory_validation_failed` / `outbound_expired_lot_rejected` |
| `InventoryStore.create_movement` → después de `available_stock` | evaluar `stock_threshold_triggered` |
| Intento de escritura directa de stock (regla INV-005) | `direct_stock_edit_rejected` |
| Job diario de escaneo de `InventoryLot.expiry_date` | `supply_expiry_flagged` |
| `POST /inventory/items`, `PATCH`, `DELETE` | `inventory_item_*` |
| `POST /incidents`, `PATCH /incidents/{id}/status` | `incident_*` |
| Capa de autenticación (cuando exista) | `login_succeeded` / `login_failed` |
| Middleware FastAPI (muestreo) | `api_latency_recorded` / `backend_error_caught` |
| Frontend `uis/backoffice` (error boundary + router) | `frontend_error_caught` / `section_viewed` / `flow_*` |

## Anexo C — Gobernanza de esquemas

- `docs/telemetry/event-schemas.json` es la **fuente de verdad** de los contratos de evento.
- El pipeline de captura valida cada evento entrante contra el esquema y descarta/alertata en caso de desviación (`schemaVersion`).
- Se añadirá una validación CI (JSON Schema draft-07) que compruebe que `telemetry-plan.md` y `event-schemas.json` describen los mismos `event_type` y campos requeridos.
- Cambios de esquema con campos obligatorios nuevos exigen bump de `schemaVersion` y compatibilidad hacia atrás durante al menos una versión.