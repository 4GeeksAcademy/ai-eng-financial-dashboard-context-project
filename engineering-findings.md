# Hallazgos y reglas de ingeniería

## Front-end

### Arquitectura
- Mantén los cálculos financieros en funciones auxiliares puras y pasa sus resultados a los componentes de presentación; no dupliques fórmulas en los componentes de interfaz. Referencias: [financial-utils.ts](frontend/src/lib/financial-utils.ts), [kpi-row.tsx](frontend/src/components/dashboard/kpi-row.tsx), [income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx).

### API y experiencia de desarrollo (DX)
- Llama a la API mediante una URL relativa `/api` desde el código del navegador y conserva el proxy de Vite para el desarrollo local. No uses como URL del navegador el nombre de host disponible solo dentro de la red de Compose. Referencias: [App.tsx](frontend/src/App.tsx), [vite.config.ts](frontend/vite.config.ts).

### Fechas y datos
- Trata las fechas de los movimientos como fechas de calendario al agrupar por mes; evita que la zona horaria local del navegador desplace las fechas. La función actual analiza las fechas ISO con `new Date()` y obtiene el año y el mes locales. Referencia: [financial-utils.ts](frontend/src/lib/financial-utils.ts).
- No cambies entre la API y los datos simulados del front-end sin hacer coincidir el conjunto de datos y el período mostrado. La aplicación consulta la API, el archivo de datos simulados contiene datos de 2024 y el encabezado tiene 2024 escrito de forma fija. Referencias: [App.tsx](frontend/src/App.tsx), [mock-data.ts](frontend/src/lib/mock-data.ts), [dashboard-header.tsx](frontend/src/components/dashboard/dashboard-header.tsx), [routes.py](backend/app/routes.py).

### Pruebas
- Mantén pruebas de cálculo para las funciones auxiliares financieras y añade cobertura de interfaz o integración al cambiar la petición, la carga o el manejo de errores; las pruebas actuales del front-end cubren las funciones auxiliares, no el flujo entre `App` y la API. Referencias: [financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts), [App.tsx](frontend/src/App.tsx).

## Back-end

### Contratos de API y nomenclatura
- Mantén explícitas las entradas y salidas de los endpoints mediante modelos de respuesta de Pydantic, parámetros de consulta restringidos y tipos `Literal` específicos del dominio. Actualiza el contrato al añadir o modificar un endpoint. Referencia: [routes.py](backend/app/routes.py).
- Conserva el comportamiento de filtros propio de cada endpoint y prueba cada combinación admitida; no supongas que todas las rutas aceptan los mismos filtros. Referencias: [routes.py](backend/app/routes.py), [test_routes.py](backend/tests/test_routes.py).

### Alcance de las pruebas
- Mantén intencionalmente determinista la generación de datos simulados y actualiza las pruebas si cambias la semilla o las reglas de fechas. Las pruebas deben verificar el intervalo requerido, no depender del nombre de una prueba: la prueba actual de «año completo» solo comprueba la cantidad y el orden cronológico. Referencias: [routes.py](backend/app/routes.py), [test_routes.py](backend/tests/test_routes.py).

## Integración

### Contrato de datos
- Mantén la estructura de respuesta del back-end alineada con el tipo de movimiento del front-end. Al cambiar campos o valores de enumeraciones, actualiza y prueba ambos lados. Referencias: [routes.py](backend/app/routes.py), [financial-types.ts](frontend/src/lib/financial-types.ts).

### Coherencia del período
- Obtén el período mostrado a partir de los datos recibidos o limita los datos del back-end al período anunciado. No mantengas una etiqueta fija en el encabezado si las fechas se generan a partir de la fecha actual. Referencias: [App.tsx](frontend/src/App.tsx), [routes.py](backend/app/routes.py).

### Comprobaciones de extremo a extremo
- Al cambiar el enrutamiento de la API o el flujo de datos, verifica la petición del front-end al back-end a través del proxy configurado, además de ejecutar las pruebas unitarias; las pruebas actuales del front-end no cubren esta integración. Referencias: [vite.config.ts](frontend/vite.config.ts), [App.tsx](frontend/src/App.tsx), [financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts).