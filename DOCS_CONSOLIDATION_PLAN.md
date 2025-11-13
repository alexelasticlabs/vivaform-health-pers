# Documentation Consolidation Plan

## Active Documentation (Keep)

### Root Level
- ✅ `README.md` — main project readme (updated)
- ✅ `QUICK_START.md` — development quick start
- ✅ `DEPLOYMENT.md` — deployment guide
- ✅ `IMPLEMENTATION_SUMMARY.md` — latest work summary
- ⚠️ `ROADMAP.md` — keep, update if needed

### docs/ Directory
- ✅ `docs/index.md` — central docs index (NEW)
- ✅ `docs/admin.md` — admin panel guide (NEW)
- ✅ `docs/quiz-funnel.md` — quiz funnel design (NEW)
- ✅ `docs/architecture.md` — system architecture
- ✅ `docs/testing.md` — testing guide
- ✅ `docs/security-compliance.md` — security & GDPR
- ✅ `docs/deployment.md` — detailed deployment
- ✅ `docs/monitoring.md` — monitoring setup
- ✅ `docs/subscription.md` — subscription/stripe
- ✅ `docs/email.md` — email configuration
- ✅ `docs/checklists.md` — operational checklists

### App-Specific
- ✅ `apps/backend/README.md` — backend overview
- ✅ `apps/web/README.md` — web overview
- ✅ `apps/mobile/README.md` — mobile overview
- ✅ `apps/mobile/PUSH_NOTIFICATIONS.md` — push notifications

## To Archive (Duplicates/Outdated)

### Duplicates - Move to docs/archived/
- ⏳ `ADMIN_PANEL_GUIDE.md` → merged into `docs/admin.md`
- ⏳ `ADMIN_IMPLEMENTATION_SUMMARY.md` → superseded by `IMPLEMENTATION_SUMMARY.md`
- ⏳ `ENHANCED_QUIZ_IMPLEMENTATION.md` → merged into `docs/quiz-funnel.md`
- ⏳ `E2E_TESTING_GUIDE.md` → merged into `docs/testing.md`
- ⏳ `apps/backend/E2E_TESTING.md` → merged into `docs/testing.md`
- ⏳ `apps/backend/ADMIN_MANAGEMENT.md` → merged into `docs/admin.md`
- ⏳ `apps/backend/ADMIN_ACCESS_GUIDE.md` → merged into `docs/admin.md`
- ⏳ `DOCUMENTATION_INDEX.md` → superseded by `docs/index.md`
- ⏳ `docs/README.md` → superseded by `docs/index.md`

### Reports - Keep for historical reference
- ⏸️ `PROJECT_AUDIT_REPORT.md` — historical audit
- ⏸️ `DOCUMENTATION_CLEANUP_REPORT.md` — historical cleanup report
- ⏸️ `FOOD_DATABASE_IMPLEMENTATION.md` — historical implementation report

### Templates - Keep
- ✅ `COMMIT_AND_PR_TEMPLATE.md` — commit/PR guidelines
- ✅ `GDPR_COMPLIANCE.md` — compliance checklist

## Consolidation Actions

### 1. Update docs/testing.md
Merge content from:
- E2E_TESTING_GUIDE.md
- apps/backend/E2E_TESTING.md

### 2. Update docs/admin.md
Merge content from:
- ADMIN_PANEL_GUIDE.md
- apps/backend/ADMIN_MANAGEMENT.md
- apps/backend/ADMIN_ACCESS_GUIDE.md
- ADMIN_IMPLEMENTATION_SUMMARY.md

### 3. Update docs/quiz-funnel.md
Merge content from:
- ENHANCED_QUIZ_IMPLEMENTATION.md

### 4. Update README.md
- Add link to docs/index.md
- Simplify to essential info only
- Point to QUICK_START.md for dev setup

### 5. Archive moved files
Move to docs/archived/ with deprecation notice at the top

## Final Structure

```
/
├── README.md (simplified, links to docs/)
├── QUICK_START.md
├── DEPLOYMENT.md
├── IMPLEMENTATION_SUMMARY.md
├── ROADMAP.md
├── COMMIT_AND_PR_TEMPLATE.md
├── GDPR_COMPLIANCE.md
├── PROJECT_AUDIT_REPORT.md (historical)
├── DOCUMENTATION_CLEANUP_REPORT.md (historical)
├── FOOD_DATABASE_IMPLEMENTATION.md (historical)
│
├── docs/
│   ├── index.md (master index)
│   ├── admin.md (consolidated)
│   ├── quiz-funnel.md (consolidated)
│   ├── architecture.md
│   ├── testing.md (consolidated)
│   ├── security-compliance.md
│   ├── deployment.md
│   ├── monitoring.md
│   ├── subscription.md
│   ├── email.md
│   ├── checklists.md
│   │
│   └── archived/
│       ├── ADMIN_PANEL_GUIDE.md
│       ├── ADMIN_IMPLEMENTATION_SUMMARY.md
│       ├── ENHANCED_QUIZ_IMPLEMENTATION.md
│       ├── E2E_TESTING_GUIDE.md
│       ├── DOCUMENTATION_INDEX.md
│       └── (old backend docs)
│
└── apps/
    ├── backend/README.md
    ├── web/README.md
    └── mobile/README.md
```

## Benefits
- ✅ Single source of truth for each topic
- ✅ Clear separation: active vs historical vs archived
- ✅ Easy navigation via docs/index.md
- ✅ No duplicate maintenance burden
- ✅ Historical context preserved in archived/

