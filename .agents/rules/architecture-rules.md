# 📐 Reglas de Arquitectura y Diseño

> Aplica a: backend y frontend

---

## ARQ-01: Funciones de negocio puras

Toda función que contenga lógica de negocio debe ser una **función pura** (sin efectos secundarios, sin depender del request/response HTTP).

**Motivación:** Preserva la separación de responsabilidades y permite testear la lógica aisladamente.

**Verificación:** En code review: las rutas HTTP solo deben llamar funciones y devolver su resultado.

---

## ARQ-02: Capa de abstracción de datos

Los datos mockeados deben aislarse tras una **capa de abstracción** (interfaz/clase repositorio). El código de negocio nunca debe importar `generate_mock_movements` directamente.

**Motivación:** Permite intercambiar mocks por BD real sin reescribir las rutas.

**Verificación:** Buscar imports de `generate_mock_movements` en `routes.py`. Deben desaparecer.

---

## ARQ-03: Separación lógica ↔ presentación

Prohibido mezclar lógica de negocio con lógica de presentación. Los componentes React no deben contener transformaciones de datos complejas.

**Motivación:** Mantiene el frontend desacoplado y facilita el testing.

**Verificación:** En code review: si un componente tiene más de 5 líneas de lógica de transformación, debe moverse a `lib/`.
