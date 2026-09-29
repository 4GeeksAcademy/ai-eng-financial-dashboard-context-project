# 🧪 Reglas de Testing

> Aplica a: backend (pytest), frontend (Vitest)

---

## TST-01: Tests para cada endpoint nuevo

Todo endpoint nuevo debe tener al menos **un test que verifique el caso feliz** y **un test que verifique un edge case** (datos vacíos, fechas inválidas, filtros extremos).

**Motivación:** Mantiene la cobertura de las rutas y previene regresiones.

**Verificación:** `pytest --cov=app tests/` — la cobertura de `routes.py` no debe bajar del 80%.

---

## TST-02: Tests unitarios para funciones en lib/

Toda función pura en `lib/` del frontend debe tener su correspondiente test unitario con **Vitest**.

**Motivación:** Asegura que la lógica del lado del cliente funciona correctamente.

**Verificación:** `npx vitest run` — no debe fallar ningún test y la cobertura debe mantenerse o aumentar.

---

## TST-03: Preservar tests existentes

Prohibido eliminar o modificar tests existentes sin revisión explícita. Los tests son la red de seguridad del proyecto.

**Motivación:** Evita que se pierda cobertura accidentalmente.

**Verificación:** En code review: señalar cualquier eliminación o modificación de tests.
