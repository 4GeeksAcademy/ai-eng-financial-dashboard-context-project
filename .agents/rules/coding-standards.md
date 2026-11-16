# Coding Standards del Proyecto

## Alcance y patrones glob

Estas reglas se aplican por alcance:

- Backend Python API: `backend/app/**/*.py`
- Backend tests: `backend/tests/**/*.py`
- Frontend React/TypeScript: `frontend/src/**/*.{ts,tsx}`
- Config frontend (build/lint): `frontend/*.{ts,js}`
- Reglas transversales de arquitectura: `backend/**/*` y `frontend/**/*`

---

## 1) Tipado y contratos

### SE DEBE

- Definir contratos explícitos de dominio usando tipos literales, interfaces y modelos de validación.
- Tipar siempre el retorno de funciones públicas.
- En endpoints de FastAPI, declarar `response_model` para estabilizar el contrato HTTP.

### NO SE DEBE

- Exponer endpoints sin contrato de respuesta.
- Introducir tipos ambiguos para entidades de negocio críticas.

### Ejemplo Correcto (actual)

```python
OperationType = Literal["income", "outcome"]

class FinancialMovement(BaseModel):
    create_date: date
    amount: float
    operation_type: OperationType

@router.get("/api/metrics", response_model=list[FinancialMovement])
def get_metrics(...) -> list[FinancialMovement]:
    ...
```

Fuente: `backend/app/routes.py`

### Ejemplo Incorrecto (evitar)

```python
@router.get("/api/metrics")
def get_metrics(...):
    return data
```

(En este caso se pierde validacion de forma y contrato de salida.)

---

## 2) Manejo de dinero y precision numerica

### SE DEBE

- Usar `Decimal` para montos monetarios en backend y capa de calculo.
- Redondear solo en el borde de salida (serializacion/respuesta), no en pasos intermedios.

### NO SE DEBE

- Usar `float` para dinero en modelos de dominio o acumulaciones financieras.

### Ejemplo Incorrecto (actual)

```python
class FinancialMovement(BaseModel):
    amount: float

class MetricsSummaryItem(BaseModel):
    income: float
    outcome: float
    net: float
```

Fuente: `backend/app/routes.py`

### Ejemplo Correcto (objetivo)

```python
from decimal import Decimal

class FinancialMovement(BaseModel):
    amount: Decimal
```

---

## 3) Seguridad de API (CORS y exposicion)

### SE DEBE

- Restringir CORS por ambiente usando lista explicita de origenes.
- Mantener `allow_credentials=True` solo cuando sea estrictamente necesario y con origenes concretos.

### NO SE DEBE

- Combinar `allow_origins=["*"]` con `allow_credentials=True` en configuraciones de produccion.

### Ejemplo Incorrecto (actual)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Fuente: `backend/app/main.py`

### Ejemplo Correcto (objetivo)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://dashboard.midominio.com"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## 4) Aleatoriedad, determinismo y estado global

### SE DEBE

- Mantener pruebas deterministicas sin mutar el estado global del modulo.
- Preferir generadores locales (`random.Random(seed)`) en lugar de `random.seed(...)` global.

### NO SE DEBE

- Re-sembrar el RNG global dentro de funciones de dominio compartidas por varios endpoints.

### Ejemplo Incorrecto (actual)

```python
def generate_mock_movements(seed: int | None = None) -> list[FinancialMovement]:
    if seed is not None:
        random.seed(seed)
```

Fuente: `backend/app/routes.py`

### Ejemplo Correcto (objetivo)

```python
def generate_mock_movements(seed: int | None = None) -> list[FinancialMovement]:
    rng = random.Random(seed)
    # usar rng.random(), rng.randint(), rng.choice(), etc.
```

---

## 5) Manejo de errores en frontend

### SE DEBE

- Capturar el error y registrar contexto util para depuracion.
- Mostrar mensajes de error amigables al usuario, pero conservar detalle tecnico para logs.

### NO SE DEBE

- Silenciar errores con `catch` vacio de contexto.

### Ejemplo Incorrecto (actual)

```ts
fetchFinancialData()
  .then((movements) => {
    setMetrics(computeKPIs(movements));
    setMonthlyData(computeMonthlyData(movements));
  })
  .catch(() => {
    setError("No se pudo cargar la informacion financiera. Revisa la API de backend.");
  });
```

Fuente: `frontend/src/App.tsx`

### Ejemplo Correcto (objetivo)

