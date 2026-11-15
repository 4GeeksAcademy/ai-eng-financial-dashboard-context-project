# Memory Bank - Overview

**Financial Dashboard Knowledge Base**  
**Last Updated:** 2026-11-13  
**Purpose:** Centralized reference for architecture, decisions, and current work  

---

## 📚 How to Use This Memory Bank

This memory bank contains the complete technical and product context for the Financial Dashboard project. It's organized into specialized documents, each targeting different stakeholder needs.

### For Different Roles

**👨‍💼 Project Managers / Product Owners**
→ Start with [`productContext.md`](./productContext.md)
- Product goals and current features
- Roadmap and planned phases
- Business metrics and constraints

**👨‍💻 Backend Developers**
→ Start with [`activeContext.md`](./activeContext.md), then [`techContext.md`](./techContext.md)
- Current work items (Phase 1, 2, 3)
- Technology stack and decisions
- Backend architecture details

**🎨 Frontend Developers**
→ Start with [`systemContext.md`](./systemContext.md), then [`techContext.md`](./techContext.md)
- System architecture overview
- Frontend stack and patterns
- Component structure

**🔒 Security / DevOps**
→ Read [`activeContext.md`](./activeContext.md) (fixes section), then [`techContext.md`](./techContext.md)
- Critical security issues to fix
- Deployment topology
- Infrastructure decisions

**📊 Architects / Tech Leads**
→ Read all documents in order:
1. [`systemContext.md`](./systemContext.md) - System overview
2. [`techContext.md`](./techContext.md) - Tech stack rationale
3. [`productContext.md`](./productContext.md) - Product decisions
4. [`activeContext.md`](./activeContext.md) - Implementation roadmap

---

## 📄 Document Descriptions

### 1. systemContext.md (8.1 KB)
**Purpose:** Technical architecture and system design  
**Contents:**
- System overview diagram (frontend/backend/data flow)
- Component breakdown by layer
- Data model definitions
- API contract and endpoints
- Security posture assessment
- Performance characteristics
- Testing status
- Current operational status

**Key Sections:**
- Known vulnerabilities (CORS, debugpy, date validation)
- What works well (type safety, architecture)
- Next steps by priority

**Read This If:** You need to understand how the system is built and organized.

---

### 2. techContext.md (11.4 KB)
**Purpose:** Technology stack and engineering decisions  
**Contents:**
- Complete tech stack (Frontend: React 19, TypeScript 6; Backend: FastAPI)
- Build tools and dev environment
- Architecture patterns (component hierarchy, data flow)
- Integration points (frontend-backend type sync)
- Technology rationale (why each choice was made)
- Testing and dependency management
- Artifact storage and distribution

**Key Sections:**
- Frontend ecosystem (React, Vite, Tailwind, Recharts)
- Backend ecosystem (FastAPI, Pydantic, Uvicorn)
- Recommended deployment topology
- Security implications by technology

**Read This If:** You need to understand why certain technologies were chosen, or how to set up the development environment.

---

### 3. productContext.md (8.5 KB)
**Purpose:** Product definition and roadmap  
**Contents:**
- Product mission and goals
- Target audience and use cases
- Currently implemented features
- Missing/limited features
- Data characteristics (mock dataset)
- UI layout and UX principles
- Business metrics and success criteria
- Feature roadmap (Phase 1, 2, 3)
- Product health checklist

