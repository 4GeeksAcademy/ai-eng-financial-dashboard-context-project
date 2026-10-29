---
applyTo:
	- "backend/**/*.py"
	- "frontend/src/**/*.ts"
	- "frontend/src/**/*.tsx"
---

# Regla: naming y consistencia de estilo

**Alcance:** Nombres de módulos, archivos, componentes, funciones, variables, tipos y formato de código Python/TypeScript.

**Justificación basada en el repositorio:** El backend usa `snake_case` (`generate_mock_movements`, `get_metrics_summary`) en `backend/app/routes.py`; los componentes React exportan nombres `PascalCase` como `KPICard` desde archivos `kebab-case` como `frontend/src/components/dashboard/kpi-card.tsx`. El estilo de formato TypeScript no es uniforme: `frontend/src/App.tsx` usa comillas dobles y punto y coma, mientras `kpi-card.tsx` usa comillas simples y omite punto y coma.

**Guía específica del proyecto:**
- En Python, usa `snake_case` para funciones, variables y módulos; usa `PascalCase` para clases/modelos Pydantic.
- En React/TypeScript, usa `PascalCase` para componentes y tipos, `camelCase` para funciones/variables y `kebab-case` para archivos de componentes y utilidades, siguiendo `frontend/src/components/dashboard/` y `frontend/src/lib/`.
- Conserva los valores de dominio con la grafía establecida por el contrato (`B2B`, `B2C`, `income`, `outcome`) aunque el path HTTP use minúsculas, como `/api/metrics/b2b`.
- No introduzcas una tercera variante de formato. El lint actual no impone comillas ni punto y coma; mientras no se acuerde/configure un formatter, imita el estilo del archivo objetivo y evita reformatear archivos no relacionados. No presentes el lint como validador de formato.
