# Funcionalidad 2 — Tabla de alertas de anomalías

**Estado:** Especificación aprobada para implementación  
**Fecha:** 2026-09-17  
**Área:** Dashboard principal

## 1. Objetivo

Mostrar, debajo de los gráficos existentes, una tabla que permita identificar los períodos en los que el gasto (`outcome`) aumentó de forma inesperada respecto de la media móvil de los **tres períodos anteriores**.

El usuario podrá ajustar el umbral de alerta mediante un input numérico. La tabla debe permanecer visible aunque no existan anomalías, mostrando un estado vacío explícito.

## 2. Alcance

### Incluido

- Nuevo control de umbral en la sección de alertas.
- Umbral configurable entre `0.01` y `1.0`, con valor inicial `0.3`.
- Consulta del endpoint `GET /api/metrics/alerts?threshold=<ratio>`.
- Cálculo de la media móvil usando exactamente los tres períodos inmediatamente anteriores.
- Tabla colocada debajo de los dos gráficos actuales.
- Estado de carga, error y estado vacío.
- Aplicación del rango de fechas activo de la Funcionalidad 1.
- Formateo monetario del outcome y de la media móvil.
- Formateo porcentual del incremento.

### Fuera de alcance

- Cambiar la generación de datos mock.
- Añadir persistencia, autenticación o notificaciones push.
- Añadir filtros de categoría o tipo de negocio específicos para esta tabla, salvo que ya formen parte del estado global de filtros.
- Exportar alertas.
- Modificar los componentes generados de `frontend/src/components/ui/`.

## 3. Reglas funcionales

### 3.1 Umbral

- El valor inicial es `0.3`.
- El input acepta ratios decimales desde `0.01` hasta `1.0`, ambos inclusive.
- La etiqueta debe explicar el significado del valor, por ejemplo: `Umbral de incremento`.
- Se debe mostrar el formato esperado (`0.01–1.00`) y, si procede, una ayuda visual indicando que `0.3` representa un incremento del 30%.
- No se deben enviar al backend valores fuera del rango.
- Si el usuario introduce un valor inválido o incompleto, la consulta no se ejecuta con ese valor. El control debe conservar o recuperar el último valor válido y mostrar una validación accesible.
- El valor se puede aplicar al cambiar el input; no se exige un botón separado.
- El componente debe evitar solicitudes innecesarias mientras el usuario está escribiendo un valor intermedio inválido.

### 3.2 Detección de anomalías

Para cada período cronológico:

1. Obtener el total de `outcome` del período.
2. Cuando existan al menos tres períodos anteriores, calcular:
   `baseline_average = (outcome_1 + outcome_2 + outcome_3) / 3`
3. Calcular:
   `increase_ratio = (outcome_actual - baseline_average) / baseline_average`
4. Marcar el período como anomalía cuando:
   `increase_ratio > threshold`
5. No generar alerta si no existen tres períodos anteriores.
6. No generar alerta si `baseline_average <= 0`.
7. Un descenso o un incremento igual al umbral no es alerta; el criterio es estrictamente mayor (`>`).

La media móvil debe calcularse sobre períodos consecutivos del resultado agrupado. El período actual no forma parte de su propia línea base.

### 3.3 Rango de fechas

- Si la Funcionalidad 1 tiene un rango activo, la petición debe incluir el mismo `start_date` y `end_date`.
- La detección se realiza sobre los períodos devueltos dentro de ese rango.
- Por tanto, los tres períodos previos deben pertenecer al conjunto temporal disponible después de aplicar el rango. No se deben inventar períodos fuera del rango ni realizar una segunda consulta para ampliar silenciosamente el intervalo.
- Si el rango contiene menos de cuatro períodos agrupados, es válido que no haya anomalías y debe mostrarse el estado vacío correspondiente.
- Si no hay rango activo, se consulta el período completo disponible.

### 3.4 Tabla

La tabla debe tener exactamente estas cuatro columnas, en este orden:

| Columna visible | Campo API | Descripción |
|---|---|---|
| Período | `period` | Identificador del período, por ejemplo `2025-03` |
| Outcome registrado | `outcome_total` | Gasto total registrado en el período |
| Media móvil (3 períodos anteriores) | `baseline_average` | Media usada como referencia |
| Incremento porcentual | `increase_ratio` | Diferencia relativa respecto de la media móvil |

