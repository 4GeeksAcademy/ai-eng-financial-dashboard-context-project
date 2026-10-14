# Dependencias de backend con versiones fijas

## Alcance
Gestion de dependencias Python del backend.

## Regla
Las dependencias en backend/requirements.txt deben estar pinneadas con version explicita.
No se aceptan nuevas dependencias sin version.

## Razon
El estado actual sin pinning produce builds no deterministicas y riesgo de incompatibilidades.
Evidencia de Fase 2: backend/requirements.txt.

## Como verificarla
1. Revisar backend/requirements.txt.
2. Confirmar que cada paquete use version fija.
3. Rechazar cambios con dependencias sin version o rangos abiertos en este archivo.