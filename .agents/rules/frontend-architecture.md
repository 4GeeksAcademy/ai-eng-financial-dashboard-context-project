# Arquitectura del frontend

## Reglas

- Mantén los componentes del dashboard en `frontend/src/components/dashboard/` y los componentes UI reutilizables en `frontend/src/components/ui/`.
- Mantén los tipos de dominio en `frontend/src/lib/financial-types.ts`.
- Mantén los cálculos financieros y formateadores en `frontend/src/lib/financial-utils.ts`; evita duplicarlos dentro de componentes.
- Usa el alias `@` para imports desde `frontend/src` y conserva su configuración sincronizada en `frontend/tsconfig.app.json` y `frontend/vite.config.ts`.
- Respeta las restricciones actuales de TypeScript, especialmente `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noEmit` y `moduleResolution: bundler`.
- Mantén las reglas aplicables a archivos `.ts` y `.tsx` de `frontend/eslint.config.js`, incluidas las comprobaciones recomendadas para TypeScript, React Hooks y React Refresh.
- Conserva el patrón de tests de utilidades junto al módulo probado, como `frontend/src/lib/financial-utils.test.ts` junto a `financial-utils.ts`.

## Evidencia y riesgo

- La separación de carpetas y los componentes existentes están en `frontend/src/components/dashboard/` y `frontend/src/components/ui/`.
- `App.tsx` importa tipos y utilidades desde `frontend/src/lib/financial-types.ts` y `frontend/src/lib/financial-utils.ts`.
- El alias `@/*` está definido en `frontend/tsconfig.app.json` y replicado en `frontend/vite.config.ts`.
- Las restricciones de compilación están en `frontend/tsconfig.app.json` y `frontend/tsconfig.node.json`.
- ESLint y el patrón de archivos de test están definidos en `frontend/eslint.config.js` y `frontend/src/lib/financial-utils.test.ts`.

Ignorar estas reglas puede romper imports, compilación, validaciones de lint, cálculos KPI, agrupaciones mensuales o la composición visual existente.
