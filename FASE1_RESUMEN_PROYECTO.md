# Fase 1: Comprensión del Repositorio

## Alcance
Este documento resume la Fase 1 enfocada en comprender completamente el repositorio, sin agregar funcionalidades ni asumir arquitectura no evidenciada.

## 1. Estructura general del proyecto

### 1.1 Carpetas principales
1. backend
2. frontend
3. .vscode

Evidencia:
- [backend](backend)
- [frontend](frontend)
- [.vscode](.vscode)
- [AGENTS.md](AGENTS.md)
- [README.md](README.md)
- [README.es.md](README.es.md)

### 1.2 Frontend
1. Punto de entrada web en [frontend/index.html](frontend/index.html).
2. Bootstrap de React en [frontend/src/main.tsx](frontend/src/main.tsx).
3. Componente raíz en [frontend/src/App.tsx](frontend/src/App.tsx).
4. Componentes de dashboard en [frontend/src/components/dashboard/dashboard-header.tsx](frontend/src/components/dashboard/dashboard-header.tsx), [frontend/src/components/dashboard/kpi-row.tsx](frontend/src/components/dashboard/kpi-row.tsx), [frontend/src/components/dashboard/kpi-card.tsx](frontend/src/components/dashboard/kpi-card.tsx), [frontend/src/components/dashboard/income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx), [frontend/src/components/dashboard/profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx).
5. Librerías internas y utilidades en [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts), [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts), [frontend/src/lib/utils.ts](frontend/src/lib/utils.ts), [frontend/src/lib/mock-data.ts](frontend/src/lib/mock-data.ts).
6. Estilos globales en [frontend/src/index.css](frontend/src/index.css).

### 1.3 Backend
1. Inicialización de API en [backend/app/main.py](backend/app/main.py).
2. Endpoints y lógica de datos mock en [backend/app/routes.py](backend/app/routes.py).
3. Declaración de paquete en [backend/app/__init__.py](backend/app/__init__.py).

### 1.4 Servicios
1. Servicio frontend y backend definidos en [docker-compose.yml](docker-compose.yml).

### 1.5 Librerías y dependencias
1. Frontend: React, Recharts, Tailwind, Vitest y ESLint declaradas en [frontend/package.json](frontend/package.json).
2. Backend: FastAPI, Uvicorn, debugpy, pytest y httpx declaradas en [backend/requirements.txt](backend/requirements.txt).

### 1.6 Entry points
1. Frontend: [frontend/index.html](frontend/index.html) y [frontend/src/main.tsx](frontend/src/main.tsx).
2. Backend: [backend/app/main.py](backend/app/main.py).
3. Contenedores: [frontend/Dockerfile](frontend/Dockerfile), [backend/Dockerfile](backend/Dockerfile), [docker-compose.yml](docker-compose.yml).

### 1.7 Configuración
1. Vite y proxy API en [frontend/vite.config.ts](frontend/vite.config.ts).
2. TypeScript en [frontend/tsconfig.json](frontend/tsconfig.json) y [frontend/tsconfig.app.json](frontend/tsconfig.app.json).
3. ESLint en [frontend/eslint.config.js](frontend/eslint.config.js).

### 1.8 Docker
1. Orquestación en [docker-compose.yml](docker-compose.yml).
2. Imagen backend en [backend/Dockerfile](backend/Dockerfile).
3. Imagen frontend en [frontend/Dockerfile](frontend/Dockerfile).

### 1.9 Scripts
1. Scripts frontend en [frontend/package.json](frontend/package.json): dev, build, lint, preview, test, test:watch y test:coverage.
2. Backend sin archivo de scripts equivalente; la ejecución se define por Docker y comandos de módulo Python en [backend/Dockerfile](backend/Dockerfile).

### 1.10 Testing
1. Backend: [backend/tests/test_routes.py](backend/tests/test_routes.py) y [backend/tests/conftest.py](backend/tests/conftest.py).
2. Frontend: [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts).

## 2. Flujo general de ejecución
1. Se recomienda ejecutar localmente con docker compose up --build, indicado en [README.md](README.md) y [README.es.md](README.es.md).
2. Docker Compose levanta frontend y backend según [docker-compose.yml](docker-compose.yml).
3. Backend inicia FastAPI en [backend/app/main.py](backend/app/main.py), registra CORS y router de [backend/app/routes.py](backend/app/routes.py).
4. Frontend levanta Vite desde [frontend/Dockerfile](frontend/Dockerfile) y monta la app en [frontend/src/main.tsx](frontend/src/main.tsx).
5. Frontend consume la API de métricas desde [frontend/src/App.tsx](frontend/src/App.tsx), calculando KPIs y series con [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts).
6. La ruta /api se proxya a backend por [frontend/vite.config.ts](frontend/vite.config.ts).

## 3. Cómo funciona el sistema
1. El backend genera movimientos financieros mock con semilla fija y filtros por fecha, categoría, tipo de operación y tipo de negocio.
2. El backend expone endpoints para métricas base, facets, summary, top categorías, comparación y alertas.
3. El frontend renderiza un dashboard con KPIs y dos gráficos a partir de la data obtenida.
4. El frontend actual consume de forma explícita el endpoint base de métricas.

Evidencia principal:
- [backend/app/routes.py](backend/app/routes.py)
- [frontend/src/App.tsx](frontend/src/App.tsx)
- [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts)
- [frontend/src/components/dashboard/income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx)
- [frontend/src/components/dashboard/profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx)

## 4. Resumen ejecutivo del proyecto
1. Es un proyecto full-stack de dashboard financiero con frontend React + TypeScript y backend FastAPI.
2. El backend centraliza la generación y exposición de datos financieros mock para análisis.
3. El frontend transforma y visualiza esos datos en indicadores ejecutivos y gráficos de evolución.
4. La ejecución local está pensada para dos contenedores coordinados por Docker Compose.

Evidencia:
- [README.md](README.md)
- [docker-compose.yml](docker-compose.yml)
- [backend/app/main.py](backend/app/main.py)
- [backend/app/routes.py](backend/app/routes.py)
- [frontend/src/App.tsx](frontend/src/App.tsx)

## 5. Validación del resumen contra código real
1. Todas las afirmaciones anteriores se contrastaron con archivos del repositorio.
2. No se afirma arquitectura por capas, hexagonal o microservicios porque no existe evidencia explícita que lo declare.
3. No se afirma consumo frontend de todos los endpoints avanzados, porque en el código actual se observa consumo explícito de /api/metrics.

Evidencia:
- [frontend/src/App.tsx](frontend/src/App.tsx)
- [backend/app/routes.py](backend/app/routes.py)

## 6. Inconsistencias y limitaciones verificadas
1. La estructura esperada de agentes se documenta en [AGENTS.md](AGENTS.md) y [README.md](README.md), pero la carpeta .agents no está presente en el workspace inspeccionado.
2. El archivo [README.es.md](README.es.md) contiene una línea en inglés en la sección inicial.
3. No se pudo validar ejecución de tests en este entorno por dependencias no instaladas en runtime durante la inspección.
4. No se pudo leer [frontend/.env.example](frontend/.env.example) porque está configurado como ignorado por el entorno de lectura.

## 7. Checklist de cierre Fase 1
- ✔ estructura comprendida
- ✔ entry points identificados
- ✔ flujo identificado
- ✔ resumen validado
- ✔ inconsistencias encontradas
