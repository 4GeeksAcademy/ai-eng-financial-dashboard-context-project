---
applyTo:
	- "frontend/src/**/*.ts"
	- "frontend/src/**/*.tsx"
---

# Regla: robustez del frontend

**Alcance:** Componentes React, consumo de API, adaptación de datos, cálculos y presentación de periodos/valores.

**Justificación basada en el repositorio:** `frontend/src/App.tsx` inicia un `fetch` en `useEffect`, muestra carga/error, pero no cancela ni reintenta la petición y asume que `response.json()` cumple `FinancialMovement[]`. `frontend/src/lib/financial-utils.ts` construye `Date` desde fechas ISO y usa getters locales, y solo genera meses presentes en los datos.

**Guía específica del proyecto:**
- Conserva estados visibles de carga y error cuando modifiques el fetch; presenta mensajes útiles sin exponer detalles internos del backend.
- Para peticiones asociadas al ciclo de vida de un componente, considera `AbortController` y define explícitamente si hay reintentos. Evita actualizaciones de estado después de desmontar.
- Trata el JSON como entrada no confiable y valida sus campos antes de alimentar componentes y utilidades.
- Trata `YYYY-MM-DD` como fecha de calendario, no como instante UTC: construye la fecha con sus componentes locales antes de agrupar con getters locales. Añade una prueba de límite de mes para evitar desplazamientos de periodo.
- No asumas que habrá un punto por cada mes: `computeMonthlyData` solo crea meses con movimientos. Si los gráficos requieren meses vacíos, complétalos de forma explícita y prueba esa regla.
- Mantén los formatos monetarios/fechas coherentes con la interfaz; hoy `financial-utils.ts` usa `USD` y `en-US`, por lo que cualquier cambio debe ser deliberado y probado.
