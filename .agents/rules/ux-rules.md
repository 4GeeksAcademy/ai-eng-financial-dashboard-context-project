# 🎨 Reglas de UX / Interfaz de Usuario

> Aplica a: frontend (componentes React)

---

## UX-01: Estados visuales completos

Todo componente que consuma datos asíncronos debe manejar **al menos 3 de 4 estados**: `loading`, `empty`, `error`, `data`.

**Motivación:** Evita pantallas en blanco o errores silenciosos para el usuario.

**Verificación:** En code review: comprobar que el componente tenga `if (loading)`, `if (!hasData)` y `if (error)`.

---

## UX-02: Colores como CSS variables

Los colores y tokens de diseño deben definirse como **CSS variables** en `index.css`. No se permiten valores de color hardcodeados en componentes.

**Motivación:** Mantiene la consistencia visual y facilita el modo oscuro.

**Verificación:** Buscar valores de color literales (`#...`, `rgb(...)`) en archivos `.tsx`.

---

## UX-03: Heredar tokens de diseño existentes

Todo nuevo componente visual debe heredar los tokens existentes. Si se necesita un nuevo token, debe agregarse en `index.css` para ambos modos (`:root` y `.dark`).

**Motivación:** Escala el sistema de diseño sin duplicación ni inconsistencias.

**Verificación:** En code review: verificar que no se introduzcan variables no declaradas en `index.css`.
