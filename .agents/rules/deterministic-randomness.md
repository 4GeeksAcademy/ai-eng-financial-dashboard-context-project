# D3: Evitar modificar el estado aleatorio global

**Alcance:** Generación de movimientos de ejemplo en `backend/app/routes.py` y cualquier uso de aleatoriedad determinista.

**Justificación:** `generate_mock_movements(seed=...)` llama a `random.seed(seed)` y después usa el módulo `random`, lo que reinicia el estado aleatorio compartido del proceso.

**Guía accionable:**
- Crea una instancia local `random.Random(seed)` para cada generación de datos.
- Pasa esa instancia a las funciones que necesitan aleatoriedad, en vez de llamar a `random.seed`.
- Mantén una prueba que confirme que una misma semilla produce los mismos movimientos y que la generación no altera el generador aleatorio global.