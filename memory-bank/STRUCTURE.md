# Memory Bank - Structure & Contents

**Visual Guide to the Knowledge Base**

---

## 📂 Folder Structure

```
memory-bank/
├── README.md              ← START HERE (Navigation guide)
├── STRUCTURE.md           ← This file (Visual overview)
├── systemContext.md       ← Architecture & System Design
├── techContext.md         ← Technology Stack & Decisions
├── productContext.md      ← Product Definition & Roadmap
└── activeContext.md       ← Current Work & Priorities
```

**Total:** 6 files, 1,744 lines, 50 KB  
**Purpose:** Single source of truth for project knowledge  
**Audience:** All contributors (developers, PMs, architects, DevOps)

---

## 🎯 Content Map

### README.md - START HERE
```
├── How to Use This Memory Bank
│   ├── For Project Managers
│   ├── For Backend Developers
│   ├── For Frontend Developers
│   ├── For Security/DevOps
│   └── For Architects
├── Document Descriptions (quick summary)
├── Cross-References (finding specific topics)
├── Key Project Metrics
├── Critical Items Summary (⚠️ 8 issues listed)
└── Recommended Reading Order
```
**Length:** 285 lines  
**Read Time:** 10 minutes  
**Key Takeaway:** This project has 3 critical security issues blocking production  

---

### systemContext.md - ARCHITECTURE
```
├── System Overview
│   ├── Purpose: Financial metrics dashboard
│   ├── Primary Users: Finance/Operations teams
│   └── System Scope Diagram: Frontend → Backend → Data
├── Technical Architecture
│   ├── Component Breakdown
│   │   ├── Frontend Stack (React 19 + TypeScript 6)
│   │   ├── Backend Stack (FastAPI + Pydantic)
│   │   └── Infrastructure (Docker + Docker Compose)
│   └── Key Files by Component
├── Data Model
│   ├── FinancialMovement (UUID, date, amount, category, type)
│   ├── KPIMetrics (totals, averages, net results)
│   └── Data Flow Diagram (request → generation → response)
├── API Contract
│   ├── 15 Endpoints (metrics, categories, movements, health)
│   ├── Request Validation (Pydantic + Literal types)
│   └── Known Issues (date range not validated)
├── Security Posture
│   ├── ✅ Type validation (Pydantic + TypeScript)
│   ├── 🔴 CORS: allow_origins=["*"]
│   ├── 🔴 Debugpy: exposed on port 5678
│   └── 🟡 Date validation: missing
├── Performance Characteristics (current bottlenecks)
├── Testing Status (15% coverage, infrastructure present)
├── Documentation Status (README good, env vars missing)
└── Current Operational Status (what works, what needs attention)
```
**Length:** 275 lines  
**Read Time:** 15 minutes  
**Key Takeaway:** Clean architecture, but three critical security/performance issues  

---

### techContext.md - TECHNOLOGY DECISIONS
```
├── Complete Technology Stack
│   ├── Frontend Ecosystem
│   │   ├── Core: React 19.2.4 + TypeScript 6.0.2
│   │   ├── Build: Vite 8.0.4 + TailwindCSS 4.2.2
│   │   ├── Charts: Recharts 3.8.1
│   │   ├── Testing: Vitest 4.1.4
│   │   └── Linting: ESLint 9.39.4
│   ├── Backend Ecosystem
│   │   ├── Framework: FastAPI (latest)
│   │   ├── Server: Uvicorn[standard]
│   │   ├── Validation: Pydantic BaseModel
│   │   ├── Testing: Pytest + pytest-cov
│   │   └── Dev: debugpy (⚠️ exposed)
│   └── Infrastructure
│       ├── Containerization: Docker
│       ├── Orchestration: Docker Compose
│       └── Ports: 5173 (frontend), 8000 (backend), 5678 (debug)
├── Architecture Patterns
│   ├── Frontend: Component hierarchy + React hooks
│   ├── Backend: Endpoint organization + request-response
│   └── Data Flow: Before (problematic) vs After (recommended caching)
├── Integration Points
│   ├── Frontend-Backend Contract: Type synchronization (Literal types)
│   └── External Dependencies: None (self-contained currently)
├── Technology Rationale
│   └── Why each choice was made (React vs Vue, FastAPI vs Flask, etc.)
├── Deployment Topology (development vs production)
├── Security Implications by Technology
├── Testing Stack (backend + frontend)
├── Dependency Management (npm + pip)
└── Artifact Storage & Distribution
```
**Length:** 409 lines  
**Read Time:** 20 minutes  
**Key Takeaway:** Modern, well-chosen stack; production deployment needs careful configuration  

