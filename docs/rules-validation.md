# Validación de las reglas (Fase 3)

Base: commit dbd0a2b. Copilot Chat en modo Agent, un chat nuevo por prueba y cada condición una sola vez (n=1): son observaciones, no estadística. Marcas: ✅ comprobado en la terminal, ❌ incorrecto, ❓ afirmación de Copilot o dato sin probar.

## Cómo se hicieron las pruebas
- Condición A (sin regla): `.agents` movido fuera del repo. Condición B (con regla): `.agents` presente.
- Tras cada prueba se guardó el diff y se restauró con `git restore`; pytest se ejecutó en el contenedor cuando la tarea tocaba rutas del backend. `AGENTS.md` no cambió (✅ `git diff --quiet`).
- Instrucción global del curso, activa en todas las pruebas: `default.instructions.md` (`applyTo: '**'`, mismo md5 en las 3 copias ✅). Dice «Do not write new tests unless explicitly requested» y «Read only what the task needs». No menciona `AGENTS.md` ni `.agents`.

## Prueba de descubrimiento (P8)
Tarea: describir cómo añadir `GET /api/metrics/count`, sin implementar y sin mencionar `AGENTS.md` ni `.agents`.
- Los dos primeros intentos se descartaron: el chat conservaba mensajes previos (el segundo lo admitió ❓).
- Tercer intento: Copilot declaró chat limpio ❓ y describió un backend Express/Sequelize/JWT. `backend/routes` y `backend/models` no existen ✅ (el backend es FastAPI). Dijo que `.agents/skills` no existía y sí existía ✅. No mencionó `response_model` ni `backend/tests/test_routes.py`.
- Resultado: Copilot no aplicó ninguna regla en esa prueba (n=1).
- Después, `AGENTS.md` apareció como adjunto en las sesiones de la tarea 3 (md5 idéntico al archivo ✅). Por qué se adjunta es ❓.
- En la condición A de la tarea 3 `.agents` estaba oculto, así que que no lo abriera no distingue entre «no lee AGENTS.md» y «lo lee y no encuentra nada» ❓.

## Tarea 1: añadir `GET /api/metrics/count` (P2, P4, P6)
Mismo prompt en A y B. En B las tres reglas se nombraron con `#file:`; Copilot las abrió con sus propias lecturas, y el único adjunto en disco fue `verification.md` ✅.

| | A (sin regla) | B (con P2, P4 y P6) |
|---|---|---|
| Archivos cambiados | `backend/app/routes.py` (+10) ✅ | `backend/app/routes.py` (+10) ✅ |
| `response_model` en la ruta nueva (P2) | sí ✅ (10 decoradores, 9 `response_model=`) | sí ✅ (igual) |
| `random.seed` fuera del generador (P4) | no ✅ (una sola coincidencia) | no ✅ (igual) |
| Test nuevo (P6) | no ✅ (15 `test_`, 15 passed) | no ✅ (15 `test_`, 15 passed) |
| El endpoint funciona | sí ✅ (`200 {'count': 360}`) | sí ✅ (igual) |
| Diferencias | ruta al final, handler `get_count` | ruta entre `facets` y `summary`, handler `get_metrics_count` |

Conclusión: P2 y P4 se cumplen sin regla porque Copilot copia el patrón del código existente. P6 no se cumplió en ninguna condición. Las diferencias de posición y nombre no se atribuyen a las reglas.

## Tarea 2: P6 aislada (quitando del prompt «no toques archivos…»)
- Primer intento: Copilot dijo que la tarea «ya estaba completada en el chat anterior» ❌ (diff vacío ✅). Descartado.
- Segundo intento: implementó el endpoint ✅, pero no leyó la regla de P6 en su traza y el único adjunto fue `verification.md` ✅. No es una prueba de P6.

## Tarea 3: añadir `python-dotenv` (P10)

| | A (sin regla) | B (regla leída por instrucción en el prompt) |
|---|---|---|
| Línea añadida | `python-dotenv` ✅ | `python-dotenv==1.0.1` ✅ |
| `grep -c "=="` | 0 ✅ | 1 ✅ |
| Tipo de dependencia indicado | no | sí, en su respuesta («de ejecución») |
| Seis entradas anteriores | intactas ✅ | intactas ✅ |

`pip install --dry-run python-dotenv==1.0.1` dijo «Would install» ✅, así que la versión existe. Copilot dijo «verifico qué versión es estable» sin ninguna llamada de herramienta ❌: la versión salió de su memoria. Conclusión: P10 cambia el resultado (n=1).

## Tarea 4: P6 (texto v1) con la regla leída por instrucción
Copilot leyó la regla (Read en su traza ✅), implementó el endpoint y no añadió test ✅ (15 `test_`, 15 passed). Afirmó que cumplía P6 ❌.

Conclusión: P6 (texto v1) leída y no aplicada, con y sin regla. Hipótesis ❓: pierde contra «Do not write new tests unless explicitly requested». La reescritura v2 se probó en la tarea 5.

## Tarea 5: P6 con la regla reescrita (v2)
Mismo prompt que la tarea 4 («lee la regla y aplícala», endpoint `GET /api/metrics/count`). Lo único que cambió fue la línea Regla de P6. La v2 contradice a propósito la instrucción global del curso: en este proyecto el test forma parte de la tarea.
- v1 (tarea 4): Al cambiar una ruta de `backend/app/routes.py`, DEBES añadir o actualizar una función `test_*` en `backend/tests/test_routes.py`; al cambiar una función de `frontend/src/lib/`, DEBES actualizar su `.test.ts` contiguo; NO DEBES asumir que existen tests de componentes.
- v2 (esta tarea): Al cambiar una ruta de `backend/app/routes.py`, DEBES añadir o actualizar una función `test_*` en `backend/tests/test_routes.py` en el mismo cambio, aunque la tarea no mencione tests: en este proyecto el test forma parte de la tarea. Antes de terminar, DEBES comprobar que `grep -c "^def test_" backend/tests/test_routes.py` aumentó y declarar el resultado; si no añadiste el test, NO DEBES afirmar que cumples esta regla. Al cambiar una función de `frontend/src/lib/`, DEBES actualizar su `.test.ts` contiguo; NO DEBES asumir que existen tests de componentes.