```ts
.catch((err) => {
  console.error("fetchFinancialData failed", err);
  setError("No se pudo cargar la informacion financiera. Revisa la API de backend.");
});
```

---

## 6) Arquitectura y duplicacion de endpoints

### SE DEBE

- Reutilizar rutas y filtros via parametros antes de duplicar handlers casi identicos.
- Centralizar logica de filtrado en funciones de dominio compartidas.

### NO SE DEBE

- Mantener duplicacion de handlers cuando existe un parametro equivalente (`business_type`).

### Ejemplo Correcto (actual)

```python
@router.get("/api/metrics/summary", response_model=list[MetricsSummaryItem])
def get_metrics_summary(
    ...,
    business_type: BusinessType | None = Query(default=None),
) -> list[MetricsSummaryItem]:
    ...
```

Fuente: `backend/app/routes.py`

### Ejemplo Incorrecto (actual)

```python
@router.get("/api/metrics/b2b", response_model=list[FinancialMovement])
def get_b2b_metrics(...):
    ...

@router.get("/api/metrics/b2c", response_model=list[FinancialMovement])
def get_b2c_metrics(...):
    ...
```

Fuente: `backend/app/routes.py`

(La ruta `/api/metrics` ya soporta filtros y puede absorber esta variacion.)

---

## 7) Validacion de inputs y limites

### SE DEBE

- Definir limites de negocio y validaciones en parametros de query.
- Hacer fail-fast cuando un parametro invalido pueda degradar rendimiento o romper semantica.

### NO SE DEBE

- Exponer parametros numericos sin cotas min/max cuando son sensibles a abuso.

### Ejemplo Correcto (actual)

```python
limit: int = Query(default=5, ge=1, le=20)
threshold: float = Query(default=0.3, ge=0)
```

Fuente: `backend/app/routes.py`

### Ejemplo Incorrecto (evitar)

```python
limit: int = Query(default=5)
```

---

## 8) Pruebas automatizadas

### SE DEBE

- Mantener tests para funciones de negocio puras y endpoints.
- Cubrir casos borde: orden cronologico, filtros combinados, division por cero, estructuras de respuesta.

### NO SE DEBE

- Introducir logica de negocio sin test asociado.

### Ejemplo Correcto (actual)

```python
def test_metrics_comparison_returns_delta_fields():
    response = client.get(
        "/api/metrics/comparison",
        params={"start_date": "2025-03-01", "end_date": "2025-03-31"},
    )
    assert response.status_code == 200
```

Fuente: `backend/tests/test_routes.py`

```ts
it("returns 0 profitPercent when there is no income", () => {
  const metrics = computeKPIs(onlyOutcomes);
  expect(metrics.profitPercent).toBe(0);
});
```

Fuente: `frontend/src/lib/financial-utils.test.ts`

---

## 9) Separacion de responsabilidades

### SE DEBE

- Mantener los componentes de UI enfocados en render.
- Mantener calculos de negocio en utilidades puras reutilizables.

### NO SE DEBE

- Mezclar calculos agregados complejos directamente dentro de JSX o handlers de render.

### Ejemplo Correcto (actual)

```ts
setMetrics(computeKPIs(movements));
setMonthlyData(computeMonthlyData(movements));
```

Fuente: `frontend/src/App.tsx`

```ts
export function computeKPIs(movements: FinancialMovement[]): KPIMetrics {
  ...
}
```

Fuente: `frontend/src/lib/financial-utils.ts`

---

## 10) Estilo y consistencia

### SE DEBE

- Mantener consistencia de estilo por archivo y por capa.
- En frontend, respetar reglas de ESLint y alias `@/` para imports internos.

### NO SE DEBE

- Introducir mezcla innecesaria de estilos de comillas, formato o patrones de importacion en el mismo modulo.

### Ejemplo Correcto (actual)

```ts
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
```

Fuente: `frontend/src/App.tsx`

### Ejemplo Incorrecto (evitar)

```ts
import { DashboardHeader } from "../../components/dashboard/dashboard-header";
```

---

## Checklist de PR (obligatorio)

- Cambios en `backend/app/**/*.py`: ejecutar `cd backend && pytest -q`.
- Cambios en `frontend/src/**/*.{ts,tsx}`: ejecutar `cd frontend && npm test -- --run`.
- Si se toca contrato API (`backend/app/routes.py`): actualizar tests de backend y tipos de frontend (`frontend/src/lib/financial-types.ts`) en el mismo PR.
- Si se agregan endpoints nuevos: deben incluir `response_model`, validacion de inputs y al menos un test de ruta feliz + un caso borde.