Requisitos adicionales:

- Ordenar las filas cronológicamente ascendente, salvo que el diseño aprobado indique explícitamente lo contrario.
- Mostrar importes en USD con dos decimales.
- Mostrar `increase_ratio` como porcentaje (`0.35` → `35.00%`).
- La tabla debe tener un nombre accesible, por ejemplo `Alertas de anomalías de outcome`.
- En pantallas estrechas debe poder consultarse sin romper el layout; se permite desplazamiento horizontal dentro de la tabla.
- Las filas deben conservar suficiente contraste en el tema oscuro.

## 4. Contrato de API

> Los nombres de respuesta `period`, `outcome_total`, `baseline_average` e `increase_ratio` están verificados en el modelo `MetricsAlert` y en la prueba existente. El rango `0.01–1.0` es un requisito de esta funcionalidad, pero **no está aplicado actualmente** en el endpoint: el código existente solo declara `ge=0` para `threshold`.

### 4.1 Mapeo de wording del producto a la API

| Wording del producto | Campo/parámetro real | Interpretación en esta especificación |
|---|---|---|
| Período | `period` | Clave textual del período agrupado; con `group_by=month` se espera `YYYY-MM`. |
| Outcome registrado / gasto | `outcome_total` | Suma del importe de movimientos con `operation_type=outcome` en ese período. |
| Media móvil de 3 períodos anteriores | `baseline_average` | Media de los tres outcomes anteriores; el endpoint conserva el nombre `baseline_average`. |
| Incremento porcentual | `increase_ratio` | Ratio decimal (`0.3` significa 30%); la UI lo presenta multiplicado por 100. |
| Umbral | `threshold` | Ratio decimal enviado en query, no porcentaje entero (`0.3`, no `30`). |
| Rango de fechas | `start_date`, `end_date` | Fechas ISO con formato `YYYY-MM-DD`. |

La palabra “porcentaje” en la tabla describe la presentación de `increase_ratio`; no implica que la API devuelva un valor como `30` o una cadena con `%`.

### Endpoint

```http
GET /api/metrics/alerts?threshold=0.3
```

### Query parameters

| Parámetro | Tipo | Obligatorio | Default | Restricciones |
|---|---|---:|---:|---|
| `threshold` | `float` | No | `0.3` | Requisito objetivo: `0.01 <= threshold <= 1.0`; contrato actual verificado: solo `threshold >= 0` |
| `group_by` | `string` | No | `month` | Para esta funcionalidad se usa `month` |
| `start_date` | `date` | No | — | Inclusivo |
| `end_date` | `date` | No | — | Inclusivo |
| `business_type` | `string` | No | — | Si el filtro global ya lo soporta |

El backend debe cambiar la validación para aplicar los límites inclusivos requeridos. En el contrato actual, `threshold=0` es aceptado por `ge=0` y no existe límite superior; por tanto, los casos `threshold=0` y `threshold=1.01` todavía no son rechazos verificados y deben convertirse en pruebas de regresión tras la implementación.

### Respuesta `200 OK`

```json
[
  {
    "period": "2025-03",
    "outcome_total": 27150.42,
    "baseline_average": 19840.10,
    "increase_ratio": 0.3685
  }
]
```

### Semántica de campos

- `period`: período agrupado (`YYYY-MM` con `group_by=month`).
- `outcome_total`: suma de movimientos cuyo `operation_type` es `outcome`.
- `baseline_average`: media aritmética de los tres outcomes anteriores.
- `increase_ratio`: ratio decimal, no porcentaje entero.

Una respuesta válida sin coincidencias es una lista vacía `[]`, no `null` ni un error HTTP.

## 5. Estados de interfaz

### Carga

- Mostrar un skeleton o indicador de carga en la sección completa de alertas.
- Mantener visible el título y el control de umbral si ya existe un valor válido.
- No mostrar una tabla parcialmente construida.

### Datos disponibles

- Mostrar control, título y tabla con las cuatro columnas.
- El umbral actualmente aplicado debe ser visible.

### Estado vacío

Cuando la respuesta sea `[]`, mantener la sección y mostrar un mensaje explícito, por ejemplo:

