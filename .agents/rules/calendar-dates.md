# Nombre: Fechas de calendario

## Alcance

Generacion, agregacion y presentacion de fechas financieras, especialmente `financial-utils.ts` y sus pruebas.

## Justificacion

`FinancialMovement.create_date` es un `date` en [routes.py](../../backend/app/routes.py) y una cadena ISO en [financial-types.ts](../../frontend/src/lib/financial-types.ts). [financial-utils.ts](../../frontend/src/lib/financial-utils.ts) agrupa movimientos por mes; un desplazamiento de zona horaria cambiaria importes y periodos.

## Guia del proyecto

- Tratar `YYYY-MM-DD` como fecha de calendario, no como hora local del navegador.
- Si se convierte una fecha ISO sin hora a `Date`, extraer ano y mes con getters UTC; no mezclar ese instante con getters locales.
- Derivar el periodo mostrado de los datos recibidos, sin fijar un ano de demostracion.
- Mantener separadas las claves cronologicas y las etiquetas para presentacion.

## Verificacion

Reutilizar [financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts). Cubrir inicio/fin de mes, cruce de ano y datos vacios al modificar agregaciones. Ejecutar las pruebas con `TZ=UTC` y `TZ=America/Argentina/Buenos_Aires`; los importes y meses deben coincidir en ambas zonas.