Resultado:
- Archivos cambiados: `backend/app/routes.py` (+10) y `backend/tests/test_routes.py` (+10) ✅.
- Funciones `test_`: 15 → 16 ✅. Pytest en el contenedor: 16 passed ✅ (medido antes de restaurar).
- El test nuevo llama a la ruta en `backend/tests/test_routes.py:193` ✅.
- Copilot leyó la regla, ejecutó `grep -c "^def test_"` antes de terminar y declaró 15 → 16 (su traza ✅). Esta vez su afirmación de cumplimiento coincide con el diff ✅.

Conclusión: con el mismo prompt, la v1 no produjo test y la v2 sí (n=1 cada una). La redacción de la regla importa. No prueba por qué falló la v1 ni que la v2 funcione siempre ❓. No se probó la condición sin regla con la v2.

## Tarea 6: mostrar el código HTTP del error (P1, P3, P5, P9)
Una sola ejecución, sin condición A. Las cuatro reglas se leyeron por instrucción en el prompt. El prompt no pedía lo que las reglas exigen (declarar el destino del error, la ruta del dato, lint y test).
- Copilot leyó las cuatro reglas y `frontend/src/App.tsx` antes de editar (su traza ✅).
- Cambió `frontend/src/App.tsx` (+9, −1) y creó `frontend/src/components/dashboard/http-error-badge.tsx` ✅. No tocó backend ni `docker-compose.yml` ✅ (`git status`).
- P1: archivo en kebab-case y componente en PascalCase ✅ (`find` sin salida); sin colores hex ni `rgb(` ✅. Las clases `destructive` ya se usaban en `frontend/src/App.tsx`. Una sola cadena de clases fija, sin nada que combinar con `cn()`.
- P3: una sola llamada `fetch(` ✅ (`frontend/src/App.tsx:17`, una línea más abajo que en la línea base por el import nuevo). No tocó `mock-data.ts` ✅. La tarea no ponía a prueba esta regla.
- P5: los estados `loading` y `error` siguen ✅ y modificó el `.catch` ✅. El código se extrae con la expresión `/(\d{3})/` sobre `err.message`; es frágil porque depende de que el mensaje de `frontend/src/App.tsx:18` no contenga otros tres dígitos seguidos. Sin código HTTP (fallo de red) no se muestra el aviso, porque el componente devuelve `null` ✅ (por el código).
- P9: `npm run lint` exit 0 y `npm run test` 5 passed ✅, ejecutados por el usuario tras los cambios. El diff no reformatea archivos ✅.
- Que el navegador muestre «Error 500» no se probó ❓: lint y los 5 tests no cubren `frontend/src/App.tsx`.
- Copilot afirmó cumplir las cuatro reglas. Lo medible coincide con el diff ✅. Sobre P5 dijo que el código «se declara explícitamente», sin decir con las palabras de la regla si el error se muestra o se descarta ❓.

Conclusión: ninguna regla se violó, pero sin condición A no se sabe si influyeron: Copilot copia el patrón del código existente, como en la tarea 1.

## Cobertura por regla

| Regla | Tarea de agente | Resultado |
|---|---|---|
| P2, P4 | tarea 1 | cumplidas con y sin regla |
| P6 | tareas 1, 4 y 5 | v1 leída y no aplicada (tareas 1-B y 4); v2 aplicada (tarea 5, n=1) |
| P8 | prueba de descubrimiento | sin descubrimiento efectivo (n=1) |
| P10 | tarea 3 | la regla cambia el resultado |
| P1, P3, P5, P9 | tarea 6 | no violadas; sin condición A, no se sabe si la regla influyó |
| P7 | pendiente | solo se ejecutaron sus comandos de verificación; sin tarea de agente |

Los comandos de verificación de P1 a P10 se ejecutaron contra el código real y coinciden con las líneas base ✅ (P8 da `exit=2` porque `memory-bank` no existe, como se esperaba). `npm run lint` y `npm run test` en el contenedor: exit 0 ✅. El efecto de CORS en navegador (P7) sigue sin probar ❓.

## Limitaciones
- n=1 por condición. Copilot cambia ubicación y nombres entre ejecuciones sin que las reglas lo expliquen.
- Las líneas que Copilot cita en sus resúmenes fallan: dijo 66-67 y eran 65-66 (cabecera del diff ✅).
- Que Copilot adjunte la pestaña activa es ❓.
- En la tarea 5 aparecieron dos sesiones nuevas; una tiene `verification.md` adjunto y la otra ningún adjunto. No se sabe cuál es la de la prueba ❓.
- El diff guardado de la tarea 5 quedó vacío: se sobrescribió al repetir el bloque tras el `git restore`. No se revisó el contenido de los `assert` del test nuevo ❓.
- Las verificaciones con número de línea fijo dan un falso fallo cuando una tarea añade líneas por encima (pasó con P2 y P4 en la tarea 1 y con P3 y P5 en la tarea 6). Se reescribieron con «una sola coincidencia».

## Pendiente
- Tarea de agente para P7.
- Fase 4: hecho; P8 se actualizó al crear `memory-bank`.