---

### productContext.md - PRODUCT DEFINITION
```
├── Product Definition
│   ├── Mission: Provide real-time financial visibility
│   ├── Goals: Visibility, Analysis, Alerting, Accessibility
│   └── Target Audience: Finance/Operations managers (SMB)
├── Use Cases (3 detailed scenarios)
│   ├── Daily Spending Monitoring
│   ├── Period Comparison Analysis
│   └── Category Deep-Dive
├── Current Product State
│   ├── Implemented Features ✅ (KPIs, categories, time-series, comparison, alerts)
│   └── Missing/Limited Features ⚠️ (no persistent storage, no auth, no reports)
├── Data Characteristics
│   ├── Mock Dataset: 360 movements with seed=42
│   └── Data Quality: Good, but simplified
├── User Interface Layout
│   ├── Dashboard visual structure
│   ├── Secondary views
│   └── UX principles (mobile-first, fast, clear)
├── Business Metrics
│   ├── Success Metrics (planned, not tracked)
│   └── Performance Metrics (measured, 50-150ms response time)
├── Feature Roadmap
│   ├── Phase 1 (Q4 2024): Production Ready (this sprint)
│   ├── Phase 2 (Q1 2025): Enterprise Features (PostgreSQL, RBAC, reports)
│   └── Phase 3 (Q2 2025): Advanced Analytics (ML, forecasting, mobile)
├── Product Dependencies & Constraints
└── Product Health Checklist (functionality, usability, reliability, security, performance)
```
**Length:** 309 lines  
**Read Time:** 15 minutes  
**Key Takeaway:** Solid MVP, roadmap is ambitious but depends on fixing current issues first  

---

### activeContext.md - CURRENT WORK & PRIORITIES
```
├── Phase 1: CRITICAL FIXES (90 minutes ⏱️)
│   ├── 1️⃣ CORS Security (30 min)
│   │   ├── Current: allow_origins=["*"]
│   │   ├── Fix: Use CORS_ORIGINS environment variable
│   │   └── Validation: curl tests to verify
│   ├── 2️⃣ Mock Data Caching (45 min)
│   │   ├── Current: Regenerated every request
│   │   ├── Fix: Global MOVEMENTS variable + lifespan manager
│   │   └── Impact: 40-50% faster (100ms → 50ms)
│   └── 3️⃣ Remove Debugpy (15 min)
│       ├── Current: Exposed on port 5678
│       ├── Fix: Create Dockerfile.prod without debugpy
│       └── Why: RCE vulnerability in production
├── Phase 2: HIGH-PRIORITY IMPROVEMENTS (2 hours)
│   ├── 4️⃣ Date Range Validation (30 min)
│   ├── 5️⃣ Frontend Error Handling & Timeout (45 min)
│   ├── 6️⃣ Environment Variables Documentation (20 min)
│   └── 7️⃣ Structured Logging Implementation (30 min)
├── Phase 3: QUALITY IMPROVEMENTS (5 hours)
│   └── 8️⃣ Expand Test Coverage (2-3 hours, target 80%+)
├── Active Blockers (3 critical issues)
├── Code Quality Metrics (current vs target)
├── Implementation Timeline (recommended day-by-day schedule)
└── Recommended Priority Order
```
**Length:** 466 lines  
**Read Time:** 20 minutes  
**Key Takeaway:** Clear roadmap, actionable tasks, realistic effort estimates  

---

## 🧭 How to Navigate

### By Role

