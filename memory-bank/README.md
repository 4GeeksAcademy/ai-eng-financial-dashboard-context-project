---
name: Memory Bank Index
description: Central knowledge base for the Financial Metrics Dashboard project
date_created: 2026-11-25
---

# Memory Bank 🧠

This directory contains the central knowledge base for the **Financial Metrics Dashboard** project. All documentation is **grounded in the actual codebase** — no invented features or imaginary roadmaps.

## 📄 Documents

### 1. **PRODUCT_OVERVIEW.md**
**What is this project, and what does it actually do?**

- Executive summary and core value proposition
- Verified feature checklist (30/30 items passing)
- Known limitations (data persistence, auth, real-time)
- Product-reality alignment (no claims without code)
- Success criteria (all met)

**Read this if**: You need to understand what the dashboard does and what isn't implemented yet.

---

### 2. **TECH_STACK.md**
**What languages, frameworks, and tools are we using?**

- Complete dependency tree (frontend & backend)
- Version pinning and security status
- Configuration files and their purposes
- Build & deployment processes
- CVE status and license compliance

**Read this if**: You need to set up the project, troubleshoot environment issues, or assess tech debt.

---

### 3. **CURRENT_STATE.md**
**What works now, what's missing, and what should we do next?**

- ✅ What is 100% implemented (dashboard, API, tests)
- 🔴 Known gaps (no database, no auth, no mutation endpoints)
- 🎯 Suggested roadmap (5 phases, prioritized)
- ⚙️ Implementation rules (non-negotiable project conventions)
- 📝 Notes for the next developer

**Read this if**: You're planning features, assessing effort, or onboarding to the team.

---

## 🎯 Quick Navigation

### **I want to understand the product**
→ Start with **PRODUCT_OVERVIEW.md**

### **I need to run/deploy the project**
→ Check **TECH_STACK.md** (Deployment Readiness section)

### **I'm adding a new feature**
→ Read **CURRENT_STATE.md** (Implementation Rules section)

### **I'm troubleshooting something**
→ Consult all three; cross-reference with `.agents/rules/`

---

## 📋 Governance & Rules

This memory bank works alongside **project rules** in `.agents/rules/`:

| Rule File | Coverage |
|-----------|----------|
| `01-architecture.mdc` | Frontend/backend separation (ARC-01, ARC-02) |
| `02-naming.mdc` | UI language, snake_case vs camelCase (NAM-01, NAM-02, NAM-03) |
| `03-testing.mdc` | Test file naming and coverage (TST-01, TST-02) |
| `04-documentation.mdc` | Titles, README maintenance (DOC-03) |
| `05-developer-experience.mdc` | Alias imports @/, package-lock.json (DX-02, DX-03) |
| `06-dependencies.mdc` | Dependency management (DEP-01) |
| `07-styles.mdc` | CSS variables, Tailwind usage (STY-01, STY-02) |
| `08-backend-python.mdc` | FastAPI patterns |
| `09-frontend-react.mdc` | React component structure (REACT-01, REACT-02) |
| `10-security.mdc` | CORS configuration (SEC-01) |

**All 30 verification checks** in `../verification.md` are **passing**.

---

## ✅ Verification Status

| Category | Status | Evidence |
|----------|--------|----------|
| **Product Reality** | ✅ Verified | 30/30 checks pass; no invented features |
| **Stack Completeness** | ✅ Verified | All tools documented with versions |
| **Implementation Status** | ✅ Verified | Gaps listed honestly; no false claims |
| **Rules Compliance** | ✅ Enforced | 10 governance files in `.agents/rules/` |

---

## 🚫 What's NOT Here

- ❌ Speculative roadmaps without effort estimates
- ❌ Hypothetical architecture discussions
- ❌ Invented features not in code
- ❌ Unvetified performance claims

**Everything documented is derived from**:
- Code inspection (`backend/`, `frontend/`, `docker-compose.yml`)
- Running tests (`pytest`, `vitest`)
- Verification checklist (`verification.md`)

---

## 📞 For Agents & Contributors

Before making changes:
1. ✅ Consult this memory bank (especially CURRENT_STATE.md)
2. ✅ Review project rules in `.agents/rules/`
3. ✅ Check implementation status in CURRENT_STATE.md
4. ✅ Update relevant memory bank docs after changes

**When adding features**:
- Update `CURRENT_STATE.md` with new capabilities
- Add tests (backend & frontend)
- Follow the 10 implementation rules
- Verify TypeScript/Pydantic compilation

---

## 📚 Additional Resources

- **Verification**: `../verification.md` (30-item checklist, all passing)
- **Rules**: `.agents/rules/` (10 governance files)
- **Analysis**: `../analysis/rules-analysis.md`
- **Agent Guide**: `../AGENTS.md`

---

**Last Updated**: 2026-11-25  
**Status**: All documents verified from codebase; no invented content.

