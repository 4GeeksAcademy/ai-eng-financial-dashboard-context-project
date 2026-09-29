# 🏷️ Reglas de Tipado y Type Safety

> Aplica a: backend (Pydantic), frontend (TypeScript)

---

## TYP-01: Modelos Pydantic con Literal en endpoints

Todo endpoint debe usar **modelos Pydantic** con tipos `Literal` para parámetros de tipo enum (OperationType, Category, GroupBy, etc.). Prohibido usar `str` genérico.

**Motivación:** Proporciona validación automática, autocompletado y detección de errores en compilación.

**Verificación:** Buscar definiciones de rutas que acepten `str` sin restricción de valores.

---

## TYP-02: Tipos centralizados en financial-types.ts

En el frontend, los tipos compartidos deben definirse en `financial-types.ts` y reutilizarse. Prohibido definir tipos duplicados en componentes.

**Motivación:** Evita la deriva de tipos entre backend y frontend y centraliza los contratos de datos.

**Verificación:** En code review: señalar tipos inline duplicados.

---

## TYP-03: Response model en toda respuesta

Toda respuesta de API debe tener un modelo Pydantic de respuesta (`response_model`). Prohibido devolver diccionarios sin esquema.

**Motivación:** Documenta automáticamente la API (OpenAPI) y valida la estructura de salida.

**Verificación:** Verificar que cada ruta tenga `response_model` o que use `Response` de manera explícita.
