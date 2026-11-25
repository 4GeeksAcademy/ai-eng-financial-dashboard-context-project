---
name: Operations & Troubleshooting
description: Quick reference for common tasks, debugging, and production operations
date_last_updated: 2026-11-25
---

# Operations & Troubleshooting

Quick reference for running, debugging, and troubleshooting the Financial Metrics Dashboard.

## 🚀 Starting the Project

### Local Development (All-in-One)

```bash
# Clone & navigate
cd /path/to/ai-eng-financial-dashboard-context-project

# Start with Docker Compose
docker compose up --build

# Access:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:8000
# - Swagger Docs: http://localhost:8000/docs
```

**What it does**:
- Builds both Docker images
- Starts frontend (Vite dev server)
- Starts backend (Uvicorn with hot reload)
- Mounts source code as volumes (live edit)

---

### Local Development (Separate Terminals)

#### Terminal 1: Backend

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1
# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

**Output** (success):
```
Uvicorn running on http://127.0.0.1:8000
```

#### Terminal 2: Frontend

```bash
cd frontend
npm install
npm run dev
```

**Output** (success):
```
  VITE v8.0.4  ready in 234 ms

  ➜  Local:   http://localhost:5173/
```

---

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env.example` → `.env`)

```env
# Default: empty (uses Vite proxy to backend)
# In production: set to actual backend URL
VITE_API_BASE_URL=https://api.example.com
```

#### Backend (Docker Compose)

```yaml
# In docker-compose.yml or .env file
backend:
  environment:
    - CORS_ORIGINS=https://app.example.com,https://www.example.com
```

**Production CORS Setup**:
```bash
# Single origin
export CORS_ORIGINS=https://dashboard.company.com

# Multiple origins (comma-separated)
export CORS_ORIGINS=https://dashboard.company.com,https://staging.company.com
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=app --cov-report=html

# Run specific test file
python -m pytest tests/test_routes.py -v

# Run specific test
python -m pytest tests/test_routes.py::test_get_metrics -v
```

**Expected**: All 12+ tests pass

---

### Frontend Tests

```bash
cd frontend

# Run once
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

**Expected**: All utility tests pass

---

## 🐛 Debugging

### Backend Remote Debugging

The backend supports remote debugging via debugpy on port 5678.

#### With Docker Compose

```bash
# In docker-compose.yml, the backend already exposes port 5678
docker compose up --build

# In your IDE (VS Code, PyCharm), attach debugger to:
# Host: localhost
# Port: 5678
```

#### Without Docker

```bash
cd backend
source .venv/bin/activate

# Run with debugpy listener
python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --reload
```

**IDE Setup** (VS Code):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach Backend (debugpy)",
      "type": "python",
      "request": "attach",
      "host": "localhost",
      "port": 5678,
      "justMyCode": true
    }
  ]
}
```

---

### Common Issues

#### **Frontend won't start (npm)**

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# If still failing, check Node version
node --version  # Should be v18+
```

#### **Backend won't start (Python)**

```bash
# Ensure virtual environment is activated
source .venv/bin/activate  # Linux/Mac
.\.venv\Scripts\Activate.ps1  # Windows

# Check Python version
python --version  # Should be 3.10+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

#### **Port already in use**

```bash
# Backend on 8000
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows

# Frontend on 5173
lsof -i :5173  # Linux/Mac
netstat -ano | findstr :5173  # Windows

# Kill process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

#### **API calls fail with CORS error**

```
Access to XMLHttpRequest blocked by CORS policy
```

**Fix**:
1. Backend is not running on expected port
2. Frontend `VITE_API_BASE_URL` is misconfigured
3. Backend `CORS_ORIGINS` env var is too restrictive

```bash
# Check backend is running
curl http://localhost:8000/health

# Check CORS config
# Backend should have:
CORS_ORIGINS=http://localhost:5173  # For dev
# Or leave unset (defaults to "*" for dev)
```

#### **Docker container won't build**

```bash
# Clean build
docker compose down
docker compose build --no-cache

# Check Dockerfile syntax
docker build -f backend/Dockerfile backend/

# View build logs
docker compose build --progress=plain
```

---

## 📊 Verifying Installation

### Quick Health Check

```bash
# Backend health
curl http://localhost:8000/health
# Expected: {"status":"ok"}

# API data
curl http://localhost:8000/api/metrics | jq '.[0]'
# Expected: First transaction with create_date, amount, operation_type, etc.

# Frontend (opens in browser)
open http://localhost:5173
# Expected: Dashboard loads with KPI cards, charts
```

### Full Verification

```bash
# Run verification checklist
cd /path/to/project
cat verification.md

# All 30 items should show ✅
```

---

## 🚢 Production Deployment

### Pre-Deployment Checklist

- [ ] Database configured (not mock data)
- [ ] `CORS_ORIGINS` env var set for your domain
- [ ] Authentication implemented (or disabled intentionally)
- [ ] `.env` files NOT committed to repo
- [ ] All secrets in secrets manager (not .env)
- [ ] Tests passing locally
- [ ] TypeScript builds without errors
- [ ] Python linting passes (flake8 or similar)

