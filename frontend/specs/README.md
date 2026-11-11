# Contrato de datos

La API usa modelos JSON descritos en `api-types.ts`; sus parametros de consulta estan en `param-types.ts`. Los nombres de campos de la API usan `snake_case`. Los importes y porcentajes son numeros JSON.

## Valores permitidos

- `operation_type`: `income` o `outcome`.
- `category`: `suppliers`, `sales`, `operational`, `administrative` u `others`.
- `business_type`: `B2B` o `B2C`.
- `group_by`: `day`, `week` o `month`.
- Las fechas usan `YYYY-MM-DD`.

## Comportamiento y casos limite

- `start_date` y `end_date` son inclusivos y se pueden enviar por separado. La API no declara como valida una fecha inicial posterior a la final; no asumir un resultado especifico para ese rango.
- Los endpoints de listas pueden devolver arrays vacios cuando no hay coincidencias.
- La suma de importes se expone como `number`; la API redondea agregados a dos decimales.
- La comparacion calcula el neto (ingresos menos egresos) del periodo actual y del periodo anterior de igual duracion. Si el neto anterior es cero, `delta_pct` es `null`.
- `delta_pct` se expresa como porcentaje numerico (por ejemplo, `25` equivale a 25%), mientras que `increase_ratio` es una proporcion (por ejemplo, `0.25` equivale a 25%). No formatear ambos del mismo modo sin considerar su unidad.
- Las alertas comparan cada periodo con el promedio de los periodos anteriores dentro de la consulta; no hay alerta para el primer periodo ni cuando el promedio base es cero. La condicion es estrictamente mayor que `threshold`.
- `limit` para categorias principales esta restringido a enteros de 1 a 20.
- En el calculo de margen, el cliente usa cero cuando los ingresos son cero. El backend entrega `net`, no un porcentaje de margen.
- Los datos son simulados; no asumir persistencia, actualizacion en vivo ni semantica contable adicional.

## Errores

La API puede responder con errores HTTP para parametros invalidos o fallos de servicio. El cliente debe distinguir esos fallos de una respuesta correcta con array vacio. El endpoint de salud conocido es `/health`.

