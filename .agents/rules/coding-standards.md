# Estándares y Reglas de Ingeniería - TrackFlow Dashboard

## 1. Patrones Obligatorios (A mantener)
- **Tipado Estricto:** Mantener siempre `strict: true` en TypeScript y validación estricta con Pydantic `BaseModel` en el backend.
- **Estructura Modular:** Mantener la separación de responsabilidades: componentes de UI separados en `/frontend/src/components/ui/` y la lógica de negocio en utilidades puras (`lib/`).
- **Nomenclatura:** Usar `kebab-case` para archivos de componentes React y `snake_case` para funciones y variables en Python.

## 2. Riesgos Críticos Prohibidos (A evitar en producción)
- **CORS:** Nunca desplegar con `allow_origins=["*"]`. Configurar siempre dominios explícitos mediante variables de entorno.
- **Performance:** Evitar regenerar grandes volúmenes de datos mock en cada solicitud HTTP; utilizar caché en el inicio de la aplicación.
- **Debugging en Producción:** No exponer herramientas de depuración como `debugpy` en los Dockerfiles de producción.