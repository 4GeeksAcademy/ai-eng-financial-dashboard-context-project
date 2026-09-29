# 🧠 Skill: Financial Dashboard Analysis

> Habilidad para analizar, mantener y extender el proyecto Financial Metrics Dashboard

---

## 📋 Descripción

Este skill capacita al agente para trabajar con el proyecto **Financial Metrics Dashboard**, una aplicación full-stack que visualiza métricas financieras simuladas. El agente podrá analizar el código, identificar patrones, proponer mejoras y ejecutar tareas de mantenimiento siguiendo las reglas del proyecto.

---

## 🎯 Capacidades

### 1. Análisis de Código
- Leer y comprender la arquitectura del backend (FastAPI) y frontend (React + TypeScript)
- Identificar la separación entre lógica de negocio y endpoints HTTP
- Mapear los tipos de datos y su flujo entre backend y frontend

### 2. Mantenimiento de Reglas
- Leer y aplicar las reglas en `.agents/rules/`
- Verificar cumplimiento de reglas de arquitectura, seguridad, testing, tipado, UX, observabilidad y DevOps
- Reportar violaciones de reglas encontradas durante el análisis

### 3. Testing
- Ejecutar tests del backend con pytest
- Ejecutar tests del frontend con Vitest
- Interpretar resultados y diagnosticar fallos

### 4. Extensión de Funcionalidad
- Añadir nuevos endpoints siguiendo el patrón existente (función pura + ruta HTTP)
- Crear nuevos componentes React con manejo de estados (loading, empty, error, data)
- Mantener la consistencia de tipos entre backend y frontend

---

## 🚀 Cómo usar este skill

```bash
# 1. Revisar el memory-bank primero
cat memory-bank/project-overview.md

# 2. Leer las reglas aplicables
ls .agents/rules/

# 3. Ejecutar tests antes de cualquier modificación
cd backend && python -m pytest tests/ -v
cd frontend && npx vitest run

# 4. Para añadir un nuevo endpoint:
#    - Crear función pura en routes.py
#    - Crear ruta HTTP @router.get(...)
#    - Definir modelos Pydantic de request/response
#    - Añadir tests en test_routes.py

# 5. Para añadir un nuevo componente:
#    - Crear componente en components/dashboard/ o components/ui/
#    - Manejar estados: loading, empty, error, data
#    - Usar CSS variables de index.css
#    - Añadir tipos en financial-types.ts si es necesario
```

---

## 📚 Referencia rápida del proyecto

| Aspecto | Detalle |
|---|---|
| Backend | Python 3.13 + FastAPI + Uvicorn, puerto 8000 |
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4, puerto 5173 |
| Tests backend | pytest + httpx (14 tests) |
| Tests frontend | Vitest (5 tests) |
| Infraestructura | Docker Compose (2 servicios) |
| Datos | Mock deterministas con seed=42 |

---

## ⚠️ Recordatorios importantes

- Siempre revisar el memory-bank antes de comenzar a trabajar
- Las reglas están en `.agents/rules/` — leerlas antes de modificar código
- No modificar tests existentes sin revisión explícita
- Mantener la separación entre lógica de negocio y presentación
- Usar tipos Literal estrictos en Python y TypeScript
- Manejar estados de carga, vacío y error en todos los componentes asíncronos
