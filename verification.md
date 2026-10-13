# Verificaciones

| Afirmación original | Archivos revisados | Resultado |
|---|---|---|
| El dashboard obtiene datos de la API y no utiliza `mockMovements`. | [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/src/lib/mock-data.ts](frontend/src/lib/mock-data.ts) | Confirmada |
| La pantalla solicita `/api/metrics`; el backend define otras rutas. | [frontend/src/App.tsx](frontend/src/App.tsx), [backend/app/routes.py](backend/app/routes.py) | Confirmada |
| El front-end calcula indicadores y agrupa movimientos por mes. | [frontend/src/App.tsx](frontend/src/App.tsx), [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts) | Confirmada |
| El backend genera datos de ejemplo y asigna sus años según la fecha actual. | [backend/app/routes.py](backend/app/routes.py) | Confirmada |
| El período del encabezado coincide con las fechas de los movimientos. | [frontend/src/App.tsx](frontend/src/App.tsx), [backend/app/routes.py](backend/app/routes.py) | Incorrecta |