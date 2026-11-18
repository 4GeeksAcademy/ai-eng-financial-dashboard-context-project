---
name: api-usage-patterns
description: Analiza, documenta e integra APIs a partir de contratos y respuestas observadas. Úsala al explorar endpoints, diseñar clientes o conectar datos de una API a una interfaz.
---

# Patrones de uso de APIs según datos reales

## Objetivo

Documentar e implementar el consumo de una API usando evidencia verificable para definir sus endpoints, parámetros, respuestas y errores. Evitar inventar nombres de campos, valores por defecto o semánticas que no estén confirmados.

Distinguir siempre entre una respuesta HTTP observada y los datos que la API representa. Una respuesta real puede contener datos simulados, de prueba o anonimizados.

## Entradas definidas

Antes de analizar o integrar, reúne:

1. **Necesidad del consumidor:** qué pantalla, proceso o componente necesita los datos y qué debe hacer con ellos.
2. **API objetivo:** URL base y entorno autorizado, método HTTP, endpoint y parámetros conocidos. Si no se conocen, identifícalos inspeccionando el proyecto y su documentación.
3. **Evidencia disponible:** respuesta HTTP observada, esquema OpenAPI, implementación del servidor, tipos y pruebas. Registra qué fuentes se consultaron; no presentes una inferencia estática como una observación en vivo.
4. **Condiciones de uso:** autenticación, permisos, paginación, límites y restricciones de privacidad relevantes. No registres credenciales ni datos personales.
5. **Comportamiento esperado:** filtros, transformaciones y estados de interfaz requeridos, incluidos carga, error y resultado vacío.

Si falta un dato, inspecciona el repositorio o marca la incógnita. No completes contratos por intuición; solicita información cuando impida definir una integración correcta.

## Procedimiento basado en evidencia

1. Localiza la definición del endpoint y sus consumidores existentes. Consulta OpenAPI o documentación disponible y compárala con el código y las pruebas.
2. Cuando haya un entorno autorizado, realiza una petición segura y registra método, ruta, parámetros, estado HTTP y forma de la respuesta. No ejecutes operaciones que escriban o alteren datos sin autorización explícita.
3. Usa respuestas reales como evidencia de valores y estructura, pero no conviertas valores variables —como fechas, cantidades o elementos de listas— en constantes del producto.
4. Contrasta los campos observados con los tipos del cliente. El tipado estático no valida por sí solo el JSON recibido en tiempo de ejecución.
5. Implementa la petición y el mapeo con tipos concretos. Distingue entre error HTTP, respuesta vacía, valores nulos y datos válidos; no uses fallbacks que oculten errores.
6. Repite la misma petición o prueba pertinente después del cambio y comunica qué evidencia se verificó.

Si el servicio no está disponible, utiliza OpenAPI, código y pruebas como evidencia estática. Indica expresamente que no se verificó una respuesta en vivo y no inventes una muestra.

## Salida esperada

Entrega una nota concisa y accionable que incluya:

- **Endpoint:** método, ruta, entorno consultado y propósito.
- **Entradas:** parámetros o cuerpo, tipos, obligatoriedad, valores predeterminados y restricciones confirmados.
- **Respuesta observada o documentada:** estado HTTP, forma del JSON, campos y tipos; incluye una muestra mínima solo si procede y elimina información sensible.
- **Procedencia:** qué se observó en una petición real y qué se dedujo de OpenAPI, código o pruebas.
- **Integración:** tipo de cliente, mapeo de campos y tratamiento de carga, error y resultado vacío.
- **Verificación:** petición o prueba ejecutada y resultado; señala explícitamente cualquier comprobación pendiente.

## Criterios de aceptación

- [ ] Cada endpoint, parámetro y campo descrito está respaldado por una respuesta observada, OpenAPI, código o prueba identificable.
- [ ] Se diferencia la evidencia en vivo de la evidencia estática y no se afirma haber consultado el servicio si no se hizo.
- [ ] Se distingue el origen de los datos (producción, prueba, simulación o desconocido) de la realidad de la respuesta HTTP.
- [ ] Los valores variables no se fijan como constantes y los campos inciertos se marcan, no se inventan.
- [ ] El método, los parámetros, los tipos y la forma de respuesta coinciden con el contrato confirmado.
- [ ] Los errores HTTP y las respuestas vacías se manejan como estados distintos.
- [ ] Las muestras no exponen credenciales ni datos personales.
- [ ] La verificación informa de una petición o prueba concreta, o deja constancia de que no pudo ejecutarse.

## Ejemplo basado en este proyecto

El contrato actual de `GET /api/metrics` devuelve una lista directa de movimientos con `create_date`, `amount`, `operation_type`, `category` y `business_type`; no devuelve un objeto envoltorio `data`. El backend genera esos movimientos mediante `generate_mock_movements(seed=42)`, por lo que son datos simulados, no transacciones financieras reales. El rango de fechas depende de la fecha de ejecución y no debe fijarse a partir de una respuesta de ejemplo.

La descripción se puede contrastar en [el contrato documentado](../../frontend/specs/api-contract.md), [las rutas del backend](../../backend/app/routes.py) y [las pruebas de rutas](../../backend/tests/test_routes.py).
