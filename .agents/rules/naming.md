# Reglas de nomenclatura

## Nombre

Seguir los patrones de nombres que ya usa cada lenguaje y conservar los nombres del contrato JSON.

## Alcance

Archivos y símbolos nuevos o modificados en `frontend/src/**`, `backend/app/**` y `backend/tests/**`.

## Justificación

Los módulos de componentes del frontend usan nombres kebab-case, como `dashboard-header.tsx` y `kpi-row.tsx`; sus componentes y tipos exportados usan PascalCase, y sus funciones usan camelCase. Los módulos y funciones de Python usan snake_case, mientras las clases de modelos usan PascalCase. Los campos del contrato, por ejemplo `operation_type` y `create_date`, se representan con snake_case tanto en Python como en TypeScript.

## Instrucciones para agentes

- Para componentes y utilidades frontend, usa nombres de archivo kebab-case; usa PascalCase para componentes, interfaces y tipos, y camelCase para funciones y variables.
- Para módulos, funciones y variables Python, usa snake_case; para clases, usa PascalCase.
- Conserva los nombres snake_case de los campos JSON compartidos entre FastAPI y TypeScript. No renombres solo un lado del contrato.
- Al añadir pruebas, sigue el patrón del entorno: archivos de prueba frontend junto a la utilidad con sufijo `.test.ts` (como `financial-utils.test.ts`) y pruebas backend bajo `backend/tests/` con el patrón `test_*.py`.

## Comprobación

Compara los nombres nuevos con `frontend/src/components/dashboard/`, `frontend/src/lib/financial-utils.ts`, `backend/app/routes.py` y `backend/tests/test_routes.py`. Comprueba que los campos compartidos mantienen idéntica escritura en el modelo Python y el tipo TypeScript.