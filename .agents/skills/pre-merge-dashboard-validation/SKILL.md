---
name: pre-merge-dashboard-validation
description: "Usar al pedir validación pre-merge, comprobaciones antes de fusionar o preparación para revisión del dashboard. Selecciona y ejecuta solo las comprobaciones frontend pertinentes, revisa el alcance backend sin ejecutar pytest e informa resultados y pendientes. No constituye un pipeline CI."
---

# Validación pre-merge del dashboard

## Objetivo

Aplicar una checklist de validación proporcional al cambio y producir un
informe verificable de lo ejecutado, los fallos y los pendientes.

Esta skill complementa las reglas del proyecto; no sustituye sus criterios
de pruebas ni garantiza que un cambio esté listo para merge.

## Entradas

- Archivos modificados y diff respecto a una referencia acordada.
- Cambios locales pendientes, si forman parte del alcance solicitado.
- Comportamiento que se pretende cambiar.
- Restricciones de ejecución y entorno disponible.

Si la referencia de comparación es ambigua, aclararla antes de seleccionar
comprobaciones. No asumir una rama base ni mezclar cambios ajenos.

## Checklist

### 1. Determinar el alcance

- [ ] Identificar los archivos modificados y el comportamiento afectado.
- [ ] Consultar las [reglas de pruebas y documentación](../../rules/testing-and-documentation.md).
- [ ] Clasificar el cambio:
  - Frontend: código, tipos, pruebas o configuración de frontend.
  - Backend: código, pruebas o configuración de backend.
  - Ambas capas: cambios en ambas o en su frontera de integración,
    incluidos contrato API, proxy, origen de API o Docker Compose.
  - Solo documentación: no ejecutar pruebas salvo que exista una
    comprobación documental aplicable.
- [ ] Consultar las reglas específicas que correspondan:
  - [Frontend y contrato API](../../rules/frontend-contract-and-structure.md).
  - [Backend y rutas API](../../rules/backend-api.md).
  - [Datos y cálculos financieros](../../rules/financial-data-and-calculations.md).

No copiar estas reglas ni convertir su consulta en una afirmación de que
el comportamiento está probado.

### 2. Seleccionar comprobaciones frontend

Los siguientes scripts están definidos en
[frontend/package.json](../../../frontend/package.json).
Todos se ejecutan desde el directorio frontend/.

- [ ] Seleccionar solo las comprobaciones pertinentes:
  - Código TypeScript/React: `npm run lint` y `npm run build`.
  - Comportamiento cubierto por pruebas: ejecutar las pruebas afectadas.
  - Cálculos o formateadores financieros:
    `npm run test -- src/lib/financial-utils.test.ts`.
  - Cambios transversales en utilidades o infraestructura de pruebas:
    `npm run test`, si se justifica ejecutar toda la suite frontend.
  - Cobertura solicitada explícitamente: `npm run test:coverage`.

Alcance de los comandos:
- `npm run lint`: ejecuta ESLint.
- `npm run build`: ejecuta `tsc -b && vite build`.
- `npm run test`: ejecuta `vitest run`.
- `npm run test:coverage`: ejecuta `vitest run --coverage`.

El selector de archivo se pasa al script existente de Vitest; no es un
script adicional del repositorio. Su ejecución debe confirmarse en el
entorno antes de reportar resultados.

- [ ] Comprobar los prerrequisitos sin asumir dependencias instaladas.
- [ ] Ejecutar únicamente los comandos seleccionados.
- [ ] Si falta una dependencia, informar el bloqueo; no instalarla
      automáticamente ni sustituir el comando por otro inventado.

Las pruebas actuales de utilidades no demuestran por sí solas que los
componentes, la carga API o la integración funcionen. Si el cambio no
tiene cobertura adecuada, indicarlo como pendiente.

### 3. Revisar cambios backend sin ejecutar pytest

- [ ] Revisar el diff y las pruebas relacionadas en
      [backend/tests](../../../backend/tests).