### Docker Build for Production

```bash
# Build images
docker build -t financial-dashboard-frontend:latest frontend/
docker build -t financial-dashboard-backend:latest backend/

# Or with Docker Compose
docker compose -f docker-compose.yml build
```

### Environment Setup (Example: AWS ECS)

```bash
# Backend task definition environment
{
  "name": "CORS_ORIGINS",
  "value": "https://dashboard.company.com"
}

{
  "name": "DATABASE_URL",
  "value": "postgresql://user:pass@db.aws.com/financial"
}
```

### Monitoring Health

```bash
# Health check endpoint
curl https://api.example.com/health

# API availability
curl https://api.example.com/api/metrics | wc -l
# Should return 144 movements (or more if real DB)
```

---

## 📈 Performance Tuning

### Backend Optimization

#### Uvicorn Workers (Production)

```bash
# Default: single worker
python -m uvicorn app.main:app

# With workers (gunicorn wrapper)
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

#### Database Query Optimization

- Add indexes on `create_date`, `operation_type`, `business_type`
- Implement pagination for large date ranges
- Cache `/api/metrics/facets` response (rarely changes)

### Frontend Optimization

#### Build Output

```bash
npm run build

# Check size
ls -lh dist/
# Typical: ~200KB gzipped
```

#### Vite Config Tweaks

In `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'recharts': ['recharts']  // Separate chunk
        }
      }
    }
  }
})
```

---

## 🔐 Security Checklist

- [ ] CORS origins restricted (not `["*"]` in prod)
- [ ] Database credentials in env vars (not hardcoded)
- [ ] Secrets manager configured (AWS Secrets, Vault, etc.)
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints (Pydantic handles this)
- [ ] Logging configured (audit trail)
- [ ] Regular dependency updates (Dependabot or similar)

---

## 📚 Troubleshooting by Symptom

### **Dashboard shows "Could not load financial data"**

1. Check backend is running: `curl http://localhost:8000/health`
2. Check CORS: Browser console for CORS error
3. Check network tab: Request should go to `/api/metrics`
4. Backend logs should show the error

### **Charts don't render**

1. Open browser console → check for JS errors
2. Check data in network tab → `/api/metrics` response
3. Verify Recharts dependency installed: `npm list recharts`

### **Tests fail randomly**

1. Check if port is already in use
2. Clear cache: `rm -rf .pytest_cache`, `rm -rf node_modules/.vite`
3. Run tests in isolation: `pytest tests/test_routes.py::specific_test`

### **TypeScript compilation fails**

```bash
cd frontend
npm run build  # Shows TypeScript errors
# Fix errors, then retry
```

### **Dependencies conflict**

```bash
# Frontend
npm update
npm audit fix

# Backend
pip install --upgrade -r requirements.txt
# Or use poetry/pipenv for more control
```

---

## 📞 Getting Help

1. **Check the memory bank**: First, search `memory-bank/*.md`
2. **Review project rules**: `.agents/rules/` (10 governance files)
3. **Run verification**: `verification.md` (30 checks)
4. **API docs**: http://localhost:8000/docs (Swagger)
5. **Code comments**: `backend/app/routes.py`, `frontend/src/App.tsx`

---

## 🔄 Common Workflows

### **Adding a New API Endpoint**

1. Create route in `backend/app/routes.py`
2. Add Pydantic model for response
3. Write test in `backend/tests/test_routes.py`
4. Run `pytest` to verify
5. Test in Swagger: http://localhost:8000/docs
6. Update frontend to consume (via `App.tsx`)
7. Update `memory-bank/API_REFERENCE.md`

### **Adding a Frontend Component**

1. Create in `frontend/src/components/dashboard/` (domain) or `ui/` (generic)
2. Import types from `frontend/src/lib/financial-types.ts`
3. Use utilities from `frontend/src/lib/financial-utils.ts`
4. Add tests in `financial-utils.test.ts`
5. Import in `App.tsx` and pass props
6. Use `@/` imports (never `../../../`)
7. All colors from CSS variables (index.css)
8. Use `cn()` to merge Tailwind classes

### **Preparing for Production**

1. Set `CORS_ORIGINS` env var
2. Point `VITE_API_BASE_URL` to production backend
3. Run `npm run build` → generates optimized `dist/`
4. Run `pytest` with coverage
5. Deploy frontend (CDN or static hosting)
6. Deploy backend (container or serverless)
7. Test health endpoints
8. Monitor logs

---

## Related Documentation

- **Quick Start**: `../README.md`
- **Verification**: `../verification.md`
- **Rules**: `.agents/rules/` (10 files)
- **API Reference**: `memory-bank/API_REFERENCE.md`
- **Tech Stack**: `memory-bank/TECH_STACK.md`
- **Current State**: `memory-bank/CURRENT_STATE.md`

