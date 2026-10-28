# Reglas de documentación

## Nombre

Mantener la documentación en español e inglés coherente con el repositorio y distinguir los hechos revisados de los verificados en ejecución.

## Alcance

`README.md`, `README.es.md`, `verification.md`, `sistem-engenieer.md` y cualquier documentación Markdown nueva en la raíz o `.agents/`.

## Justificación

El repositorio mantiene README en inglés y español con instrucciones equivalentes. `verification.md` separa afirmaciones confirmadas, parciales o incorrectas, y advierte cuando una conclusión es estática y no fue verificada en ejecución. Los README documentan el proxy `/api`, los puertos y una configuración opcional; por eso, las instrucciones operativas deben contrastarse con los archivos existentes antes de afirmarse como funcionales.

## Instrucciones para agentes

- Si una modificación afecta instrucciones comunes del proyecto, actualiza ambas versiones del README con contenido semánticamente equivalente cuando el alcance de la tarea lo permita.
- Si el usuario limita explícitamente la edición a una versión del README, modifica solo esa versión; si el contenido también aplica a la otra, deja indicada la sincronización pendiente. Los cambios propios de idioma o localización pueden limitarse a una sola versión.
- Antes de documentar una variable, ruta, archivo de configuración, endpoint o comando, confirma que existe en el código y que su uso coincide con la documentación.
- Distingue explícitamente la inspección estática de una comprobación en ejecución. No describas servicios como probados si no se ejecutaron.
- Cuando la documentación existente contradiga el código verificado, corrige la afirmación afectada en vez de copiarla a otro documento.
- Mantén el inventario de archivos y los nombres existentes: el documento de hallazgos del repositorio se llama `sistem-engenieer.md`.

## Comprobación

Contrasta las instrucciones equivalentes de `README.md` y `README.es.md`; verifica que los archivos, variables, endpoints y comandos citados existan; confirma que cada afirmación de ejecución esté respaldada por una comprobación ejecutada o se presente como no verificada.