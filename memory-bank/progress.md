# Estado del proyecto

## Implementado según el código

- Frontend de dashboard con tarjetas KPI y gráficos de ingresos/gastos y margen; la pantalla carga `/api/metrics` (`frontend/src/App.tsx`; `frontend/src/components/dashboard/`).
- API FastAPI con endpoint de salud, movimientos y endpoints adicionales de métricas, filtros y segmentos (`backend/app/routes.py`).
- Hay pruebas backend de rutas/filtros (`backend/tests/test_routes.py`) y pruebas frontend de utilidades financieras (`frontend/src/lib/financial-utils.test.ts`). La existencia de pruebas no implica que todas las rutas o cálculos estén completamente cubiertos.
- Documentación de arranque y configuración Docker está en `README.md`, `README.es.md` y `docker-compose.yml`.

## Estado de validación conocido

No consta en esta sesión una ejecución satisfactoria de las suites. El usuario informó que `npm test` falló con `vitest: not found` y que `npm ci` no pudo crear `frontend/node_modules/@babel` por un error de permisos. Esos reportes describen el estado de instalación comunicado en la conversación, no un resultado de tests del código. No se afirma que las pruebas pasen ni que Docker haya sido ejecutado.

## Deuda o discrepancias observables

- La cabecera fija `2024 - Full Year` contrasta con las fechas relativas a `date.today()` del generador backend (`frontend/src/App.tsx`; `backend/app/routes.py`).
- `frontend/src/lib/mock-data.ts` no aparece usado por el flujo principal, que obtiene movimientos desde la API (`frontend/src/App.tsx`).
- El generador llama a `random.seed(seed)` del módulo global (`backend/app/routes.py`).
- CORS está configurado con `allow_origins=["*"]` y `allow_credentials=True` (`backend/app/main.py`).
- Algunas pruebas backend de resumen/alertas comprueban forma o propiedades generales, en vez de fijar resultados numéricos; véanse `backend/tests/test_routes.py` y el detalle de `findings.md` (TST-01).
- No se ve configuración de base de datos en Compose ni integración de persistencia en los archivos inspeccionados (`docker-compose.yml`; `backend/requirements.txt`; `backend/app/routes.py`).

## Prioridades técnicas posibles (no comprometidas)

Como siguientes comprobaciones opcionales, se podría resolver primero el bloqueo local de instalación para poder ejecutar las pruebas; después, verificar numéricamente las métricas afectadas por cambios y revisar la correspondencia entre periodo mostrado y rango de datos. Son propuestas derivadas de los puntos anteriores, no un roadmap aprobado ni una promesa de trabajo.

