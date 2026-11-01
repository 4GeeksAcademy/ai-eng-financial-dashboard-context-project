# convenciones-de-codigo (P1)
**Prioridad:** media
**Alcance:** `backend/app/**/*.py`; `frontend/src/components/**/*.tsx`; `frontend/src/index.css`; `frontend/src/lib/utils.ts`
**Regla:** DEBES nombrar las funciones Python en snake_case y los componentes React en PascalCase dentro de archivos kebab-case; DEBES combinar clases con `cn()` y reutilizar los tokens CSS en lugar de colores literales.
**Justificación:** C1, C5; `backend/app/routes.py:249` — `def get_metrics(`; `frontend/src/components/dashboard/kpi-row.tsx:11` — `export function KPIRow({ metrics, loading }: KPIRowProps) {`; `frontend/src/index.css:5` — `:root {`; `frontend/src/lib/utils.ts:4` — `export function cn(...inputs: ClassValue[]) {`.
**Verificación:** `grep -rnE "def [a-z_]*[A-Z]" backend/app` (esperado: sin salida); `find frontend/src/components -name "*.tsx" | grep -E "[A-Z_]"` (esperado: sin salida); `grep -rnE "#[0-9a-fA-F]{6}|rgb\(" frontend/src/components` (esperado: sin salida).
**Línea base:** los tres comandos no produjeron salida.
