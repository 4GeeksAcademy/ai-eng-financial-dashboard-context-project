# Set de reglas

Reglas propuestas para futuros contribuidores y agentes. Son recomendaciones; todavía no forman parte de las instrucciones activas del proyecto.

1. **Mantener coherente el período mostrado.** No fijar en la interfaz un período que no corresponda al rango de datos recibido; calcularlo desde los datos o mantenerlo sincronizado con su fuente. Hecho del repo: [App.tsx](frontend/src/App.tsx) fija `2024 - Full Year`, mientras [routes.py](backend/app/routes.py) determina los años generados a partir de `date.today()`.

2. **Describir con precisión los datos simulados.** Indicar que los movimientos son generados y que el rango temporal depende de la fecha de ejecución; una semilla fija no hace invariable ese rango entre fechas distintas. Hecho del repo: [routes.py](backend/app/routes.py) genera movimientos con una semilla y usa `date.today()` para determinar sus años.

3. **Distinguir rutas disponibles de funcionalidades conectadas.** No afirmar que la interfaz usa un endpoint solo porque exista en la API; confirmar la llamada desde el frontend. Hecho del repo: [App.tsx](frontend/src/App.tsx) solicita `/api/metrics`, mientras [routes.py](backend/app/routes.py) define también rutas de resumen, comparación, alertas y categorías.

4. **Especificar el entorno al documentar cómo ejecutar el frontend.** Aclarar si las instrucciones asumen Docker Compose o ejecución directa en el host, y configurar el destino de API para ese entorno. Hecho del repo: [vite.config.ts](frontend/vite.config.ts) configura el proxy hacia `http://backend:8000`, nombre de servicio usado en [docker-compose.yml](docker-compose.yml).

5. **Separar inspección de pruebas ejecutadas.** Informar qué se inspeccionó y qué comandos se ejecutaron; no inferir que las pruebas pasaron por el hecho de que existan. Hecho del repo: [backend/tests/test_routes.py](backend/tests/test_routes.py) contiene pruebas y [Verificacion.md](Verificacion.md) registra que no se ejecutaron.

## Validación mínima en este repo

1. **Período mostrado:** usar movimientos con fechas desordenadas y comprobar que el encabezado coincide con la fecha mínima y máxima; comprobar también que una lista vacía no muestra un período ficticio. Prueba: `frontend/src/lib/financial-utils.test.ts`.
2. **Datos simulados:** documentar que la semilla `42` reproduce movimientos para la misma fecha de ejecución, pero no congela el rango entre fechas distintas. Contrastar la explicación con `generate_mock_movements` en `backend/app/routes.py`.
3. **Rutas conectadas:** registrar `GET /api/metrics` como la única ruta consultada por `frontend/src/App.tsx`; listar las demás como disponibles, no integradas. Contrastar el inventario con las rutas declaradas en `backend/app/routes.py`.
4. **Entorno frontend:** documentar Compose y ejecución directa, con el destino del proxy para ambos. Validar la ejecución directa haciendo una petición a `/api/metrics` a través de Vite y comprobando que recibe respuesta del backend.
5. **Evidencia de pruebas:** anotar en `Verificacion.md` el comando y resultado de cada prueba realmente ejecutada, separado de las inspecciones estáticas. Para esta tanda se ejecutaron las pruebas frontend y backend y un smoke test del proxy; no se ejecutó Docker Compose.
