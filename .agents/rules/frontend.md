# Reglas de frontend

## Convenciones existentes

- Los componentes observados son funciones exportadas con nombre y declaran sus props con una interfaz; sigue ese patrón al crear o cambiar componentes. Ejemplo: [`frontend/src/components/dashboard/kpi-row.tsx:6`](../../frontend/src/components/dashboard/kpi-row.tsx#L6) y [`frontend/src/components/dashboard/kpi-row.tsx:11`](../../frontend/src/components/dashboard/kpi-row.tsx#L11).
- Los modelos de dominio existentes están centralizados en `frontend/src/lib/financial-types.ts` como tipos unión e interfaces. Reutilízalos, en lugar de duplicar esos tipos en componentes. Ejemplo: [`frontend/src/lib/financial-types.ts:1`](../../frontend/src/lib/financial-types.ts#L1), [`frontend/src/lib/financial-types.ts:5`](../../frontend/src/lib/financial-types.ts#L5).
- La configuración usa el alias `@/*` y activa `noUnusedLocals` y `noUnusedParameters`; conserva imports compatibles y elimina declaraciones que queden sin uso. [`frontend/tsconfig.app.json:13`](../../frontend/tsconfig.app.json#L13), [`frontend/tsconfig.app.json:22`](../../frontend/tsconfig.app.json#L22), [`frontend/tsconfig.app.json:23`](../../frontend/tsconfig.app.json#L23).

## Medidas preventivas propuestas

- **Al cambiar datos recibidos de la API:** el frontend obtiene `/api/metrics` y retorna `response.json()` sin validación runtime del esquema ([`frontend/src/App.tsx:16`](../../frontend/src/App.tsx#L16), [`frontend/src/App.tsx:20`](../../frontend/src/App.tsx#L20)). Coordina el cambio del contrato con el backend siguiendo las reglas de [`project.md`](./project.md); actualiza los tipos frontend pertinentes y añade o ajusta una prueba del comportamiento afectado.
- **Al cambiar carga o errores de la petición:** conserva el manejo de respuesta HTTP no exitosa y los estados de carga/error existentes, o documenta y prueba expresamente el cambio de UX. [`frontend/src/App.tsx:17`](../../frontend/src/App.tsx#L17), [`frontend/src/App.tsx:23`](../../frontend/src/App.tsx#L23), [`frontend/src/App.tsx:31`](../../frontend/src/App.tsx#L31).
- **Comprobación:** desde `frontend/`, ejecuta `npm test` para cambios de comportamiento y `npm run build` para verificar tipos y compilación; ambos scripts están definidos en [`frontend/package.json:8`](../../frontend/package.json#L8) y [`frontend/package.json:11`](../../frontend/package.json#L11).
