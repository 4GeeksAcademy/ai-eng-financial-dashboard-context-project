---
name: qa-pre-merge
description: Ejecuta los checks obligatorios de QA local antes de hacer merge de una rama del dashboard financiero (frontend lint, tests, build y backend pytest), desde el directorio correcto. Úsala cuando el usuario pida "QA antes del merge", "preparar merge", "validar rama", "pre-merge check", "correr checks", o antes de abrir/aprobar un PR.
metadata:
  author: internal (equipo del proyecto)
  version: "1.0"
  scope: repository
---

# QA pre-merge (flujo local)

## Objetivo

Dar un veredicto reproducible (**APTO** o **BLOQUEADO**) sobre si una rama puede hacer merge, ejecutando los mismos checks que el equipo corre localmente, en el directorio correcto y con evidencia (comando, cwd, exit code).

## Contexto del repositorio (por qué existe esta skill)

El repo es un monorepo sin orquestador:

- **Raíz** (`/`): no tiene `package.json`. Ejecutar `npm test` o `npm run lint` aquí falla con `ENOENT` (confirmado). Solo contiene docs, `docker-compose.yml`, `backend/` y `frontend/`.
- **Frontend** (`frontend/`): contiene los scripts reales en [package.json](/workspaces/ai-eng-financial-dashboard-context-project/frontend/package.json):
  - `npm run lint` → `eslint .` ([eslint.config.js](/workspaces/ai-eng-financial-dashboard-context-project/frontend/eslint.config.js))
  - `npm test` → `vitest run` (config en [vite.config.ts](/workspaces/ai-eng-financial-dashboard-context-project/frontend/vite.config.ts); no hay `vitest.config.*`)
  - `npm run build` → `tsc -b && vite build` (`tsc` incluye los tests de `src/`)
  - `npm run test:coverage` → opcional, solo si se pide cobertura.
- **Backend** (`backend/`): pytest en [backend/tests](/workspaces/ai-eng-financial-dashboard-context-project/backend/tests), dependencias en [requirements.txt](/workspaces/ai-eng-financial-dashboard-context-project/backend/requirements.txt). Python objetivo: 3.13 ([backend/Dockerfile](/workspaces/ai-eng-financial-dashboard-context-project/backend/Dockerfile)). Sin venv, `pytest` falla con `ModuleNotFoundError: fastapi`.
- **No hay CI** en `.github/`: el QA pre-merge es manual, por eso esta skill debe seguirse explícitamente.
- Reglas de código que también se verifican: [coding-standards.md](/workspaces/ai-eng-financial-dashboard-context-project/.agents/rules/coding-standards.md) (TypeScript `strict`, kebab-case en componentes React, snake_case en Python, sin `allow_origins=["*"]`, sin `debugpy` en Dockerfiles de producción).

## Inputs

| Input | Obligatorio | Default |
|-------|-------------|---------|
| Rama a validar | No | Rama actual (`git branch --show-current`) |
| Rama base | No | `origin/main` (`git symbolic-ref --short refs/remotes/origin/HEAD`) |
| Ámbito | No | Detectado desde `git diff --name-only <base>...HEAD`: `frontend/` → checks frontend; `backend/` → checks backend; `docker-compose.yml` o `*/Dockerfile` → revisar reglas de Docker |
| Incluir cobertura | No | No |

Si el working tree tiene cambios sin commit, reportarlos antes de validar (la validación aplica al estado actual del disco, y el usuario debe saberlo).

## Procedimiento

### 1. Estado de la rama
```bash
git --no-pager status --short
git --no-pager diff --name-only origin/main...HEAD
```
Registrar los archivos cambiados y clasificarlos por ámbito.

### 2. Checks de frontend (si hay cambios en `frontend/`)
Ejecutar **siempre desde `frontend/`**, nunca desde la raíz:
```bash
cd frontend && npm run lint
cd frontend && npm test
cd frontend && npm run build
```
- `lint`, `test` y `build` son obligatorios. `build` valida tipos (`tsc -b`) y bundling (`vite build`).
- Si `node_modules` falta o falla por dependencia no encontrada, reportarlo como **bloqueo de entorno**. Solo ejecutar `npm install` dentro de `frontend/` si el usuario lo autoriza o si el cambio modificó `package.json`/`package-lock.json`.
- `npm run build` escribe en `frontend/dist/` (ignorado por git). No es un cambio de código.

