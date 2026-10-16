---
name: financial-dashboard-validation
description: Valida los cambios del dashboard financiero antes de realizar commits o entregas.
---

# Financial Dashboard Validation

## Objetivo
Garantizar que los cambios del dashboard financiero no afecten su funcionamiento.

## Instrucciones para el agente

1. Revisar las reglas del proyecto en `.agents/rules/`.
2. Consultar el contexto disponible en `memory-bank/`.
3. Mantener la arquitectura React, TypeScript, Vite y FastAPI.
4. Verificar que los indicadores financieros se calculen correctamente.
5. Mantener los gráficos accesibles y optimizados.
6. Ejecutar las siguientes verificaciones desde `frontend/`:
   - `npm run build`
   - `npm run lint`
   - `npm run test`
7. Cuando Playwright esté disponible, ejecutar la prueba de navegador ubicada en `frontend/tests/dashboard_browser_test.py`.
8. Documentar los resultados y cualquier limitación antes de entregar.

## Criterios de aceptación

- La aplicación compila correctamente.
- ESLint no informa errores.
- Las pruebas automatizadas pasan.
- El dashboard conserva sus indicadores y gráficos.
- No se introducen errores de JavaScript detectables en la prueba de navegador.
