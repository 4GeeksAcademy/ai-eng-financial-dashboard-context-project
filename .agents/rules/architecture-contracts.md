# Nombre: Arquitectura y contratos

## Alcance

Cambios en `frontend/src/`, `backend/app/` y pruebas de sus contratos HTTP.

## Justificacion

[routes.py](../../backend/app/routes.py) define `FinancialMovement` con Pydantic y [financial-types.ts](../../frontend/src/lib/financial-types.ts) representa el mismo contrato en TypeScript. [App.tsx](../../frontend/src/App.tsx) consume `/api/metrics`, no todas las rutas disponibles.

## Guia del proyecto

- Mantener calculos financieros en `frontend/src/lib/`, presentacion en `components/dashboard/` y primitivas reutilizables en `components/ui/`.
- Antes de modificar una respuesta, revisar modelos, tipos y consumidores. Actualizar solo los afectados y sus pruebas en el mismo cambio.
- Conservar campos API en snake_case y valores existentes como `income`, `outcome`, `B2B` y `B2C`. No renombrar el contrato por preferencias de estilo.
- No integrar rutas adicionales en el dashboard sin un requisito funcional.

## Verificacion

Reutilizar [test_routes.py](../../backend/tests/test_routes.py) para comprobar campos, formatos y valores del contrato; contrastarlos con los tipos TypeScript. Si no cambia el contrato, no es necesario editar los tipos. Ejecutar la prueba enfocada y compilar el frontend cuando cambien sus consumidores.