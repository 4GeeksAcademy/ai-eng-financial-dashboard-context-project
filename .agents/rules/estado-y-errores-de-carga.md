# estado-y-errores-de-carga (P5)
**Prioridad:** media
**Alcance:** `frontend/src/App.tsx`
**Regla:** DEBES mantener los estados `loading` y `error` y un mensaje visible; si modificas `.catch`, DEBES declarar en la respuesta si el error se muestra o se descarta, porque el fetch lanza el status HTTP y el catch actual lo descarta.
**Justificación:** C4, R7; `frontend/src/App.tsx:18` — `throw new Error(`Failed to fetch financial data: ${response.status}`);`; `frontend/src/App.tsx:26` — `const [loading, setLoading] = useState(true);`; `frontend/src/App.tsx:27` — `const [error, setError] = useState<string | null>(null);`; `frontend/src/App.tsx:35` — `.catch(() => {`; `frontend/src/App.tsx:53` — `{error}`.
**Verificación:** `grep -nE "setLoading|setError|\.catch|\.finally" frontend/src/App.tsx` (esperado: los dos estados, un `.catch` y un `.finally`; hoy en 26-27, 35-36 y 40-41); la respuesta declara qué se hace con el error.
**Línea base:** líneas 26-27, 35-36 y 40-41; línea 40 contiene `.finally(() => {`.