### 3. Checks de backend (si hay cambios en `backend/`)
Ejecutar **desde `backend/`** dentro de un entorno con `requirements.txt` instalado:
```bash
cd backend && python -m pytest -q
```
Si no existe un entorno con dependencias, crear un venv fuera del repo o usar el que el usuario indique. No instalar paquetes globalmente sin autorización. Si pytest falla por `ModuleNotFoundError`, es bloqueo de entorno, no fallo de código.

### 4. Revisión de reglas (siempre)
Revisar solo los archivos cambiados contra [coding-standards.md](/workspaces/ai-eng-financial-dashboard-context-project/.agents/rules/coding-standards.md):
- Sin `allow_origins=["*"]` nuevo en `backend/app/`.
- Sin `debugpy` en un Dockerfile nuevo o modificado para producción.
- Archivos de componentes React nuevos en kebab-case; funciones Python en snake_case.
- Sin secretos ni `.env` real agregados (solo `.env.example`).

### 5. Veredicto
- **APTO**: todos los checks obligatorios del ámbito con exit code 0 y sin hallazgos en reglas.
- **BLOQUEADO**: cualquier check con exit code distinto de 0, hallazgo de regla, o bloqueo de entorno no resuelto.
- Un check que no pudo ejecutarse **nunca** cuenta como aprobado.

## Output esperado

Un reporte en el chat (no crear archivos markdown, salvo que el usuario lo pida):

```
Rama: <nombre> | Base: origin/main | Ámbito: frontend, backend
Veredicto: APTO | BLOQUEADO

| Check                      | Directorio | Comando                    | Resultado        |
|----------------------------|------------|----------------------------|------------------|
| Lint                       | frontend/  | npm run lint               | PASS (exit 0)    |
| Tests                      | frontend/  | npm test                   | PASS (8 tests)   |
| Build                      | frontend/  | npm run build              | PASS (exit 0)    |
| Backend tests              | backend/   | python -m pytest -q        | FAIL (exit 1)    |
| Reglas de código           | -          | revisión manual            | PASS             |

Hallazgos bloqueantes: <lista con archivo y línea, o "ninguno">
Advertencias no bloqueantes: <lista o "ninguna">
Entorno: <versión de Node/Python usada, o bloqueos de entorno>
```

Los conteos de tests y los mensajes de error deben salir de la salida real del comando, no estimarse.

## Criterios de aceptación

Esta skill se considera correctamente ejecutada cuando:

1. **Directorio correcto:** todos los comandos de frontend se ejecutan con cwd `frontend/` y los de backend con cwd `backend/`. Ningún script de npm se ejecuta en la raíz.
2. **Ámbito derivado de git:** el reporte indica qué archivos se usaron para decidir el ámbito, obtenidos con `git diff --name-only`, no supuestos.
3. **Evidencia por check:** cada check del reporte tiene comando, directorio y exit code (o motivo de no ejecución).
4. **Veredicto coherente:** si algún check obligatorio tiene exit code ≠ 0 o no se ejecutó, el veredicto es BLOQUEADO. Ningún check fallido o no ejecutado aparece como PASS.
5. **Sin efectos colaterales no solicitados:** no se hace commit, push, merge, ni cambios de código. Los únicos artefactos esperados son los de build en `frontend/dist/` (ignorados por git). `git status` debe seguir mostrando solo los cambios que existían antes.
6. **Sin instalaciones silenciosas:** no se ejecuta `npm install` ni `pip install` globales sin autorización explícita; cualquier instalación queda reportada.
7. **Reglas revisadas:** la sección de reglas cubre los archivos cambiados, no el repo completo.
8. **Idioma:** el reporte se entrega en español, salvo que el usuario pida otro idioma.

## Errores conocidos y cómo tratarlos

| Síntoma | Causa | Acción |
|---------|-------|--------|
| `npm error enoent Could not read package.json` | Comando lanzado desde la raíz | Repetir desde `frontend/` |
| `ModuleNotFoundError: No module named 'fastapi'` | Entorno Python sin `requirements.txt` | Bloqueo de entorno; usar venv con dependencias |
| `tsc -b` falla pero `vite build` funcionaría | Error de tipos (el build exige ambos) | BLOQUEADO; reportar archivo y línea |
| `describe`/`it` no definidos en un test nuevo | Vitest no tiene `globals: true`; hay que importar desde `vitest` | Agregar el import, como en [financial-utils.test.ts](/workspaces/ai-eng-financial-dashboard-context-project/frontend/src/lib/financial-utils.test.ts) |

## Fuera de alcance

- Auditorías de accesibilidad o performance (usar las skills `accessibility` y `vercel-react-best-practices`).
- Escribir tests nuevos o corregir fallos: esta skill solo valida; los fixes se hacen en otra tarea.
- Desplegar, abrir PR o hacer merge.
