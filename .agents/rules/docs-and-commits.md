# Regla: docs-and-commits

**Alcance:** `README.md`, `README.es.md`, `AGENTS.md`, `memory-bank/`, `verification.md` y el historial de git.
**Justificación:** F20 y F21. Los dos READMEs son espejo (la línea 46 de ambos habla del `.env`) y `AGENTS.md` obliga a leer las reglas y el memory bank antes de actuar. Las normas de commits vienen del ejercicio de 4Geeks, no del código.

## Qué hacer

- Antes de empezar, lee `.agents/rules/` y `memory-bank/` (lo pide `AGENTS.md`).
- Edita `README.md` y `README.es.md` en el mismo cambio.
- Toda afirmación sobre el repo cita su archivo: `ruta:línea`. Marca lo que no hayas ejecutado como no verificado.
- Si el cambio altera el comportamiento, actualiza el archivo correspondiente de `memory-bank/` en el mismo commit.
- Un commit por unidad coherente (un cambio y su test van juntos). El mensaje dice qué cambia, cómo se comprobó y qué no se pudo ejecutar.
- Al editar el código, no cites líneas en documentos nuevos si pueden desplazarse: nombra la función (`build_metrics_facets`) o indica el commit al que se refieren.

## Qué no hacer

- No mezcles en un mismo commit una corrección de código con un cambio de documentación sin relación.
- No subas documentos generados sin haberlos contrastado con el código.
