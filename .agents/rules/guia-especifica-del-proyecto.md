# Guía específica del proyecto

1. No fijar en la interfaz etiquetas de período que puedan divergir del rango entregado por la API.
2. Derivar el período de las fechas mínima y máxima de los movimientos recibidos o de los metadatos de la API. Antes de duplicar lógica, comprobar si `GET /api/metrics/facets` de [backend/app/routes.py](../../backend/app/routes.py) cubre el caso.
3. Mantener el texto visible alineado con la lógica de `generate_mock_movements` y sus filtros. Si cambia la regla del rango (por ejemplo, para incluir el mes actual), actualizar también el período mostrado y la documentación.
4. Identificar los movimientos como datos simulados y aclarar que su rango depende de la fecha de ejecución; no describir la semilla como garantía de un período fijo.
5. Al cambiar esta conducta, comprobar que el período mostrado coincide con las fechas devueltas por la API. Informar si la comprobación fue estática o si se ejecutaron pruebas.