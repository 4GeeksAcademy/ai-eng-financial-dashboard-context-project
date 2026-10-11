# Reglas de backend

## Objetivo
Guiar los cambios en `backend/`, preservando contratos, filtros y calculos,
y evitando interferencias entre peticiones y configuraciones productivas inseguras.

## Justificacion
Los hallazgos B01-B08 e I01-I03 de
[engerineering-findings.md](../../engerineering-findings.md) identifican helpers
reutilizables, brechas de pruebas, rangos invertidos sin validar y aleatoriedad
global por peticion. Docker expone un depurador y usa recarga: el riesgo de esa
configuracion es condicional a reutilizarla en produccion.
Las propuestas siguientes no implican que esos fallos esten corregidos.

## Reglas
1. **Arquitectura (B01):** Mantener la configuracion FastAPI en [main.py](../../backend/app/main.py) y endpoints/helpers en [routes.py](../../backend/app/routes.py). Reutilizar filtros, ordenacion y calculos, sin duplicarlos por endpoint B2B/B2C.
2. **Arquitectura y Naming (I01, I02):** Mantener modelos Pydantic de respuesta y enumeraciones para parametros cerrados. Conservar nombres y valores del contrato; coordinar cambios con [financial-types.ts](../../frontend/src/lib/financial-types.ts) y sus consumidores. No sustituir movimientos por resumenes sin adaptar el frontend.
3. **Testing (B02):** Usar datos controlados en [test_routes.py](../../backend/tests/test_routes.py) para comprobar filtros combinados, extremos inclusivos y orden cronologico. Exigir registros y resultados esperados, no solo una respuesta no vacia.
4. **Testing (B03):** Comprobar numericamente resumenes, comparaciones y alertas. Cubrir saldo anterior cero y negativo, y umbral exacto. Preservar `delta_pct = None` si el saldo anterior es cero y `increase_ratio > threshold`, salvo cambio explicito del contrato.
5. **Testing (B04):** Hacer controlables fecha y aleatoriedad en pruebas; comprobar consistencia del conjunto base entre endpoints, incluidas peticiones concurrentes.
6. **Documentacion (B05):** Documentar que los mocks cubren los doce meses completos anteriores al mes actual y que el [Dockerfile](../../backend/Dockerfile) es de desarrollo. No describirlos como un ano fijo ni como un despliegue productivo.
7. **Otra (B06):** Rechazar `start_date > end_date` con un error de cliente antes de filtrar o comparar. Mantener inclusivos ambos extremos de los rangos validos.
8. **Otra (B07):** Usar un generador aleatorio local por generacion, compartido con sus helpers. No reinicializar ni consumir el generador global durante peticiones.
9. **Otra (B08):** Reservar `debugpy`, el puerto `5678` y `--reload` para desarrollo. Antes de produccion, retirar su exposicion en [docker-compose.yml](../../docker-compose.yml) y definir origenes CORS explicitos si se usan credenciales.
10. **Otra (I03):** Coordinar cambios del servicio `backend` y del puerto `8000` con el proxy de [vite.config.ts](../../frontend/vite.config.ts). Fuera de Compose, proporcionar un destino alcanzable.
11. **Testing:** Para cambios de codigo, ejecutar desde `backend/` las pruebas pertinentes con `pytest tests`. Informar resultados y comprobaciones pendientes; comprobar claves de respuesta no demuestra que las formulas sean correctas.

## Ejemplo correcto e incorrecto
Basados en `generate_mock_movements` y `_build_movement` de
[routes.py](../../backend/app/routes.py). Son fragmentos, no funciones completas.
El ejemplo correcto propone adaptar los helpers; esa adaptacion no esta aplicada.

### Correcto: usar un generador local en toda la generacion
En `generate_mock_movements`:

```python
rng = random.Random(seed)
income_probability = rng.uniform(0.45, 0.7)
```

Pasar ese mismo `rng` a `_build_movement`, anadiendolo a su firma, y usarlo en
todas sus decisiones aleatorias. Por ejemplo, dentro de ese helper:

```python
operation_type: OperationType = "income" if rng.random() < income_probability else "outcome"
movement_day = rng.randint(1, 28)
```

Tambien reemplazar las llamadas globales restantes a `random.random`,
`random.choice` y `random.uniform`. Usar una instancia local solo en el bucle
exterior no elimina el problema si el helper sigue consumiendo estado global.

### Incorrecto: reinicializar y consumir el generador global
Estos fragmentos actuales de `generate_mock_movements` motivan B07:

```python
if seed is not None:
    random.seed(seed)
```

```python
income_probability = random.uniform(0.45, 0.7)
```

Las peticiones concurrentes pueden intercalar estas operaciones; la semilla
fija por si sola no garantiza el mismo conjunto entre endpoints.