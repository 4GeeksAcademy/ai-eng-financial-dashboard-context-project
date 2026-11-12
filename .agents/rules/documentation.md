# Documentación del proyecto

## Propósito
Mantener coherentes los procedimientos operativos documentados y distinguirlos de las verificaciones ejecutadas.

## Ámbito
Cambios de arranque, puertos, configuración o instrucciones de desarrollo.

## Evidencia del repositorio
- `README.md` y `README.es.md` documentan el arranque con Docker Compose y las URLs locales en dos idiomas.
- `docker-compose.yml` y los Dockerfiles definen servicios, puertos y comandos efectivos.

## Instrucciones para el agente
- Si cambia un procedimiento, puerto o variable documentada, actualiza ambas versiones del README.
- Comprueba los comandos y valores documentados contra `docker-compose.yml`, Dockerfiles y configuración Vite.
- Describe una comprobación como ejecutada solo cuando se haya corrido; diferencia instrucciones declaradas de resultados observados.

## Comprobaciones antes de finalizar
- Compara las instrucciones correspondientes en `README.md` y `README.es.md`.
- Contrasta comandos, puertos y variables con los archivos de configuración reales.
- Indica cuáles comprobaciones se ejecutaron y cuáles quedan pendientes.