# Verificación del proyecto

## Cambios ejecutados

- Añadidas cuatro reglas en `.agents/rules/`: contratos de API, estructura frontend, datos y pruebas, y seguridad en runtime.
- Añadida `memory-bank/project.md` con descripción del producto, stack y estado actual.
- Como tarea de prueba, se sustituyó el periodo fijo del dashboard por un rango calculado desde los meses presentes en los datos. Se añadieron pruebas para un cambio de año y para datos vacíos.
- Se actualizaron las referencias de las reglas para reflejar el estado actual del código y la existencia de `frontend/.env.example`.

## Riesgos que motivaron las reglas

- `AGENTS.md` exigía revisar `.agents/rules`, `.agents/skills` y `memory-bank`, pero esas carpetas no existían; faltaba orientación persistente para agentes.
- Los movimientos simulados usan una semilla fija, pero sus años dependen de la fecha actual. Una prueba backend usa fechas fijas de 2025, por lo que puede dejar de comprobar un periodo con datos.
- Los tipos del contrato están representados tanto en los modelos Pydantic como en TypeScript; cambios de API pueden desincronizar ambas capas.
- El backend permite cualquier origen CORS junto con credenciales, configuración que requiere revisión antes de despliegues reales.
- `npm ci` reportó 12 vulnerabilidades en dependencias: 1 baja, 5 moderadas y 6 altas. No se ejecutó `npm audit fix` ni se revisaron avisos individuales; requiere análisis separado antes de actualizar paquetes.
- `npm run build` terminó correctamente, aunque Vite advirtió que el bundle principal supera 500 kB.

La referencia del README a `frontend/.env.example` es válida: el archivo sí existe y no representa un riesgo actual.

## Validación

- `npm test`: 7 pruebas aprobadas.
- `npm run lint`: aprobado.
- `npm run build`: aprobado con la advertencia de tamaño del bundle indicada arriba.
- No se modificó el backend ni se ejecutaron sus pruebas.