## Registro de skills
| Skill | Fuente | Hallazgo | Aceptado o rechazados (y por qué) | Evidencia |
|---|---|---|---|---|
| accessibility | addyosmani/web-quality-skills@accessibility | #1: el título de página es genérico. | ❓ No decidido: marcado “No estoy seguro”; no consta aceptación ni rechazo. | `frontend/index.html:7` contiene `<title>frontend</title>`; sin cambio solicitado. |
| accessibility | addyosmani/web-quality-skills@accessibility | #2: los gráficos carecen de alternativa textual/tabular explícita en el código revisado. | ❓ No decidido: marcado “No estoy seguro”; no consta aceptación ni rechazo. | Gráficos en `frontend/src/components/dashboard/income-outcome-chart.tsx` y `profit-percent-chart.tsx`; sin cambio para ofrecer alternativa. |
| accessibility | addyosmani/web-quality-skills@accessibility | #3: los títulos de tarjeta de gráfico se representan como `div`, no como encabezados. | ❓ No decidido: marcado “No estoy seguro”; no consta aceptación ni rechazo. | `frontend/src/components/ui/card.tsx`; sin cambio de semántica de encabezados. |
| accessibility | addyosmani/web-quality-skills@accessibility | #4: anunciar el error de carga a tecnologías de asistencia. | ✅ Aceptado e implementado: se eligió anunciar el error sin mover foco, cambio acotado al feedback dinámico. | `frontend/src/App.tsx`: el error ahora lleva `role="alert"`. |
| accessibility | addyosmani/web-quality-skills@accessibility | #5: idioma del mensaje de error español distinto del idioma raíz inglés. | ❓ No decidido: marcado “No estoy seguro”; no consta aceptación ni rechazo. | `frontend/index.html` declara `lang="en"`; mensaje en `frontend/src/App.tsx`; no se añadió atributo de idioma. |
| accessibility | addyosmani/web-quality-skills@accessibility | #6: hacer perceptible el estado de carga y evitar que skeletons decorativos se anuncien. | ✅ Aceptado e implementado: mejora acotada para que lectores de pantalla conozcan la carga sin exponer elementos decorativos. | `frontend/src/App.tsx`: `aria-busy` y región `role="status"`; `frontend/src/components/ui/skeleton.tsx`: `aria-hidden="true"`. |
| accessibility | addyosmani/web-quality-skills@accessibility | #7: respetar `prefers-reduced-motion` en la animación de skeleton. | ❓ No decidido: marcado “No estoy seguro”; no consta aceptación ni rechazo. | `frontend/src/components/ui/skeleton.tsx` conserva `animate-pulse`; no se añadió regla de movimiento reducido. |
| accessibility | addyosmani/web-quality-skills@accessibility | #8: comprobar y habilitar navegación por teclado en los gráficos. | ✅ Aceptado e implementado: se activó la capa de accesibilidad de Recharts; la comprobación manual de foco/teclas aún debe hacerse en navegador. | Prop `accessibilityLayer` añadida a los dos `LineChart` en `frontend/src/components/dashboard/income-outcome-chart.tsx` y `profit-percent-chart.tsx`. |
| accessibility | addyosmani/web-quality-skills@accessibility | #9: verificar visualización en modo de alto contraste. | ✅ Aceptado como comprobación, no como cambio de código: requiere validación visual/manual; no se reportó resultado. | La skill pide probar Windows High Contrast Mode; prueba pendiente, sin evidencia de ejecución. |
| accessibility | addyosmani/web-quality-skills@accessibility | #10: verificar lector de pantalla, zoom al 200 % y movimiento reducido/auditoría automatizada. | ✅ Aceptado como comprobación, no como cambio de código: estas pruebas son proporcionales al objetivo, pero siguen pendientes. | Recomendaciones del checklist de la skill; no se registró ejecución de lector de pantalla, zoom, preferencia de movimiento ni auditoría Lighthouse/axe. |
| vercel-react-best-practices | vercel-labs/agent-skills@vercel-react-best-practices | #1: sustituir el título genérico y añadir metadescripción al documento. | ✅ Aceptado e implementado: se actualizó el título y se añadió una descripción. | `frontend/index.html`: se añadieron un título descriptivo y meta descripción; el build generó `dist/index.html` (0,79 kB; gzip 0,43 kB). |
| vercel-react-best-practices | vercel-labs/agent-skills@vercel-react-best-practices | #2: comprobar si los skeletons KPI causan CLS y ajustar el espacio reservado si procede. | ❓ No estoy seguro: no se modificó el skeleton de KPI ni se midió CLS en navegador. | El build no evalúa CLS. El fallback de Suspense para gráficos reserva `h-[380px]` en `frontend/src/App.tsx`; no es una medición ni resuelve por sí solo el posible CLS de los KPI. |
| vercel-react-best-practices | vercel-labs/agent-skills@vercel-react-best-practices | #3: reducir el bundle JavaScript inicial dividiendo los gráficos de Recharts mediante imports dinámicos compatibles con Vite. | ✅ Aceptado e implementado: se cargan los gráficos de forma diferida, sin añadir dependencias. | El build pasó en 1,56 s: bundle inicial `index-BBuM_x1o.js` 187,67 kB (gzip 59,88 kB); chunks separados `LineChart-CUglQ1Bz.js` 342,29 kB, `income-outcome-chart-BkQ_pyJw.js` 9,74 kB y `profit-percent-chart-DPpcmfIZ.js` 6,60 kB. No apareció el aviso de chunk superior a 500 kB. |

**Nota de la skill:** `next/image` y `next/font` son APIs exclusivas de Next.js y no aplican directamente a este proyecto React + Vite. No se encontraron etiquetas `<img>` en el frontend inspeccionado. Si se añaden imágenes, reservar dimensiones o `aspect-ratio` con HTML/CSS; para fuentes, usar fuentes del sistema o servirlas localmente con CSS.

## Otras Skills seleccionadas

| Candidata | Fuente | ¿Aplica a mi dashboard? | ¿Fuente confiable? | ¿Puedo verificar el resultado? |
|---|---|---|---|---|
| `performance` | [addyosmani/web-quality-skills — performance](https://skills.sh/addyosmani/web-quality-skills/performance) | Sí. El dashboard usa React + Vite, carga datos de una API y presenta gráficos; la skill aborda carga, JavaScript, división de código y métricas web. `frontend/src/App.tsx` ya carga los gráficos de forma diferida. | Bastante confiable, aunque es una colección comunitaria y no una herramienta oficial de Google. El repositorio atribuye la skill a Addy Osmani, tiene licencia MIT y distingue mediciones de campo/laboratorio de hipótesis de inspección estática; remite a Chrome DevTools, CrUX y web.dev. | Sí, en laboratorio, comparando trazas del navegador o Lighthouse antes y después bajo condiciones equivalentes. CrUX/RUM puede no estar disponible si el dashboard es local, privado o tiene poco tráfico; no debe afirmarse una mejora de métricas reales sin datos de usuarios. |

**Conclusión:** `performance` es una buena candidata para este proyecto: aporta una metodología basada en mediciones y puede complementar la carga diferida de gráficos ya implementada. No consta que esté instalada ni que se haya medido el rendimiento del dashboard en navegador. Algunos ejemplos dirigidos a Next.js tendrían que adaptarse a React + Vite.