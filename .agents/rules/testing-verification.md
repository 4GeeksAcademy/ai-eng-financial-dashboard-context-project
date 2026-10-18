# Nombre: Pruebas y evidencia

## Alcance

Cambios de comportamiento, tests y registros de verificacion del repositorio.

## Justificacion

[package.json](../../frontend/package.json) define Vitest, lint y build con TypeScript. Existen suites en [financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts) y [test_routes.py](../../backend/tests/test_routes.py); [verification.md](../../verification.md) registra resultados anteriores.

## Guia del proyecto

- Reutilizar las suites y frameworks existentes. Agregar regresiones y casos limite para el comportamiento modificado, sin nuevos archivos cuando la suite existente sea adecuada.
- Ejecutar primero la prueba enfocada; si se corrige un fallo, demostrar fallo antes y exito despues cuando sea viable.
- Ampliar validacion segun impacto: build para cambios TypeScript, suite backend para helpers compartidos por rutas. No exigir suites completas por cambios solo documentales.
- Separar resultados actuales, evidencia historica, advertencias y pruebas no ejecutadas. No declarar una regla validada solo porque un test paso: registrar tambien la instruccion aplicada y la decision resultante.

## Verificacion

Desde la raiz, con contenedores activos y dependencias instaladas:

```bash
docker compose exec frontend npm test -- src/lib/financial-utils.test.ts
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
docker compose exec backend pytest tests/test_routes.py
```

Seleccionar los comandos pertinentes, no ejecutarlos todos por rutina. Registrar salida resumida, resultado y limitaciones.