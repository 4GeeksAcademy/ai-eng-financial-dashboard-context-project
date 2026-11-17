# Fase 5 — Skills de agentes y validación del dashboard

## Objetivo y alcance

Registrar la incorporación de tres skills comunitarias y la primera skill interna del repositorio, además de los cambios relacionados en accesibilidad, carga diferida de gráficos y recuperación de errores de API. Esta documentación reúne evidencia del código, historial Git e informes de verificación previos; no representa una nueva ejecución de pruebas ni una auditoría de runtime.

## Skills incorporadas

| Skill | Tipo y propósito | Fuente registrada |
|---|---|---|
| `accessibility` | Comunitaria; pautas para accesibilidad web y pruebas manuales/automatizadas. | `addyosmani/web-quality-skills`, commit `afa8da942115f2961fdbfa80807ea0b232ff6c00`. |
| `vercel-react-best-practices` | Comunitaria; pautas de rendimiento React/Next.js. | `vercel-labs/agent-skills`, commit `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62`. |
| `web-quality-audit` | Comunitaria; auditoría basada en evidencia de rendimiento, accesibilidad, SEO, buenas prácticas y navegación agentic. | `addyosmani/web-quality-skills`, commit `afa8da942115f2961fdbfa80807ea0b232ff6c00`. |
| `change-validation` | Interna; evaluación de cambios antes de aprobarlos, con énfasis en evidencia y límites de autorización. | Creada en este repositorio; no es una skill de origen comunitario. |

Las tres skills comunitarias y sus hashes esperados se registran en [`skills-lock.json`](../skills-lock.json). La skill interna se encuentra en [`.agents/skills/change-validation/SKILL.md`](../.agents/skills/change-validation/SKILL.md).

### Procedimiento de `change-validation`

La skill define un flujo de validación solo lectura:

1. Identificar criterios, alcance, archivos cambiados, dependencias y modificaciones preexistentes.
2. Consultar instrucciones, reglas, contratos, especificaciones, pruebas y manifiestos pertinentes.
3. Revisar la implementación y riesgos de regresión, accesibilidad y seguridad, manteniendo separados los problemas previos.
4. Elegir verificaciones focalizadas adecuadas a la tecnología y señalar las comprobaciones manuales necesarias.
5. Ejecutar solo las verificaciones autorizadas; documentar como no ejecutado lo que no se pudo o no se autorizó correr.
6. Registrar evidencia, fallos, riesgos residuales y áreas sin cobertura.
7. Recomendar aprobar, solicitar correcciones o bloquear por evidencia insuficiente.

Usa los estados `Passed`, `Failed`, `Not run` y `Pending` con los significados definidos en la skill. No autoriza cambios, merge o release; commits, push, instalaciones y acciones destructivas requieren autorización explícita.

## Commits y cambios principales

Los siguientes commits se confirmaron en el historial local consultado:

| Commit | Propósito | Archivos principales |
|---|---|---|
| `21868a3` — `feat(accessibility): improve dashboard accessibility using agent skill` | Mejoras de accesibilidad y skill `accessibility`. | `frontend/index.html`, `frontend/src/App.tsx`, componentes de gráficos y `card.tsx`, `frontend/src/index.css`, referencias de la skill. |
| `540a997` — `perf(frontend): optimize chart loading using vercel-react-best-practices skill` | Carga diferida de gráficos; instalación y lock de la skill Vercel. | `frontend/src/App.tsx`, `.gitattributes`, `skills-lock.json`, `.agents/skills/vercel-react-best-practices/`. |
| `192941a` — `feat(frontend): add accessible API retry using web-quality-audit skill` | Botón Retry y skill `web-quality-audit`. | `frontend/src/App.tsx`, `skills-lock.json`, `.agents/skills/web-quality-audit/`. |
| `ffb6d0e` — `feat(skills): add internal change-validation skill` | Primera skill interna. | `.agents/skills/change-validation/SKILL.md`. |

No se incorporaron dependencias de aplicación en estos commits.

## Mejoras del dashboard registradas en código

### Accesibilidad

El commit `21868a3`:

