# 📊 Reglas de Observabilidad

> Aplica a: backend (Python/FastAPI)

---

## OBS-01: Logging estructurado en rutas

Toda ruta del backend debe tener **logging estructurado** que registre: método, ruta, parámetros, status code y tiempo de respuesta.

**Motivación:** Permite depurar errores en producción y trazar el uso de la API.

**Verificación:** Verificar que `routes.py` importe `logging` y registre en cada endpoint.

---

## OBS-02: Middleware global de errores

Las excepciones no capturadas deben ser manejadas por un **middleware global de errores** que devuelva un JSON estructurado y registre el error completo en logs.

**Motivación:** Evita errores 500 genéricos sin información y facilita la depuración.

**Verificación:** Buscar un `@app.exception_handler` o middleware similar en `main.py`.

---

## OBS-03: Usar logging, no print()

Prohibido usar `print()` para depuración. Usar el módulo `logging` de Python con niveles adecuados (`INFO`, `WARNING`, `ERROR`).

**Motivación:** `print()` no ofrece control de niveles, ni formato estructurado, ni es fácil de desactivar en producción.

**Verificación:** Buscar `print(` en archivos Python del backend.
