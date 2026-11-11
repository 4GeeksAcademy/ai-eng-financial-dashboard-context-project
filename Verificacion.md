# Verificación

- Revisados los entry points: `frontend/src/main.tsx` → `App.tsx` y `backend/app/main.py` → `routes.py`.
- Confirmado: el dashboard consulta `/api/metrics`; Vite reenvía `/api` a `backend:8000` en Docker Compose.
- Confirmado: backend y frontend se levantan con `docker compose up --build`; no hay base de datos configurada y la API usa movimientos generados.
- Discrepancia: el encabezado muestra «2024 - Full Year», pero el backend genera datos de los 12 meses completos anteriores al mes actual; con fecha 2026-11-11, el período es noviembre de 2025 a octubre de 2026.
- Alcance: inspección estática de código/configuración. No se ejecutaron pruebas ni servicios.
