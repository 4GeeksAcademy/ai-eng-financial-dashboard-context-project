# Claims de producto y roadmap

**Nombre:** Claims de producto y roadmap  
**Alcance:** Memoria del proyecto, README, documentación, resúmenes y cualquier texto que describa capacidades actuales o trabajo futuro.

**Justificación:** La UI de `frontend/src/App.tsx` solo solicita `/api/metrics`, mientras `backend/app/routes.py` implementa otros endpoints que no están conectados a la pantalla. Los movimientos se generan en memoria y `frontend/src/lib/mock-data.ts` contiene además otro conjunto de ejemplo. Describir todo lo que existe en backend como funcionalidad visible, o los gaps como planes, sobrestimaría lo verificado.

## Guía específica del proyecto

- Vincula cada claim de capacidad a un componente, endpoint, prueba o instrucción de ejecución del repo. Indica si está implementado en la UI, disponible solo en la API o probado en tests.
- Describe los movimientos como simulados: `backend/app/routes.py` los genera en cada llamada y el proyecto no configura persistencia.
- No afirmes que hay clientes, usuarios, integraciones, resultados de negocio o uso en producción salvo que una fuente del repo o una fuente aprobada lo demuestre.
- No inventes roadmap, prioridades, fechas ni compromisos. Basa esos datos en un backlog/issue mantenido o en un plan aprobado explícitamente.
- Si no hay fuente de planificación en el checkout, dilo; presenta los gaps como observaciones, no como siguientes pasos ni roadmap.

**Evidencia del repositorio:** `frontend/src/App.tsx`, `frontend/src/components/dashboard/`, `frontend/src/lib/mock-data.ts`, `backend/app/routes.py` y `docker-compose.yml`.