- Sustituyó el título HTML genérico por `Financial Overview | 4Geeks`.
- Añadió anuncios de estado para carga, error y ausencia de datos.
- Añadió anuncios accesibles para el contenido de los tooltips de los gráficos.
- Cambió `CardTitle` a un encabezado `h2`.
- Desactivó la animación `animate-pulse` bajo `prefers-reduced-motion: reduce`.

Estas son modificaciones de código; no demuestran conformidad WCAG. No se registró una medición Lighthouse/axe ni una prueba manual de lector de pantalla para esta fase.

### Carga de gráficos con React

El commit `540a997` reemplazó los imports estáticos de los dos gráficos por `React.lazy` y los ubicó bajo `Suspense`, con tarjetas skeleton mientras se cargan los módulos. Esto acredita una estrategia de carga diferida en el código, no una mejora medida de bundle, LCP, INP o CLS.

### Recuperación de errores de API

El commit `192941a` centralizó la petición inicial y el reintento en una función de carga de `App.tsx`. En el código:

- Al iniciar cada petición, activa `loading` y limpia el error.
- Si falla, vuelve a mostrar un mensaje con un botón nativo `Retry`.
- Al finalizar, limpia el bloqueo de petición y desactiva `loading`.
- Usa una referencia para evitar solicitudes simultáneas.
- Conserva los KPI, los dos gráficos, `React.lazy` y `Suspense`.

El commit no añadió pruebas de componente para fallo, reintento, solicitud única o recuperación exitosa.

## Verificaciones y procedencia

Los resultados históricos siguientes se mantienen separados por fuente. No se repitieron para crear este documento.

| Evidencia | Resultado registrado | Procedencia y alcance |
|---|---|---|
| Inicio de Compose, dashboard, `GET /health`, `GET /api/metrics` | Operador reportó servicios iniciados, dashboard con indicadores/gráficos, `/health` HTTP 200 y `/api/metrics` HTTP 200 (41 683 bytes). | Reporte del operador en [`verification.md`](../verification.md), Fase 1. No verificado independientemente por el agente de esa fase. |
| Pruebas iniciales | Backend: 15 aprobadas y una advertencia; frontend Vitest: 5 aprobadas. | Reporte del operador en [`verification.md`](../verification.md), Fase 1. No atribuir a los commits de esta fase. |
| Endpoint B2C con filtros y pruebas backend | La documentación registra HTTP 200 y 15 resultados; prueba focalizada 1 aprobada/15 omitidas; suite 16 aprobadas, con advertencia `StarletteDeprecationWarning`. | Verificaciones que [`verification.md`](../verification.md), Fase 3, atribuye al agente. Son anteriores a los commits de esta fase. |
| Backend 16 y frontend 5 | Una versión previa de [`memory-bank/current-state.md`](../memory-bank/current-state.md) registraba estos resultados en servicios Docker activos. | Evidencia histórica de memoria, no repetida ni asociada aquí a una verificación posterior a Retry. |
| **Automáticas de Retry reportadas por el operador (2026-11-17)** | `npm --prefix frontend run build`: aprobado; `npm --prefix frontend run lint`: aprobado; `git diff --check`: aprobado. | El operador informa que compartió capturas de estos resultados con el tutor en una conversación externa. Son resultados reportados, no ejecuciones del agente ni re-ejecutados durante esta documentación. |
| **Prueba manual de Retry reportada por el operador (2026-11-17)** | Con el backend detenido, se mostró el error y el botón Retry. Tras recuperar el backend, volvieron los indicadores y gráficos. | Reporte del operador y capturas compartidas con el tutor en una conversación externa, según indica el operador. El agente no ejecutó la prueba ni inspeccionó las capturas durante esta documentación. |
| **Chrome DevTools Network reportado por el operador (2026-11-17)** | Después del reintento, se observó una solicitud a `/api/metrics` con respuesta HTTP 200. | Reporte del operador y capturas compartidas externamente, según indica el operador. No es una observación directa del agente. |
| Pruebas manuales de accesibilidad | No hay un resultado específico registrado para teclado o lector de pantalla después de `21868a3`. | Pendiente; no inferirlo de la presencia de ARIA o HTML semántico. |

