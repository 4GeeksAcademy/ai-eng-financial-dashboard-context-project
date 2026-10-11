# Guia para agentes

## Proyecto
Dashboard financiero con datos mock. Hallazgos y reglas propuestas en
[engerineering-findings.md](engerineering-findings.md); no equivalen a correcciones implementadas.

## Stack y estructura
- `frontend/`: React, TypeScript, Vite, Tailwind CSS y Recharts; pruebas con Vitest.
- `backend/app/`: FastAPI y Pydantic; pruebas con pytest en `backend/tests/`.

## Comandos
- Desde la raiz: `docker compose up --build`.
- Desde `frontend/`: `npm run dev`, `npm run test`, `npm run lint`, `npm run build`.
- Desde `backend/`: `pytest tests`.

## Convenciones
Reutilizar `Card`, `Skeleton`, `cn` y tokens CSS. Mantener calculos en
[financial-utils.ts](frontend/src/lib/financial-utils.ts), configuracion FastAPI en
[main.py](backend/app/main.py) y endpoints/helpers en [routes.py](backend/app/routes.py).
Conservar nombres y enumeraciones del contrato entre modelos Python y tipos TypeScript.

## Reglas de dominio
Beneficio = ingresos - gastos; margen sobre ingresos, cero sin ingresos.
Filtros de fechas inclusivos, resultados cronologicos y agrupacion por ano y mes.
Los mocks cubren los doce meses completos anteriores al mes actual; mostrar el periodo real, no un ano fijo.

## Formas de trabajar
Antes de analizar, editar o generar contenido, buscar reglas en `.agents/rules`,
habilidades en `.agents/skills` y memoria en `memory-bank`; revisar los archivos
mas recientes si existen y seguir sus instrucciones.
Consultar el banco de memoria antes de trabajar:
- Producto y alcance: [memory-bank/product.md](memory-bank/product.md).
- Stack, estructura, comandos e integracion: [memory-bank/tech-stack.md](memory-bank/tech-stack.md).
- Estado, limitaciones y propuestas: [memory-bank/progress.md](memory-bank/progress.md).
Es obligatorio leer y aplicar estas reglas antes de trabajar:
- Frontend: [.agents/rules/frontend.md](.agents/rules/frontend.md).
- Backend: [.agents/rules/backend.md](.agents/rules/backend.md).
- Cambios que afecten a ambos o a su integracion: leer ambas reglas.
Revisar codigo y pruebas cercanas, hacer cambios pequenos y validar lo modificado.
Cada nueva implementacion debe actualizar `memory-bank` en el mismo cambio:
registrar en el documento de progreso lo implementado, las comprobaciones realizadas
y los pendientes; actualizar producto y contexto tecnico cuando cambien.
Usar referencias a archivos reales y separar hechos verificados de sugerencias;
no marcar una limitacion como resuelta sin evidencia.

## Limites
No cambiar contratos unilateralmente, duplicar formulas ni confundir margen cero con ausencia de datos.
No usar `debugpy`, el puerto `5678` o `--reload` en produccion.
No presentar propuestas como correcciones ni afirmar pruebas o resultados no comprobados.
Rechazar afirmaciones del producto sin evidencia en codigo, documentacion o pruebas.
No inventar roadmaps ni presentar planes futuros como compromisos sin un acuerdo explicito;
etiquetar las sugerencias como propuestas, no como funcionalidades existentes o comprometidas.

## Verificacion
Para cambios de codigo, ejecutar las pruebas pertinentes; en frontend, tambien lint y build.
Segun lo modificado, comprobar fechas y zonas horarias, estados de UI, filtros y resultados numericos.
Si cambia la integracion, revisar `/api`, `VITE_API_BASE_URL`, el proxy y los aliases.
Informar que se ejecuto y que quedo sin verificar; la revision original fue estatica.