**🚀 I'm a NEW Developer - What do I read?**
1. `README.md` - Overview (10 min)
2. `activeContext.md` - Phase 1 issues (15 min)
3. `systemContext.md` - Architecture (15 min)
→ **Total: 40 minutes to be productive**

**📊 I'm a PROJECT MANAGER - What do I read?**
1. `README.md` - Summary (10 min)
2. `productContext.md` - Full product details (15 min)
3. `activeContext.md` - Timeline & roadmap (15 min)
→ **Total: 40 minutes**

**👨‍💻 I'm a BACKEND ENGINEER - What do I read?**
1. `README.md` - Navigation (5 min)
2. `activeContext.md` - Phase 1-2 fixes (20 min)
3. `techContext.md` - Backend stack (20 min)
4. `/ENGINEERING-ANALYSIS.md` - Detailed findings (15 min)
→ **Total: 60 minutes**

**🔒 I'm SECURITY/DEVOPS - What do I read?**
1. `activeContext.md` - Phase 1 security fixes (15 min)
2. `techContext.md` - Security section (10 min)
3. `systemContext.md` - Security posture (10 min)
→ **Total: 35 minutes**

**📐 I'm an ARCHITECT - What do I read?**
1. `README.md` - Overview (10 min)
2. `systemContext.md` - Full architecture (15 min)
3. `techContext.md` - Full tech stack (20 min)
4. `productContext.md` - Full roadmap (15 min)
5. `activeContext.md` - Full implementation plan (20 min)
→ **Total: 80 minutes (complete picture)**

---

### By Topic

**"I need to fix CORS"**
→ `activeContext.md` → Phase 1.1 section (has current/fix/validation code)

**"I need to understand the data model"**
→ `systemContext.md` → Data Model section

**"I need to know the API endpoints"**
→ `systemContext.md` → API Contract section

**"I need to set up environment variables"**
→ `activeContext.md` → Phase 2.6 section (Environment Documentation)

**"I need to understand the architecture"**
→ `systemContext.md` → Technical Architecture section

**"I need the tech stack details"**
→ `techContext.md` → Complete Technology Stack section

**"I need to know what to work on next"**
→ `activeContext.md` → Recommended Implementation Timeline

**"I need to understand the product roadmap"**
→ `productContext.md` → Feature Roadmap section

---

## ✅ Verification Checklist for Contributors

Before starting work, verify you understand:
- [ ] The 3 critical Phase 1 issues and why they block production
- [ ] The tech stack (React/TypeScript frontend, FastAPI backend)
- [ ] The data model (FinancialMovement, KPIMetrics)
- [ ] The current security posture and gaps
- [ ] The priority roadmap (Phase 1 → 2 → 3)
- [ ] How to find specific information in the memory-bank
- [ ] The project standards in `/.agents/rules/coding-standards.md`

---

## 🔄 Maintenance Schedule

**After Phase 1 (Critical Fixes):**
- [ ] Update `activeContext.md` - mark fixes as ✅ COMPLETE
- [ ] Update `systemContext.md` - update security posture
- [ ] Update code quality metrics

**After Phase 2 (High Priority):**
- [ ] Create Phase 2 checkpoint
- [ ] Update implementation timeline
- [ ] Verify performance improvements

**After Phase 3 (Quality):**
- [ ] Verify test coverage >80%
- [ ] Create Phase 3 checkpoint
- [ ] Begin Phase Next (future work)

---

## 📞 Questions About This Memory Bank?

**"Where is information about X?"**
→ Check `README.md` → Cross-References section

**"Is this information up-to-date?"**
→ Check timestamp at top of each file  
→ Last verified: 2026-11-13

**"Can I modify the memory-bank?"**
→ Yes, use "Update Guidelines" in `README.md`

**"What if I find incorrect information?"**
→ File an issue and reference the specific file/section  
→ Provide evidence from actual code

---

**Version:** 1.0-alpha  
**Status:** Production Ready  
**Quality:** Verified Against Codebase  
**Evidence-Based:** 100%  

The Financial Dashboard memory-bank is your single source of truth for project knowledge.