- [ ] Identificar qué comportamiento queda cubierto y qué queda pendiente.
- [ ] No ejecutar pytest, ni directamente ni mediante Docker, scripts
      alternativos u otro intérprete.

Contexto conocido, solo como referencia:
- Directorio de ejecución previsto: backend/.
- Comando: `python -m pytest`.
- [requirements.txt](../../../backend/requirements.txt) declara pytest.
- [conftest.py](../../../backend/tests/conftest.py) añade backend/ al
  sys.path para importar app.
- La ejecución comprobada anteriormente terminó con
  `No module named pytest`, antes del descubrimiento de pruebas.

Ese antecedente no demuestra el estado actual de las dependencias.
En esta versión de la skill, la validación dinámica backend queda
pendiente por restricción de alcance. No afirmar que las pruebas
backend pasan ni que la revisión estática las sustituye.

### 4. Revisar cambios que cruzan ambas capas

- [ ] Aplicar las secciones frontend y backend.
- [ ] Revisar la coherencia de contratos y configuración afectada,
      siguiendo las reglas enlazadas.
- [ ] Identificar si hace falta una comprobación integrada del flujo
      modificado y describirla como pendiente si no se ejecuta.

No existe una tarea raíz identificada que ejecute ambas suites.
No presentar los comandos frontend como validación de todo el proyecto.

El comando documentado `docker compose up --build`, desde la raíz,
construye e inicia servicios; no ejecuta las suites. No iniciarlo
automáticamente como parte de esta checklist. Si hace falta validar
arranque o conectividad, informar esa necesidad por separado.

### 5. Registrar resultados

- [ ] Distinguir definición de comandos, inspección estática y ejecución.
- [ ] Registrar cada comprobación seleccionada con uno de estos estados:
  - PASÓ: se ejecutó y terminó correctamente; indicar alcance.
  - FALLÓ: se ejecutó y devolvió error; incluir el error relevante.
  - BLOQUEADA: no pudo completarse por un prerrequisito ausente.
  - NO EJECUTADA: no se lanzó; explicar el motivo.
- [ ] No marcar una comprobación como PASÓ por leer su configuración.
- [ ] No ocultar fallos con reintentos o comandos alternativos.
- [ ] No modificar código, pruebas o dependencias durante la checklist.
      Proponer las correcciones como trabajo separado.

## Salida esperada

1. Referencia del diff y clasificación del cambio.
2. Comprobaciones seleccionadas y justificación breve.
3. Tabla de resultados:

| Comprobación o comando | Directorio | Estado | Evidencia o motivo | Pendiente |
|---|---|---|---|---|

4. Conclusión limitada al alcance comprobado:
   - Qué se validó realmente.
   - Qué falló o quedó bloqueado.
   - Qué sigue sin verificar antes del merge.

Si hubo cambios backend, incluir expresamente que pytest no se ejecutó.
No emitir una aprobación global de merge basada solo en comprobaciones
parciales.

## Criterios de aceptación

- [ ] El alcance se deriva del diff y de una referencia identificada.
- [ ] Solo se ejecutan comprobaciones pertinentes al cambio.
- [ ] Cada comando tiene directorio y resultado explícitos.
- [ ] No se ejecuta pytest.
- [ ] Los fallos, bloqueos y comprobaciones no ejecutadas son visibles.
- [ ] No se afirman resultados que no fueron observados.
- [ ] Se remite a las reglas existentes sin duplicarlas.
- [ ] No se promete una tarea conjunta ni un pipeline CI inexistentes.

## Fuera de alcance

- Crear o configurar CI.
- Ejecutar pytest en esta versión de la skill.
- Instalar dependencias o corregir archivos automáticamente.
- Iniciar servicios o ejecutar pruebas E2E de forma automática.
- Auditorías completas de seguridad, accesibilidad o rendimiento.
- Garantizar despliegue, cobertura total o autorización de merge.
