# Regla: frontend-code

**Alcance:** `frontend/src/` (menos las pruebas, ver `frontend-tests.md`).
**Justificación:** F6, F8-F13. Capas claras, alias `@/`, banderas estrictas de TypeScript y dos estilos de formato que conviven sin formateador.

## Qué hacer

- Respeta las capas: lógica pura en `src/lib/`, componentes de negocio en `src/components/dashboard/`, primitivas en `src/components/ui/` (`Card`, `Skeleton`). Reutiliza las primitivas.
- Importa con el alias `@/` (`vite.config.ts:19-20`).
- Archivos en `kebab-case`; componentes en `PascalCase` con `interface XProps` encima.
- Importa tipos con `import { type X }` (`verbatimModuleSyntax`), no uses `enum` ni `namespace` (`erasableSyntaxOnly`) y no dejes variables ni parámetros sin usar (`tsconfig.app.json:16,22-24`): `npm run build` ejecuta `tsc -b`.
- Colores y estilos: clases de Tailwind y variables CSS de `src/index.css` (`var(--chart-income)`, `--income-badge`…). No escribas colores hexadecimales.
- Tipos que reflejan la API: `snake_case` (`financial-types.ts:6-10`); tipos derivados del cliente: `camelCase`.
- **Imita el estilo del archivo que editas.** `App.tsx` y `src/lib/financial-utils.ts`: comillas dobles y punto y coma. Componentes de `dashboard/` y `ui/` y `financial-types.ts`: comillas simples y sin punto y coma.
- Los textos de la interfaz van en inglés.

## Qué no hacer

- No reformatees archivos enteros ni unifiques el estilo de paso: no hay `.prettierrc` y los diffs se llenarían de ruido.
- No copies el mensaje de error en español de `App.tsx:37` como modelo.

## Cómo comprobarlo

`cd frontend && npm run lint && npm run build`.
