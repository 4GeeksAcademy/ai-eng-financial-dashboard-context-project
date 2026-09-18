# Panel de Métricas Financieras

<!-- hide -->

Por [@marcogonzalo](https://github.com/marcogonzalo) y [otros contribuidores](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) en [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_These instructions are [available in English](./README.md)._

**Antes de empezar**: 📗 [Lee las instrucciones](https://4geeks.com/es/lesson/como-comenzar-un-proyecto-de-codificacion) sobre cómo comenzar un proyecto de programación.

<!-- endhide -->

---

_Dashboard de métricas financieras con frontend en React + TypeScript y backend en FastAPI._

## Pasos recomendados

1. Haz un fork de este repositorio a tu cuenta.
2. Abre tu fork en GitHub Codespaces o clónalo y ejecútalo en tu entorno local.
3. Ejecuta tu agente de IA para inspeccionar frontend y backend.
4. Documenta las reglas propuestas y el banco de memoria en tu fork.
5. Ajusta y valida las reglas hasta que sean aplicables al flujo real del proyecto.

## Estructura esperada del directorio para agentes

```text
./.agents
└─ /rules
   └─ <nombre-regla>.md
└─ /skills
   └─ /<nombre-skill>
      └─ /SKILL.md
```

## Cómo ejecutar en local

```bash
docker compose up --build
```

El frontend siempre llama a la API mediante la URL relativa `/api/metrics`. Vite
redirige esa ruta usando `VITE_API_PROXY_TARGET`. Docker Compose define esta
variable como `http://host.docker.internal:8000` y asigna `host.docker.internal`
al host de Docker, algo necesario al ejecutar el contenedor frontend en GitHub
Codespaces. Vite escucha en `0.0.0.0:5173` y FastAPI en `0.0.0.0:8000`.

Después verifica los servicios y la API a través del proxy desde el host del
workspace:

```bash
docker compose config
docker compose ps
curl -I http://localhost:8000/docs
curl http://localhost:8000/api/metrics
curl -I http://localhost:5173
```

En otro entorno puedes sobrescribir `VITE_API_PROXY_TARGET` al iniciar el
servicio frontend. Mantén la petición de la aplicación relativa para que siga
funcionando mediante el proxy de Vite:

```bash
VITE_API_PROXY_TARGET=http://host.docker.internal:8000 docker compose up --build
```

Si TypeScript muestra el error `Cannot find type definition file for
'vite/client'`, instala las dependencias del frontend para que el paquete
`vite` esté disponible localmente:

```bash
cd frontend
npm install
npm ls vite
```

Si utilizas Docker, puedes comprobarlo dentro del contenedor:

```bash
docker compose build --no-cache frontend
docker compose up -d frontend
docker compose exec frontend npm ls vite
```

La entrada `"vite/client"` de `frontend/tsconfig.app.json` debe mantenerse,
porque proporciona los tipos de Vite para `import.meta.env`.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Documentación API: http://localhost:8000/docs

---

Este y muchos otros proyectos son construidos por estudiantes como parte de los [Coding Bootcamps](https://4geeksacademy.com/) de 4Geeks Academy. Encuentra más acerca de los [cursos](https://4geeksacademy.com/es/comparar-programas) de [Ingeniería de IA](https://4geeksacademy.com/es/coding-bootcamps/ingenieria-ia), [Data Science & Machine Learning](https://4geeksacademy.com/es/coding-bootcamps/curso-datascience-machine-learning), [Ciberseguridad](https://4geeksacademy.com/es/coding-bootcamps/curso-ciberseguridad) y [Full-Stack Software Developer con IA](https://4geeksacademy.com/es/coding-bootcamps/programador-full-stack).