**Key Sections:**
- Product state (what works, what's missing)
- Roadmap phases (production ready → enterprise → analytics)
- Use case examples (spending monitoring, period comparison, deep-dive)

**Read This If:** You need to understand what the product does, what's planned, and what users expect.

---

### 4. activeContext.md (12.0 KB)
**Purpose:** Current priorities and implementation roadmap  
**Contents:**
- Phase 1 critical fixes (90 minutes)
  - CORS security configuration
  - Mock data caching
  - Debugpy removal
- Phase 2 high-priority improvements (2 hours)
  - Date range validation
  - Frontend error handling
  - Environment documentation
  - Logging setup
- Phase 3 quality improvements (5 hours)
  - Test coverage expansion
  - Code refactoring
- Implementation timeline

**Key Sections:**
- Each fix includes: status, criticality, effort, what/current/required/validation
- Active blockers
- Current code quality metrics
- Recommended day-by-day timeline

**Read This If:** You're about to start implementing changes, or need to prioritize work.

---

## 🔗 Cross-References

**If you need to find something specific:**

### By Topic

**CORS Security Issue**
→ `/backend/app/main.py:7-12` (current problem)  
→ `activeContext.md` (Phase 1.1 fix)  
→ `.agents/rules/coding-standards.md` (rule reference)

**Data Model**
→ `/frontend/src/lib/financial-types.ts` (frontend)  
→ `/backend/app/routes.py:1-15` (backend)  
→ `systemContext.md` (overview)

**Testing**
→ `/backend/tests/test_routes.py` (current tests)  
→ `activeContext.md` (Phase 3 expansion)  
→ `techContext.md` (testing stack section)

**API Endpoints**
→ `/backend/app/routes.py` (implementation)  
→ `systemContext.md` (API contract section)  
→ `activeContext.md` (validation requirements)

---

## 📊 Key Project Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Frontend Lines of Code** | ~500 | ✅ Lean |
| **Backend Lines of Code** | ~400 | ✅ Focused |
| **Test Coverage** | 15% | ⚠️ Needs expansion |
| **Critical Issues** | 3 | 🔴 Must fix before production |
| **Type Safety** | 95% | ✅ High |
| **API Endpoints** | 15 | ✅ Comprehensive |
| **Component Count** | 12 | ✅ Modular |

---

## 🚨 Critical Items Summary

**Must Fix Before Production:**
1. ✗ CORS open to `["*"]` → FIX in 30 min
2. ✗ Data regenerated per-request → FIX in 45 min
3. ✗ Debugpy exposed on port 5678 → FIX in 15 min

**Must Improve Before Launch:**
4. ✗ No date range validation → FIX in 30 min
5. ✗ Frontend has no error timeout → FIX in 45 min
6. ✗ Environment variables undocumented → FIX in 20 min
7. ✗ No logging infrastructure → FIX in 30 min

**Quality Improvements (After Launch):**
8. ✗ Test coverage only 15% → Expand to 80%+ (2-3 hrs)

---

## 🎯 Recommended Reading Order

### For Quick Onboarding (15 minutes)
1. This overview
2. [`systemContext.md`](./systemContext.md) - Read sections: Overview, Architecture, API Contract
3. [`activeContext.md`](./activeContext.md) - Read: Phase 1 Critical Fixes

### For Full Understanding (45 minutes)
1. This overview
2. [`systemContext.md`](./systemContext.md) - Full read
3. [`techContext.md`](./techContext.md) - Full read
4. [`productContext.md`](./productContext.md) - Full read
5. [`activeContext.md`](./activeContext.md) - Full read

### For Implementation (30 minutes)
1. [`activeContext.md`](./activeContext.md) - Read relevant phase
2. Link to specific files mentioned in phase
3. Cross-reference with `systemContext.md` if architecture questions arise

---

## 📝 Maintaining This Memory Bank

### Update Guidelines

**Update this memory bank when:**
- ✅ A critical issue is fixed
- ✅ A new feature is implemented
- ✅ Architecture decisions change
- ✅ Tech stack versions are upgraded
- ✅ New security issues are discovered

**Do NOT update this memory bank for:**
- Minor bug fixes
- Formatting changes
- Temporary workarounds
- Local environment-specific notes

### Checkpoints to Update

After completing a phase:
1. Update `activeContext.md` with completed items (mark ✅)
2. Update `systemContext.md` operational status
3. Update code quality metrics
4. Create a new entry in the checkpoint (if using session checkpoints)

---

## 🔗 External References

**Related Documentation:**
- [`/ENGINEERING-ANALYSIS.md`](../ENGINEERING-ANALYSIS.md) - Detailed technical audit (source of findings)
- [`/.agents/rules/coding-standards.md`](../.agents/rules/coding-standards.md) - Project standards and rules
- [`/README.md`](../README.md) - Quick start guide
- [`/README.es.md`](../README.es.md) - Quick start in Spanish
- [`/AGENTS.md`](../AGENTS.md) - Copilot agent guidelines

---

## ✅ Verification Checklist

**When onboarding a new contributor:**
- [ ] They read this overview
- [ ] They understand the 3 critical issues that block production
- [ ] They know the Phase 1 fixes and their effort (90 min total)
- [ ] They can find the relevant source files from memory bank references
- [ ] They've read the `coding-standards.md` rules
- [ ] They understand the type sync pattern (frontend/backend Literal types)

---

## 📞 Questions?

If something is unclear in the memory bank:
1. Check the full document (linked from summary)
2. Review `/ENGINEERING-ANALYSIS.md` for detailed findings
3. Look for code examples in `/backend/app/` and `/frontend/src/`
4. Consult the project standards in `/.agents/rules/`

---

**Version:** 1.0-alpha  
**Last Updated:** 2026-11-13  
**Accuracy:** Based on verified code audit (ENGINEERING-ANALYSIS.md)  
**Coverage:** System architecture, tech stack, product roadmap, active work items
