# Verificacion de afirmaciones

| Afirmacion original | Archivos revisados | Resultado | Correccion |
|---|---|---|---|
| Los movimientos son reproducibles con la semilla `42`. | [routes.py](backend/app/routes.py), [test_routes.py](backend/tests/test_routes.py) | Parcial | La semilla fija los valores aleatorios, pero las fechas dependen de `date.today()`; la repetibilidad no se mantiene necesariamente entre años. |
| El periodo mostrado coincide con las fechas generadas. | [App.tsx](frontend/src/App.tsx), [routes.py](backend/app/routes.py) | Incorrecta | El encabezado fija `2024`; el generador calcula los años desde la fecha actual. Al 2026-10-12, asigna enero-septiembre a 2026 y octubre-diciembre a 2025. |
| El proxy puede comunicarse con el backend mediante Compose. | [vite.config.ts](frontend/vite.config.ts), [docker-compose.yml](docker-compose.yml) | Parcial | El destino `backend:8000` coincide con el servicio Compose, pero no se hizo una solicitud real. `depends_on` no espera a que la API esté lista. |
| La interfaz usa las rutas necesarias del backend. | [App.tsx](frontend/src/App.tsx), [routes.py](backend/app/routes.py) | Parcial | La pantalla principal solicita `/api/metrics`; no se observó que use las demás rutas. No se verificó si el producto requiere integrarlas. |
| Los cálculos financieros implementan las reglas esperadas. | [financial-utils.ts](frontend/src/lib/financial-utils.ts), [financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts) | Parcial | El código calcula beneficio como ingresos menos gastos y margen como beneficio dividido por ingresos (0 si no hay ingresos). Las pruebas cubren esas fórmulas, pero no confirman que sean las reglas requeridas por el negocio. |

Las pruebas se revisaron en el código, pero no se ejecutaron.