# Análisis de fase 2: reglas propuestas

Estas reglas se proponen para orientar a futuros contribuidores y agentes. Cada una parte de un comportamiento o archivo concreto del repositorio; las propuestas no implican que el comportamiento observado ya esté corregido.

## Arquitectura y contratos

### Regla A1: Mantener sincronizados los contratos de API

Al modificar una respuesta o parámetro de API, actualizar en el mismo cambio el modelo Pydantic, los tipos TypeScript que consumen esa respuesta y las pruebas del contrato.

**Hecho del repo:** `FinancialMovement` define `create_date`, `amount`, `operation_type`, `category` y `business_type` en `backend/app/routes.py`; el frontend replica esos campos en `frontend/src/lib/financial-types.ts`. `backend/tests/test_routes.py` comprueba tanto la forma de las respuestas como sus filtros.

### Regla A2: Separar los cálculos de dominio de las rutas

Mantener las rutas centradas en validar parámetros y coordinar las operaciones; colocar cálculos reutilizables en funciones independientes y probarlos directamente cuando corresponda.

**Hecho del repo:** `backend/app/routes.py` ya separa funciones como `summarize_movements`, `build_top_categories` y `calculate_net_value` de los handlers HTTP.

### Regla A3: Conectar las capacidades del backend antes de considerarlas parte del dashboard

Una ruta disponible no equivale a una funcionalidad visible: al añadir una capacidad al producto, conectar el endpoint con la interfaz y cubrir el recorrido completo.

**Hecho del repo:** `backend/app/routes.py` ofrece endpoints de facets, resumen, categorías, comparación, alertas y movimientos B2B/B2C; `frontend/src/App.tsx` solo solicita `/api/metrics`.

## Datos, fechas y determinismo

### Regla D1: Derivar el período mostrado y el período de los datos de una misma fuente

Evitar títulos de período fijados por separado de los datos; usar el período recibido o calcularlo a partir de una configuración compartida.

**Hecho del repo:** `frontend/src/App.tsx` fija el encabezado en `2024 - Full Year`, mientras `generate_mock_movements` en `backend/app/routes.py` usa `date.today()` para determinar los años de los movimientos.

### Regla D2: Tratar fechas financieras como fechas de calendario

Al parsear fechas ISO sin hora, evitar conversiones que dependan de la zona horaria local. Cubrir con pruebas fechas cercanas al cambio de día, mes y año.

**Hecho del repo:** `frontend/src/lib/financial-utils.ts` crea `Date` desde `create_date` y después usa getters locales para obtener año y mes; en zonas horarias al oeste de UTC, una fecha ISO puede interpretarse en el día anterior.

### Regla D3: Evitar modificar el generador aleatorio global

Para datos deterministas, crear y pasar una instancia local de un generador aleatorio con semilla en vez de cambiar el estado aleatorio global del proceso.

**Hecho del repo:** `generate_mock_movements(seed=...)` llama a `random.seed(seed)` y el resto del generador usa el módulo `random`; esa llamada reinicia el generador compartido por el proceso.

## Pruebas y casos límite

### Regla T1: Actualizar pruebas de comportamiento junto con cada cambio de endpoint

Cubrir el status, forma de respuesta, filtros y casos límite que correspondan; ejecutar la suite antes de dar el cambio por verificado.

**Hecho del repo:** `backend/tests/test_routes.py` verifica `/health`, `/api/metrics`, sus filtros y los endpoints de análisis. En el entorno de desarrollo, la colección de esta suite requiere las dependencias de `backend/requirements.txt`.

### Regla T2: Definir el contrato para entradas vacías en agregaciones

Antes de indexar listas de resultados, decidir si una entrada vacía debe producir una respuesta vacía, un error de validación o un valor explícito, y probar esa decisión.

**Hecho del repo:** `build_metrics_facets` accede a `ordered[0]` y `ordered[-1]` sin manejar una lista vacía. La ruta actual genera datos de ejemplo, pero una fuente de datos futura podría estar vacía.

## Naming e internacionalización

### Regla N1: Preservar los nombres del contrato externo y respetar las convenciones internas

No renombrar campos expuestos por la API de forma aislada. Si cambia el contrato, coordinar backend, frontend y pruebas; mantener las convenciones de cada lenguaje en nombres internos.

**Hecho del repo:** los campos compartidos usan `snake_case` (`operation_type`, `create_date`); las funciones del frontend usan `camelCase` y los componentes React, `PascalCase`.

### Regla N2: No asumir que idioma, formato y moneda son intercambiables

Centralizar o configurar locale, moneda y formato de fechas para que la interfaz no mezcle convenciones incompatibles; añadir pruebas a los formateadores si se cambia esa configuración.

**Hecho del repo:** `frontend/src/lib/financial-utils.ts` fija `en-US` y `USD`, mientras `README.es.md` documenta el proyecto en español.

## Desarrollo local, resiliencia y seguridad

### Regla X1: No tratar el orden de arranque de Compose como una señal de disponibilidad

Si el cliente hace una llamada al iniciar, incorporar una comprobación de disponibilidad, reintentos o un estado recuperable; definir healthchecks si la orquestación necesita esperar a que el servicio esté listo.

**Hecho del repo:** `docker-compose.yml` configura `depends_on` sin `healthcheck`. `frontend/src/App.tsx` hace una única petición al montar y muestra error si falla.

### Regla X2: Restringir CORS fuera del desarrollo local

Configurar los orígenes permitidos explícitamente para cada entorno y no conservar una política abierta al desplegar el servicio.

**Hecho del repo:** `backend/app/main.py` configura `allow_origins=["*"]` junto con `allow_credentials=True`.

## Documentación y agentes

### Regla M1: Mantener verificaciones y documentación alineadas con el código y con las pruebas ejecutadas

Separar claramente lo que está implementado, lo que está cubierto por tests y lo que se comprobó ejecutando servicios. Revisar las rutas completas antes de afirmar que una capacidad falta.

**Hecho del repo:** `verification.md` distingue el estado de Compose y las llamadas HTTP; durante el análisis se corrigió allí una afirmación de endpoints ausentes que no coincidía con `backend/app/routes.py`.

### Regla M2: Guardar reglas de agentes en la ubicación declarada por el proyecto

Cuando estas propuestas se conviertan en instrucciones aplicables, ubicarlas bajo `.agents/rules/` y mantenerlas concretas, con alcance y evidencia identificables.

**Hecho del repo:** `AGENTS.md` pide revisar `.agents/rules`; `README.es.md` también presenta esa estructura, pero la carpeta no existe actualmente.