# Nombre: Fiabilidad de API e integracion

## Alcance

Logica por solicitud en `backend/app/`, carga de datos en `App.tsx` y cambios de arranque en Compose.

## Justificacion

[routes.py](../../backend/app/routes.py) genera movimientos a partir de una semilla y ofrece `/health`. [docker-compose.yml](../../docker-compose.yml) declara `depends_on` sin healthcheck; [App.tsx](../../frontend/src/App.tsx) carga datos al montarse y presenta errores sin reintentos.

## Guia del proyecto

- Evitar estado global mutable en la logica por solicitud. Usar una instancia local de `random.Random(seed)` para datos simulados y pasarla a los helpers que la necesiten.
- Mantener reproducibilidad con la misma semilla y fecha de referencia; no prometer fechas constantes si se usa `date.today()`.
- No confundir un contenedor iniciado con un servicio disponible.
- En tareas que requieran tolerar arranque lento, evaluar healthchecks o reintentos limitados y comprobables. No agregar reintentos infinitos ni ampliar el alcance automaticamente.

## Verificacion

Probar igualdad con la misma semilla y conservacion de `random.getstate()` alrededor del generador. Si cambia la carga de datos, comprobar errores y recuperacion. Si cambia Compose, verificar disponibilidad HTTP ademas del estado del contenedor. Una prueba de aleatoriedad no valida por si sola el arranque.