> No se detectaron anomalías de gasto con el umbral actual.

El mensaje debe incluir, cuando sea posible, el umbral aplicado para evitar ambigüedad.

### Error

- Mantener la sección visible.
- Mostrar un mensaje comprensible, por ejemplo:
  `No se pudieron cargar las alertas de anomalías. Inténtalo de nuevo.`
- No presentar el error como si fuera un estado vacío.
- El resto del dashboard debe seguir siendo utilizable si solo falla esta petición.

## 6. Integración frontend prevista

- Crear un componente de dominio en `frontend/src/components/dashboard/`, por ejemplo `anomaly-alerts-table.tsx`.
- Añadir los tipos de respuesta a `frontend/src/lib/financial-types.ts`.
- Centralizar, si se considera necesario, la construcción de la URL y el formateo en utilidades existentes o nuevas.
- Mantener el uso del alias `@/`, imports de tipos con `type`, exports nombrados y estilos Tailwind con variables del tema.
- Integrar el componente en `frontend/src/App.tsx` inmediatamente después de la sección de gráficos.
- Reutilizar el rango de fechas de la Funcionalidad 1, sin duplicar un estado paralelo.

## 7. Criterios de aceptación

- [ ] La tabla aparece debajo de los gráficos del dashboard principal.
- [ ] La tabla contiene exactamente las columnas período, outcome registrado, media móvil de 3 períodos anteriores e incremento porcentual.
- [ ] El umbral por defecto es `0.3`.
- [ ] El usuario puede establecer valores válidos `0.01` y `1.0`, incluidos.
- [ ] Los valores menores que `0.01`, mayores que `1.0` o no numéricos no se envían como consultas válidas.
- [ ] La petición usa `GET /api/metrics/alerts` y envía el umbral como ratio decimal.
- [ ] La detección usa exactamente los tres períodos anteriores, no toda la historia acumulada.
- [ ] Los primeros tres períodos no pueden generar alertas.
- [ ] Un incremento igual al umbral no genera alerta.
- [ ] Una respuesta `[]` muestra un mensaje explícito de estado vacío y la sección no desaparece.
- [ ] Un error de alertas muestra un estado de error independiente del resto del dashboard.
- [ ] Con rango activo de la Funcionalidad 1, `start_date` y `end_date` se incluyen en la consulta.
- [ ] La interfaz funciona en tema oscuro y en viewport estrecho sin desbordar la página.
- [ ] Los controles y la tabla son navegables y comprensibles con tecnologías de asistencia.

## 8. Plan de pruebas previo a implementación

### Backend

Añadir pruebas para:

1. `threshold=0.01` y `threshold=1.0` aceptados.
2. `threshold=0` y `threshold=1.01` rechazados con `422`.
3. La línea base de una alerta usa exactamente tres períodos anteriores. **Nota:** la implementación actual acumula todos los outcomes históricos anteriores (`historical_outcomes`) y no cumple todavía esta regla.
4. Los tres primeros períodos no generan alertas.
5. Un incremento igual al umbral no genera alerta; el operador estricto `>` ya está verificado en `detect_outcome_alerts`.
6. El endpoint respeta `start_date` y `end_date`.
7. Sin anomalías, la respuesta es `[]`.

### Frontend

Añadir pruebas para las funciones puras nuevas o modificadas:

1. Formateo de ratios decimales como porcentajes.
2. Construcción de query con umbral y rango de fechas.
3. Validación de límites del umbral.
4. Renderizado del estado vacío, estado de error y estado de carga del componente.
5. Renderizado correcto de las cuatro columnas con una alerta válida.

### Verificación

```bash
cd backend && pytest
cd ../frontend && npm run test
npx tsc --noEmit
npm run lint
```

## 9. Decisiones pendientes antes de construir

- Confirmar si el rango de la Funcionalidad 1 debe excluir los períodos previos necesarios para la media móvil, como se especifica aquí, o si debe permitir consultar contexto histórico fuera del rango sin mostrarlo.
- Confirmar si el filtro global `business_type` también afectará a las alertas cuando la Funcionalidad 1 lo incorpore.
- Confirmar si el cambio de umbral debe consultar inmediatamente al modificar el input o tras perder el foco; esta especificación asume aplicación al cambiar un valor válido.
