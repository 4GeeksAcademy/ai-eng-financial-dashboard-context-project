# Pruebas y documentación del proyecto

## Alcance

Aplica al cambiar comportamiento verificable, pruebas automatizadas, comandos de desarrollo, proxy/puertos o instrucciones de ejecución del repositorio.

## Justificación con evidencia del repositorio

- `backend/tests/test_routes.py` usa `TestClient` para probar rutas y filtros; `frontend/src/lib/financial-utils.test.ts` prueba cálculos y formateadores.
- Algunas pruebas de resumen/alertas comprueban claves y propiedades generales; no todas fijan resultados numéricos.
- `frontend/package.json` define scripts `test`, `build` y `lint`; `backend/requirements.txt` incluye `pytest` y `docker-compose.yml` no define una tarea de validación conjunta.
- `README.md` y `README.es.md` repiten las instrucciones de Docker, proxy y URLs.

## Guía específica del proyecto

1. **Prueba el comportamiento que cambias.** Para cálculos de resumen o alertas, incluye ejemplos pequeños con resultados esperados; para endpoints, comprueba estado, contrato y filtros afectados. No te limites a verificar que hay una lista o claves.
2. **Valida ambas capas cuando el cambio cruza frontend y backend.** Usa los scripts declarados en `frontend/package.json` desde `frontend/` (`npm test`, `npm run build`, `npm run lint` según el cambio) y ejecuta pytest con el contexto backend. No afirmes que un comando corre ambas suites: no existe esa tarea raíz en la configuración revisada.
3. **Mantén README equivalentes sincronizados.** Si se modifican comandos, puertos, URL del proxy o `VITE_API_BASE_URL`, actualiza tanto `README.md` como `README.es.md`.
4. **Documenta la red según el entorno.** El proxy configurado usa `http://backend:8000`, y Compose define el servicio `backend`; al añadir otro modo de ejecución, documenta y verifica su origen alcanzable y la variable necesaria.

## Ejemplo del código real

El proyecto declara `"test": "vitest run"` en `frontend/package.json`; las pruebas backend verifican `/health` con `TestClient`. Los README documentan `docker compose up --build`, frontend en 5173 y backend en 8000.