# Estado actual

## Hechos vigentes

- El proyecto tiene un frontend React/Vite y un backend FastAPI orquestados con Docker Compose. El backend sirve datos financieros simulados; el dashboard consume `/api/metrics` y calcula KPI y agregados mensuales en el cliente. Ver [`tech-stack.md`](./tech-stack.md), [`frontend/src/App.tsx`](../frontend/src/App.tsx) y [`backend/app/routes.py`](../backend/app/routes.py).
- Las instrucciones en [`AGENTS.md`](../AGENTS.md) requieren revisar `.agents/rules`, `.agents/skills` y `memory-bank`. Las reglas actuales están en [`.agents/rules/`](../.agents/rules/).
- El repositorio contiene tres skills comunitarias y una skill interna. Sus fuentes, commits de instalación y alcance se documentan en [`docs/phase5-agent-skills.md`](../docs/phase5-agent-skills.md); las tres skills comunitarias están registradas en [`skills-lock.json`](../skills-lock.json).
- La pantalla conserva el indicador de periodo fijo `2024 - Full Year`, mientras el backend genera un intervalo móvil de doce meses. La intención de producto para el periodo aún no está definida; no cambiar fechas o etiqueta sin resolverla.

## Fases y cambios recientes

- **Fases 1–3:** arquitectura, especificaciones y reglas del proyecto; ver [`docs/phase1-handover.md`](../docs/phase1-handover.md), [`docs/phase2-engineering-findings.md`](../docs/phase2-engineering-findings.md), [`verification.md`](../verification.md) y [`.agents/rules/`](../.agents/rules/).
- **Skills comunitarias y mejora del dashboard:** commit `21868a3` incorporó cambios de accesibilidad; `540a997` aplicó carga diferida de gráficos con React; `192941a` añadió la skill `web-quality-audit` y Retry a la petición de la API. El detalle se mantiene en [`docs/phase5-agent-skills.md`](../docs/phase5-agent-skills.md).
- **Validación interna:** `ffb6d0e` añadió [`.agents/skills/change-validation/SKILL.md`](../.agents/skills/change-validation/SKILL.md), un procedimiento reutilizable y de solo lectura para evaluar cambios con evidencia.
- La documentación de esta fase no valida retroactivamente la ejecución de pruebas ni las mediciones de rendimiento.

## Verificaciones registradas e historial de evidencia

Los siguientes resultados se conservan según su fuente y no se presentan como ejecuciones de esta actualización:

- **Reportado por el operador en Fase 1** ([`verification.md`](../verification.md)): Compose y dashboard iniciaron; el dashboard mostró indicadores y gráficos; `/health` respondió HTTP 200 y `/api/metrics` HTTP 200 (41 683 bytes); backend pytest reportado con 15 aprobadas y una advertencia; Vitest frontend con 5 aprobadas. El agente de esta fase no verificó independientemente capturas ni salidas del operador.
- **Registrado como ejecutado por el agente en Fase 3** ([`verification.md`](../verification.md)): consulta del endpoint B2C con filtros combinados, HTTP 200 y 15 resultados; prueba focalizada 1 aprobada/15 omitidas y suite backend 16 aprobadas. Se registró una advertencia `StarletteDeprecationWarning` relacionada con `httpx` y `starlette.testclient`.
- **Resultado histórico en una versión previa de este archivo:** pruebas en servicios Docker activos, backend 16 aprobadas y frontend 5 aprobadas, con la misma advertencia de Starlette. No se repitieron durante esta actualización.
- **Retry — resultados reportados por el operador el 2026-11-17:** el operador informa que `npm --prefix frontend run build`, `npm --prefix frontend run lint` y `git diff --check` pasaron, y que compartió capturas con el tutor en una conversación externa. También reporta una prueba manual: con backend detenido se mostró el error y Retry; tras recuperar el backend volvieron los KPI y gráficos; en Chrome DevTools Network observó una solicitud a `/api/metrics` con HTTP 200 después del reintento. El agente no ejecutó ni inspeccionó esas capturas durante la actualización documental.
- **Retry — cobertura pendiente:** el commit no añade pruebas automatizadas específicas del componente para error inicial, clic en reintento, recuperación exitosa o solicitudes duplicadas. La prueba manual reportada no sustituye esa cobertura.
- **Rendimiento y accesibilidad:** no hay mediciones Lighthouse, trazas de navegador ni CrUX verificadas para estos commits. Las modificaciones de código y sus límites se describen en [`docs/phase5-agent-skills.md`](../docs/phase5-agent-skills.md).

