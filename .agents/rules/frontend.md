# Reglas de frontend

## Objetivo
Guiar los cambios en `frontend/`, preservando el contrato HTTP, las formulas
financieras y los componentes compartidos.

## Justificacion
Los hallazgos F01-F07 e I01-I03 de
[engerineering-findings.md](../../engerineering-findings.md) identifican patrones
existentes y riesgos: JSON sin validar, meses dependientes de la zona horaria,
margen cero tratado como ausencia y un periodo fijo que no coincide con la API.
Las propuestas siguientes no implican que esos fallos esten corregidos.

## Reglas
1. **Arquitectura (F01):** Mantener los calculos en [financial-utils.ts](../../frontend/src/lib/financial-utils.ts); los componentes reciben resultados, sin duplicar formulas.
2. **Arquitectura (F02, I02):** Validar los campos y valores del JSON antes de calcular metricas; una respuesta incompatible debe activar el estado de error de [App.tsx](../../frontend/src/App.tsx). Los tipos TypeScript no son validacion en tiempo de ejecucion.
3. **Arquitectura (F03):** Reutilizar `Card`, `Skeleton`, `cn` y los tokens de [index.css](../../frontend/src/index.css). Al cambiar elementos compartidos, revisar sus consumidores y preservar responsividad y alturas de graficos.
4. **Naming (I01):** Conservar campos y enumeraciones de [financial-types.ts](../../frontend/src/lib/financial-types.ts), incluidos `create_date`, `operation_type`, `income`, `outcome`, `B2B` y `B2C`. Coordinar cualquier cambio con los modelos y consumidores del backend.
5. **Testing (F04):** Tratar `create_date` como fecha de calendario; agrupar por ano y mes sin depender de la zona horaria. Ampliar [financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts) con primeros de mes, distintas zonas, entradas desordenadas y cambios de ano.
6. **Testing (F05):** Probar carga, error, lista vacia y margen de 0 %. En [profit-percent-chart.tsx](../../frontend/src/components/dashboard/profit-percent-chart.tsx), distinguir registros existentes de valores distintos de cero.
7. **Documentacion (F06):** Preservar beneficio = ingresos - gastos, margen sobre ingresos y margen cero sin ingresos. El formato actual es USD sin decimales. Si cambia una convencion, actualizar calculos, pruebas y documentacion.
8. **Otra (F07):** Mostrar el periodo real de datos o filtros en [App.tsx](../../frontend/src/App.tsx); no reemplazar el ano fijo por otro ano fijo.
9. **Otra (I03):** Mantener `/api` y `VITE_API_BASE_URL`, sin URLs locales en componentes. Coordinar proxy y servicios de Compose; alinear el alias `@` entre [vite.config.ts](../../frontend/vite.config.ts) y [tsconfig.app.json](../../frontend/tsconfig.app.json).
10. **Testing:** Para cambios de codigo, ejecutar desde `frontend/` las pruebas pertinentes, `npm run lint` y `npm run build`. Informar resultados y comprobaciones pendientes; no atribuir pruebas funcionales a cambios solo documentales.

## Ejemplo correcto e incorrecto
Basados en `toYearMonthKey` de
[financial-utils.ts](../../frontend/src/lib/financial-utils.ts) y su llamada con
`new Date(m.create_date)`. El ejemplo correcto es una propuesta para el contrato
actual de fechas ISO de calendario, no una correccion ya aplicada.

### Correcto: usar ano y mes UTC
```ts
function toYearMonthKey(value: Date): string {
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}
```

`2024-02-01` debe conservar la clave `2024-02` en cualquier zona horaria.
Esto no sustituye la validacion del JSON y de sus fechas.

### Incorrecto: usar getters locales para una fecha interpretada en UTC
Este es el fragmento actual que motiva F04:

```ts
function toYearMonthKey(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}
```

En zonas al oeste de UTC, `new Date("2024-02-01")` cae localmente en enero y
este fragmento produce `2024-01`.