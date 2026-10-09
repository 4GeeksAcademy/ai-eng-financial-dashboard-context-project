# Panel de Métricas Financieras

<!-- hide -->

Por [@marcogonzalo](https://github.com/marcogonzalo) y [otros contribuidores](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) en [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_Estas instrucciones también están disponibles en [inglés](./README.md)._

**Antes de empezar**: 📗 [Lee las instrucciones](https://4geeks.com/es/lesson/como-comenzar-un-proyecto-de-codificacion) sobre cómo comenzar un proyecto de programación.

<!-- endhide -->

---

_Dashboard de métricas financieras con frontend en React + TypeScript y backend en FastAPI._

## Descripción

Este proyecto es un dashboard de demostración para explorar métricas financieras. Muestra ingresos totales, gastos totales, beneficio neto y margen de beneficio, con gráficas mensuales de ingresos frente a gastos y evolución del margen.

El dashboard usa datos sintéticos generados por el backend; no está conectado a registros financieros reales y no persiste movimientos. La interfaz actual no permite importar datos, editar movimientos, seleccionar fechas ni aplicar filtros. La etiqueta del periodo es fija y puede no coincidir con el rango de datos generado.

## Stack tecnológico y arquitectura

- **Frontend:** React, TypeScript, Vite, Tailwind CSS y Recharts.
- **Backend:** Python 3.13, FastAPI, Uvicorn y Pydantic.
- **Entorno local:** Docker Compose.

El navegador carga la aplicación React desde Vite. La aplicación solicita `GET /api/metrics`; Vite redirige las peticiones `/api` a FastAPI. El backend genera movimientos sintéticos en memoria. El frontend calcula los totales de los KPI y los datos mensuales de las gráficas.

## Requisitos y arranque rápido

Requisitos: Docker y Docker Compose.

Desde la raíz del repositorio, ejecuta:

```bash
docker compose up --build
```

Por defecto se utiliza el proxy `/api` de Vite. Para apuntar a otro origen de backend, copia `frontend/.env.example` como `frontend/.env` y configura allí `VITE_API_BASE_URL`.

- Dashboard: http://localhost:5173
- API del backend: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- Esquema OpenAPI: http://localhost:8000/openapi.json

## Desarrollo y comprobaciones

Con los servicios de Docker Compose en ejecución:

```bash
docker compose exec backend pytest
docker compose exec frontend npm test
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```

## API

Todos los endpoints de métricas devuelven datos sintéticos. Actualmente, el dashboard solo consume `GET /api/metrics`.

| Método y ruta | Propósito |
|---|---|
| `GET /health` | Comprobación de salud |
| `GET /api/metrics` | Lista movimientos; admite filtros de fecha, categoría y operación |
| `GET /api/metrics/facets` | Devuelve valores disponibles para filtros y límites de fechas |
| `GET /api/metrics/summary` | Agrupa ingresos, gastos y neto por día, semana o mes |
| `GET /api/metrics/categories/top` | Ordena categorías por importe total |
| `GET /api/metrics/comparison` | Compara valores netos entre rangos de fechas consecutivos |
| `GET /api/metrics/alerts` | Detecta periodos con aumentos de gastos |
| `GET /api/metrics/b2b` | Lista movimientos B2B |
| `GET /api/metrics/b2c` | Lista movimientos B2C |

Consulta Swagger UI en `/docs` para ver los parámetros de petición y los esquemas de respuesta.

## Estructura del repositorio

```text
backend/
   app/       Aplicación FastAPI, modelos, generación de datos sintéticos y rutas
   tests/     Pruebas del backend
frontend/
   src/
      components/dashboard/  Componentes del dashboard
      components/ui/         Componentes UI compartidos
      lib/                   Tipos y cálculos financieros
```

---

Este y muchos otros proyectos son construidos por estudiantes como parte de los [Coding Bootcamps](https://4geeksacademy.com/) de 4Geeks Academy. Encuentra más acerca de los [cursos](https://4geeksacademy.com/es/comparar-programas) de [Ingeniería de IA](https://4geeksacademy.com/es/coding-bootcamps/ingenieria-ia), [Data Science & Machine Learning](https://4geeksacademy.com/es/coding-bootcamps/curso-datascience-machine-learning), [Ciberseguridad](https://4geeksacademy.com/es/coding-bootcamps/curso-ciberseguridad) y [Full-Stack Software Developer con IA](https://4geeksacademy.com/es/coding-bootcamps/programador-full-stack).
