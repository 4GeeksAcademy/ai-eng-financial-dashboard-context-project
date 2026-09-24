# Memory bank del proyecto

## Propósito

Este directorio conserva contexto técnico y funcional verificable para futuras sesiones del agent.

No es una descripción genérica: cada documento resume decisiones y límites comprobados en el código, la configuración, las pruebas y el historial de cambios del repositorio. Su función es reducir re-descubrimiento y evitar que una futura colaboración con el agent confunda una capacidad implementada con una aspiración o una ejecución no realizada.

## Documentos

- [Descripción del producto](./product.md)
- [Stack tecnológico](./tech-stack.md)
- [Estado actual](./current-state.md)

## Convención de evidencia

- Las afirmaciones deben mapearse a una ruta concreta del repositorio.
- Un hecho leído desde un archivo se considera respaldado por código o configuración.
- Un comando documentado no implica que se haya ejecutado con éxito.
- Las validaciones ejecutadas deben incluir comando, directorio y resultado.
- Las capacidades ausentes o no comprobadas se deben marcar como `No verificado` o `No evidenciado`.

## Mantenimiento

Actualizar estos documentos cuando cambie el comportamiento, el stack o el estado de validación. No describir funcionalidades futuras como si ya estuvieran implementadas.

Antes de editar código, el agent debe leer `AGENTS.md`, `.agents/rules/` y este directorio. Después de una modificación, debe actualizar el estado solo con evidencia nueva y conservar la separación por fases de los commits. El historial reciente ilustra esa práctica: `06b55d1` corrigió el período dinámico, `783a89c` añadió reglas de evidencia y `8a9143b` versionó este memory-bank.

## Límites operativos conocidos

- La aplicación usa datos mock generados en backend; no debe presentarse como persistencia financiera real.
- El proxy `http://backend:8000` está respaldado para Docker Compose, no para ejecutar Vite directamente en el host sin configuración adicional.
- La configuración y los scripts disponibles no equivalen a una validación ejecutada. Los resultados deben registrarse con comando, directorio y resultado.

## Fuentes de la convención

- `AGENTS.md`
- `.agents/rules/01-evidence-first.md`
- `.agents/rules/05-validation-and-commits.md`
- `.agents/rules/06-validation-context.md`
