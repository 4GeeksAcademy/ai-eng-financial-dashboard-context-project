# Reglas del dashboard frontend

## Propósito
Preservar la semántica de fechas, períodos y estados de carga de la interfaz existente.

## Ámbito
Cambios en `frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts` y componentes del dashboard.

## Evidencia del repositorio
- `FinancialMovement.create_date` es una fecha ISO (`frontend/src/lib/financial-types.ts`).
- `computeMonthlyData` convierte esa fecha con `new Date(...)` y extrae el mes con getters locales (`frontend/src/lib/financial-utils.ts`).
- `App.tsx` muestra la etiqueta fija `2024 - Full Year`, aunque el backend genera fechas usando la fecha actual (`backend/app/routes.py`, `generate_mock_movements`).
- `App.tsx` controla `loading` y `error`; tarjetas y gráficos muestran esqueletos durante la carga.

## Instrucciones para el agente
- Al tocar el agrupamiento de fechas, conserva la fecha de calendario y comprueba específicamente el día 1 del mes en una zona horaria negativa.
- No presentes un período fijo como si describiera datos dinámicos: vincula la etiqueta al rango consultado o valida explícitamente la política que la mantiene fija.
- Al modificar la carga, conserva un estado visible para fallos HTTP y de red y asegúrate de terminar el estado de carga.
- No elimines la comprobación `response.ok` sin manejo equivalente.

## Comprobaciones antes de finalizar
- Si cambia la agrupación, ejecuta `npm test -- src/lib/financial-utils.test.ts` desde `frontend/` y verifica el límite de mes en la zona horaria indicada.
- Si cambia el período mostrado, compara la etiqueta con el rango de datos o con la política de período explícita.
- Si cambia la carga/error, comprueba respuestas HTTP fallidas y errores de red, y confirma que la UI deja de cargar y presenta el error.