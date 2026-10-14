# Separacion estricta entre frontend y backend

## Alcance
Estructura de carpetas, Docker y cambios de codigo.

## Regla
No mezclar logica de backend dentro de frontend ni logica de frontend dentro de backend.
Todo cambio debe ubicarse en su capa correspondiente y su configuracion asociada.

## Razon
El repositorio mantiene una separacion clara por carpetas y contenedores, lo que facilita mantenimiento y despliegue.
Evidencia de Fase 2: frontend/, backend/, frontend/Dockerfile, backend/Dockerfile, docker-compose.yml.

## Como verificarla
1. Revisar ubicacion de archivos nuevos y modificados.
2. Confirmar que cambios de API queden en backend/ y cambios de UI en frontend/.
3. Confirmar que ajustes de ejecucion de cada capa se hagan en su Dockerfile y no en la capa opuesta.