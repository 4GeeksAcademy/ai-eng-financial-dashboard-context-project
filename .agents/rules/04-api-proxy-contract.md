# Regla: preservar el contrato API y el proxy de desarrollo

## Regla propuesta
Los cambios del frontend deben conservar el contrato `/api` y distinguir entre ejecución dentro de Docker Compose y ejecución local fuera de Docker. No se debe cambiar el destino del proxy sin comprobar ambos flujos.

## Evidencia del repositorio

- `frontend/vite.config.ts` redirige `/api` a `http://backend:8000`.
- `frontend/src/App.tsx` consulta `${API_BASE_URL}/api/metrics`.
- `backend/app/routes.py` expone `GET /api/metrics`.
- `docker-compose.yml` conecta `frontend` con `backend` mediante `depends_on` y la red de Compose.
- `README.md` indica que el proxy de Vite se usa por defecto.

## Aplicación

- Mantener las rutas `/api` salvo que exista una migración documentada.
- Verificar que los cambios funcionan en el contexto de Compose.
- No recomendar `localhost` como destino interno del proxy Docker sin evidencia de que el servicio corre fuera de Compose.
