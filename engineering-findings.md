# Hallazgos de ingeniería y reglas propuestas

Este documento reúne hallazgos concretos del repositorio y reglas propuestas para futuros contribuidores y agentes. Cada punto describe el comportamiento observado, la evidencia y la práctica recomendada.

## Frontend

### Las fechas de calendario pueden desplazarse al agrupar por mes

- **Hallazgo:** `computeMonthlyData` convierte fechas sin hora con `new Date(...)` y obtiene el año y el mes usando getters locales. En zonas horarias al oeste de UTC, el primer día del mes puede interpretarse como el día anterior y asignarse al mes previo. Las pruebas actuales no cubren ese límite.
- **Evidencia:** [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts), [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts).
- **Regla propuesta:** Trata `create_date` como una fecha de calendario, no como una marca de tiempo local. Evita conversiones dependientes de la zona horaria al agrupar y prueba el primer día de mes y los límites de año.

### Los cálculos financieros están separados y probados

- **Hallazgo:** Los cálculos de KPI y agregaciones mensuales están en utilidades independientes, con pruebas para totales, porcentajes y orden cronológico.
- **Evidencia:** [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts), [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts).
- **Regla propuesta:** Mantén los cálculos y formateadores financieros como funciones puras, separados de los componentes de presentación. Amplía sus pruebas unitarias al cambiar su comportamiento.

### Hay dos fuentes mock que pueden confundir a contribuidores

- **Hallazgo:** `mock-data.ts` exporta movimientos estáticos de 2024, pero el dashboard consulta `/api/metrics`; el fixture estático no se usa en el flujo actual del frontend.
- **Evidencia:** [frontend/src/lib/mock-data.ts](frontend/src/lib/mock-data.ts), [frontend/src/App.tsx](frontend/src/App.tsx).
- **Regla propuesta:** Mantén una única fuente mock activa y claramente identificada. Si conservas un fixture sin uso en la interfaz, documenta su propósito para que nadie espere que modificarlo cambie el dashboard.

## Backend

### La generación mock reinicia el estado aleatorio global

- **Hallazgo:** `generate_mock_movements(seed=42)` llama a `random.seed(seed)`, lo que modifica el generador aleatorio global del proceso cada vez que se construyen los datos.
- **Evidencia:** [backend/app/routes.py](backend/app/routes.py).
- **Regla propuesta:** Para generar datos reproducibles, usa un generador aleatorio local inicializado con la semilla solicitada. No reinicies ni modifiques el estado aleatorio global desde una función de generación.

### Los helpers compartidos de filtrado y ordenamiento son un patrón establecido

- **Hallazgo:** Varios endpoints reutilizan `filter_movements` y `ensure_chronological_order`, centralizando el comportamiento común.
- **Evidencia:** [backend/app/routes.py](backend/app/routes.py).
- **Regla propuesta:** Implementa los filtros y el ordenamiento compartidos en helpers reutilizables, y llámalos desde los endpoints nuevos o modificados en vez de duplicar esa lógica.

### Los contratos de la API usan esquemas explícitos

- **Hallazgo:** La API define modelos de respuesta Pydantic, restringe con `Literal` los valores de operación, categoría, tipo de negocio y agrupación, y declara `response_model` en sus rutas.
- **Evidencia:** [backend/app/routes.py](backend/app/routes.py).
- **Regla propuesta:** Define explícitamente los contratos de entrada y salida mediante modelos Pydantic; restringe los valores enumerados del dominio y declara el modelo de respuesta de cada ruta.

## Integración

### El período mostrado no coincide con los datos generados

- **Hallazgo:** El dashboard fija el texto `2024 - Full Year`, mientras que el backend genera movimientos de los últimos doce meses completos en relación con la fecha actual. La discrepancia también aparece en las notas de verificación.
- **Evidencia:** [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/src/components/dashboard/dashboard-header.tsx](frontend/src/components/dashboard/dashboard-header.tsx), [backend/app/routes.py](backend/app/routes.py), [verification.md](verification.md).
- **Regla propuesta:** Deriva el período mostrado de los datos o del filtro activo. Mantén coherentes la ventana temporal del backend, la etiqueta del dashboard y la documentación de verificación.

### Los contratos de datos del frontend y backend deben cambiar juntos

- **Hallazgo:** El tipo `FinancialMovement` del frontend refleja el modelo Pydantic del backend, y el dashboard espera que `/api/metrics` devuelva datos compatibles con ese tipo.
- **Evidencia:** [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts), [frontend/src/App.tsx](frontend/src/App.tsx), [backend/app/routes.py](backend/app/routes.py).
- **Regla propuesta:** Al cambiar un campo, tipo o forma de respuesta de la API, actualiza y valida el esquema del backend y el tipo del frontend en el mismo cambio.

### La documentación de configuración menciona un archivo inexistente

- **Hallazgo:** Los dos README indican copiar `frontend/.env.example`, pero ese archivo no está en el repositorio.
- **Evidencia:** [README.md](README.md), [README.es.md](README.es.md); la configuración del frontend se lee en [frontend/src/App.tsx](frontend/src/App.tsx).
- **Regla propuesta:** Mantén las instrucciones de configuración alineadas con los archivos existentes. Añade el archivo de ejemplo citado o corrige las instrucciones para describir la configuración realmente disponible.
