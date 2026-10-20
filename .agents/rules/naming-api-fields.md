# N1: Preservar nombres JSON y convenciones por lenguaje

**Alcance:** Campos serializados entre `backend/app/routes.py`, `frontend/src/lib/financial-types.ts` y nombres internos de frontend.

**Justificación:** El contrato usa `snake_case` (`create_date`, `operation_type`); las funciones TypeScript usan `camelCase` y los componentes React `PascalCase`.

**Guía accionable:**
- Conserva los nombres JSON existentes al refactorizar lógica interna.
- Si el contrato debe cambiar, actualiza backend, tipos, consumidores y tests juntos.
- Usa `camelCase` para funciones/variables TypeScript y `PascalCase` para componentes React; no conviertas los nombres de la API por convención local.