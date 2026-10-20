# A2: Separar cálculos de dominio de handlers

**Alcance:** Nuevas métricas, filtros y agregaciones en `backend/app/routes.py`.

**Justificación:** `summarize_movements`, `build_top_categories` y `calculate_net_value` son funciones separadas que los handlers reutilizan.

**Guía accionable:**
- Mantén en el handler la lectura/validación de parámetros y la coordinación de funciones.
- Coloca una transformación reutilizable en una función con entradas y salida tipadas, en vez de duplicar el cálculo entre endpoints.
- Prueba la función directamente cuando el cálculo pueda verificarse sin HTTP; añade además una prueba de endpoint para el contrato público.