## Git al iniciar la documentación de Fase 5

- Rama observada: `feature/agent-skills`.
- Los cuatro commits descritos arriba estaban en el historial local.
- `git status --short --branch` no mostró cambios tracked antes de editar la documentación; sí mostró un archivo sin seguimiento con nombre `n' `. Se dejó intacto. Este estado es una observación al inicio de la tarea, no el estado posterior a los cambios documentales.

## Riesgos y decisiones pendientes

- **Periodo financiero:** resolver con producto la discrepancia entre la etiqueta 2024 y el periodo móvil generado por el backend. La regla y el riesgo se detallan en [`.agents/rules/project.md`](../.agents/rules/project.md).
- **Seguridad de despliegue:** `backend/Dockerfile` inicia `debugpy` escuchando en `0.0.0.0:5678` y Compose publica el puerto; confirmar que no quede expuesto en entornos no confiables.
- **CORS:** [`backend/app/main.py`](../backend/app/main.py) permite cualquier origen, credenciales, métodos y encabezados. Definir los orígenes y métodos necesarios para el despliegue real.
- **Contrato API:** el frontend usa `response.json()` sin validación runtime del esquema; los modelos frontend y backend son definiciones separadas.
- **Retry:** añadir cobertura automatizada de UI/flujo para fallo, reintento, recuperación y solicitudes simultáneas. Los resultados automáticos y manuales del operador del 2026-11-17 están documentados en [`docs/phase5-agent-skills.md`](../docs/phase5-agent-skills.md); el agente no los repitió ni verificó independientemente.
- **Integridad Vercel:** se reportó un aviso de que `vercel-react-best-practices` aparecía como `modified (differs from the lock)`. El lock registra el origen, commit y hash esperado, pero no se calculó aquí un hash actual ni se verificó la causa. No reinstalar ni modificar la skill como parte de esta fase documental.
- **Rendimiento:** React.lazy/Suspense está implementado, pero no hay evidencia de una mejora medida. Obtener baseline y comparar bajo las mismas condiciones antes de afirmar cambios de Core Web Vitals.
- **Cobertura de filtros:** mantener pruebas equivalentes para endpoints B2B y B2C al modificar su comportamiento. La advertencia de deprecación de Starlette permanece como deuda de dependencias, no como cambio de esta fase.

## Próximos pasos recomendados

1. Añadir y ejecutar pruebas automatizadas específicas para Retry (error inicial, clic, recuperación y solicitudes simultáneas). El operador reportó build, lint y `git diff --check` aprobados el 2026-11-17; el agente no los repitió.
2. Conservar como evidencia la prueba manual de Retry reportada por el operador el 2026-11-17; repetirla solo si se requiere reproducción independiente y registrar quién la ejecutó.
3. Confirmar con producto el periodo financiero y cubrir sus límites en pruebas.
4. Revisar la configuración de `debugpy` y CORS en el entorno de despliegue, sin inferir su exposición a partir de Compose local.
5. Investigar el aviso de integridad Vercel con el mecanismo autorizado, comparar con el hash del lock y no reinstalar sin autorización.
6. Si se necesitan afirmaciones de rendimiento o conformidad de accesibilidad, recopilar mediciones de navegador y pruebas manuales reproducibles.

Estas recomendaciones no autorizan cambios de código, instalaciones, despliegues ni operaciones Git.