### Verificaciones pendientes o no ejecutadas por el agente

- Durante la creación de esta documentación, el agente no ejecutó build, ESLint, `git diff --check`, Docker ni pruebas; los resultados anteriores son del operador.
- La prueba de fallo y recuperación de Retry está reportada como realizada por el operador, pero no fue reproducida independientemente por el agente ni se inspeccionaron aquí sus capturas.
- El commit no añadió pruebas automatizadas específicas del flujo Retry (error inicial, botón, recuperación, cantidad de solicitudes). Esa cobertura sigue pendiente aunque las verificaciones generales y la prueba manual fueron reportadas como aprobadas.

La skill `change-validation` se utilizó posteriormente para una revisión estática del commit `192941a`; esa revisión inspeccionó archivos y diff, pero no ejecutó build, ESLint, Docker ni pruebas.

## Rendimiento e integridad de skills

- **Mediciones de rendimiento:** no hay evidencia de Lighthouse, Performance Insights, trazas de navegador ni CrUX para estos commits. No se afirma una mejora cuantitativa ni cumplimiento de Core Web Vitals.
- **Skill Vercel:** se reportó un aviso de integridad `modified (differs from the lock)`. En [`skills-lock.json`](../skills-lock.json), la entrada Vercel registra origen `vercel-labs/agent-skills`, commit `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` y `computedHash` `7991ed4fbecdac23f47c1a40c243e00a212a9e7f3604db93959b3ae11dffe299`. El hash actual del contenido no se calculó durante esta fase; la causa del aviso sigue sin verificar. No reinstalar ni alterar la skill sin autorización.

## Riesgos pendientes

1. **`debugpy`:** [`backend/Dockerfile`](../backend/Dockerfile) lo inicia en `0.0.0.0:5678`; [`docker-compose.yml`](../docker-compose.yml) publica ese puerto. Confirmar configuración del entorno de despliegue y evitar exposición no confiable.
2. **CORS:** [`backend/app/main.py`](../backend/app/main.py) permite `*` para orígenes, credenciales, métodos y encabezados. Definir una política apropiada al despliegue real.
3. **Periodo:** [App.tsx](../frontend/src/App.tsx) fija `2024 - Full Year`, mientras [`routes.py`](../backend/app/routes.py) genera doce meses relativos a la fecha del servidor. Al 2026-11-17, el intervalo de código es noviembre de 2025 a octubre de 2026. La intención de producto no está confirmada.
4. **Contrato runtime:** el frontend consume `response.json()` sin validación runtime del esquema; los modelos frontend y Pydantic son definiciones separadas.
5. **Cobertura Retry:** faltan pruebas automatizadas específicas de fallo, clic en reintento, recuperación y ausencia de duplicados. La prueba manual y las verificaciones generales fueron reportadas por el operador, pero no reproducidas por el agente.
6. **Accesibilidad y rendimiento:** faltan verificaciones renderizadas/manuales y mediciones de rendimiento equivalentes antes/después.
7. **Integridad Vercel:** falta comparar el contenido instalado con el hash del lock usando el mecanismo autorizado, sin reinstalar.

## Próximos pasos

1. Añadir pruebas automatizadas de componente para error inicial, reintento, recuperación y solicitudes concurrentes; conservar el reporte de build, lint y `git diff --check` del operador como evidencia externa.
2. Si se requiere verificación independiente del reporte manual, repetir Retry con backend detenido y recuperado, observando la petición de red, el mensaje, los KPI y los dos gráficos, y registrar quién lo ejecutó.
3. Confirmar el periodo financiero con producto antes de cambiar etiqueta o datos; añadir pruebas de límites.
4. Revisar exposición de debugpy y política CORS en el despliegue, no solo en configuración local.
5. Investigar el aviso de integridad de Vercel comparando hash esperado y actual; preservar la instalación hasta autorización.
6. Si se hacen afirmaciones de rendimiento o accesibilidad, medir y documentar navegador, estado, dispositivo, herramientas y limitaciones.

La documentación de esta fase no autoriza modificaciones funcionales, cambios de Docker/dependencias, instalaciones, commits ni push.
