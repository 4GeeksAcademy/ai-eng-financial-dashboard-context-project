# Debug remoto solo para desarrollo local

## Alcance
Ejecucion Docker del backend y exposicion de puertos.

## Regla
No exponer puerto de debug remoto en configuraciones compartidas o de entrega.
Debugpy debe habilitarse solo en perfil local de desarrollo.

## Razon
La exposicion actual de debug remoto puede permitir acceso no autorizado si se publica sin controles.
Evidencia de Fase 2: backend/Dockerfile y docker-compose.yml.

## Como verificarla
1. Revisar backend/Dockerfile para comando de arranque.
2. Revisar docker-compose.yml para mapeo de puertos.
3. Confirmar que 5678 no se publique fuera de perfil local controlado.