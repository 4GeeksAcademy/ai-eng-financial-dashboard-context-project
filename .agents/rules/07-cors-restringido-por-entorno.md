# CORS restringido por entorno

## Alcance
Configuracion de seguridad de la API.

## Regla
No usar allow_origins con comodin y credenciales habilitadas fuera de desarrollo local.
La lista de origenes permitidos debe configurarse por entorno.

## Razon
La configuracion actual amplia superficie de ataque cuando se reutiliza fuera de entorno controlado.
Evidencia de Fase 2: backend/app/main.py.

## Como verificarla
1. Revisar backend/app/main.py y configuracion de entorno.
2. Confirmar que no exista combinacion de wildcard con credenciales en despliegues compartidos.
3. Verificar que los origenes permitidos sean explicitos para cada entorno.