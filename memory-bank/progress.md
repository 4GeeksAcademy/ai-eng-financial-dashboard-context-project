# Progreso de habilidades y verificaciones

Actualizado: 2026-11-22. Este documento registra cambios observados en el repositorio y resultados de comandos ejecutados en esta fecha; no implica validación de todos los modos de operación.

## 1. Skills aplicadas y cambios verificados

- **Accesibilidad (a11y):** cambios en `frontend/index.html`, `frontend/src/App.tsx`, `frontend/src/index.css` y componentes del dashboard. Incluyen landmarks/navegación semántica, skip link y foco visible, identificación accesible de gráficos y estados de carga. El skip link y el foco por teclado están implementados en el código; no hay registro de una prueba manual de navegación por teclado en navegador, por lo que esa validación operativa queda pendiente.
- **Rendimiento React — `vercel-react-best-practices`:** `frontend/src/lib/financial-utils.ts` aplica `js-combine-iterations` para sumar ingresos y egresos en un solo recorrido de `computeKPIs`. `frontend/src/App.tsx` agrupa métricas y datos mensuales en `dashboardData` y cancela la solicitud de datos con `AbortController` al desmontar.
- **Tipos — `cursor/plugins@typescript-best-practices`:** `frontend/src/App.tsx` asigna `response.json()` a `unknown` y valida el arreglo y sus movimientos con type guards antes de tratar el resultado como `FinancialMovement[]`.
- **SEO técnico — `addyosmani/web-quality-skills@seo`:** `frontend/index.html` declara `<meta name="robots" content="noindex, nofollow" />`, apropiado para este dashboard interno no destinado a indexación pública.
- **Build y calidad:** en el estado actual, `npx tsc --noEmit`, `npm run build`, `npm run lint` y `npm test -- --run` finalizaron con éxito. Vitest informó 1 archivo y 10 pruebas aprobados. El build aún muestra el aviso de bundle JavaScript mayor a 500 kB; por tanto, el build tuvo una advertencia, no estuvo libre de advertencias. No se observó una advertencia nueva atribuible a los cambios de metadatos o skill interna.

## 2. Justificación de skills del ecosistema

La selección responde a la tarea descrita y a la complejidad ya existente; no pretende ser una comparación exhaustiva de todos los resultados de `npx skills find`.

- **`cursor/plugins@typescript-best-practices`:** elegida para reforzar la seguridad de tipos en la frontera de datos externos de `/api/metrics`, usando `unknown` y validación antes de entrar al modelo de dominio. Se evitó introducir dependencias de testing pesadas y reescribir modelos estables sin necesidad.
- **`addyosmani/web-quality-skills@seo`:** elegida frente a skills orientadas a marketing o contenido porque se necesitaba calidad técnica HTML y control de rastreo; permitió marcar explícitamente el dashboard interno como `noindex, nofollow` sin añadir dependencias.

## 3. Skill interna creada — Punto 5

- **Ruta:** [`.skills/local-dev-and-merge-checks/SKILL.md`](../.skills/local-dev-and-merge-checks/SKILL.md).
- **Gap cubierto:** procedimiento común para diferenciar el proxy `/api` en Docker Compose (`http://backend:8000`) del Vite ejecutado localmente en Codespaces con el destino esperado `VITE_DEV_PROXY_TARGET=http://localhost:8000`, además de checks de compilación/calidad previos a merge y registro de límites de verificación.
- **Resultado de verificación del repositorio:** el `frontend/vite.config.ts` actual sigue fijando `http://backend:8000` y no referencia `VITE_DEV_PROXY_TARGET`; ese modo local configurable no está implementado actualmente. El backend respondió HTTP 200 en `http://localhost:8000/health` y `/api/metrics`. No había Vite activo en `localhost:5173`, así que no se verificó el proxy de Vite ni el flujo del navegador; tampoco se demostró la conectividad del frontend dentro de Compose. El archivo de skill documenta criterios, no modifica la configuración.
- **Checks actuales:** `npx tsc --noEmit` pasó; `npm run build` pasó con aviso de bundle >500 kB; `npm run lint` pasó; `npm test -- --run` pasó (10 pruebas). `git diff --check` no reportó errores de whitespace.

## Alcance y límites

Los resultados anteriores corresponden a los comandos ejecutados en este estado del repositorio. No acreditan verificación de navegación por teclado en navegador ni conectividad del proxy en los modos Codespaces/Compose. La advertencia de tamaño del bundle permanece y debe distinguirse de fallos o advertencias introducidas por cambios concretos.