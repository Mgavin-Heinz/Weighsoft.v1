# Documentation Directory Structure

**Last Updated:** December 17, 2025

This document describes the physical directory structure of the Weighsoft documentation.

---

## 📂 Directory Tree

```
docs/
├── README.md                       ← Top-level entry point
│
├── 00-navigation/                  ← Navigation & Index Files
│   ├── README.md                   Main documentation index (START HERE!)
│   ├── 00-DOCUMENTATION-INDEX.md   Detailed index with organization info
│   ├── DOCUMENTATION-SUMMARY.md    Quick summary of all docs
│   └── NAVIGATION-GETTING-STARTED.md   Getting started guide
│
├── 01-getting-started/             ← Quick Start & Overview
│   ├── 00-OVERVIEW.md              What is Weighsoft?
│   ├── 00-SYSTEM-OVERVIEW.md       Technical architecture overview
│   └── 00-QUICK-REFERENCE.md       Developer quick reference
│
├── 02-architecture/                ← System Architecture
│   ├── 01-ARCHITECTURE.md          System design patterns
│   ├── 02-DATABASE-SCHEMA.md       Database tables and columns
│   ├── 03-API-DOCUMENTATION.md     REST API endpoints
│   └── 06-DATA-MODEL.md            Entity relationships
│
├── 03-user-guide/                  ← User Documentation
│   ├── 01-USER-ROLES.md            User types and permissions
│   ├── 02-BUSINESS-WORKFLOWS.md    Business processes (9 workflows)
│   ├── 03-REPORTS.md               Reporting system
│   └── 04-UI-REQUIREMENTS.md       UI screens and layouts
│
├── 04-developer-guide/             ← Developer Documentation
│   ├── 06-DEVELOPMENT-WORKFLOW.md  Git workflow and standards
│   ├── 07-BUSINESS-LOGIC.md        Business rules and calculations
│   ├── 08-ADDITIONAL-ENDPOINTS.md  Additional API endpoints
│   ├── 09-ROUTING.md               Frontend routing
│   ├── 10-BUSINESS-RULES-VALIDATION.md   Validation rules
│   └── 11-EDGE-CASES-ERROR-HANDLING.md   Error handling
│
├── 05-integrations/                ← Hardware & External Systems
│   ├── 05-INTEGRATIONS.md          All hardware integrations
│   ├── 05-DEPLOYMENT.md            Deployment procedures
│   ├── ESP32-RELAY-INTEGRATION.md  ESP32 relay control
│   ├── ESP32-BACKEND-PROXY.md      Backend proxy design
│   ├── ESP32-CORRECT-DESIGN.md     ESP32 design patterns
│   └── BOOM-LIGHT-INTEGRATION-PLAN.md   Integration planning
│
├── 06-features/                    ← Feature-Specific Docs
│   ├── SMART-HAULIERS-FEATURE.md   Haulier notifications (planned)
│   ├── SMART-HAULIERS-WHATSAPP.md  WhatsApp integration
│   └── SMART-HAULIERS-BUSINESS-PROPOSAL.md   Business case
│
├── 07-qa-testing/                  ← Testing & QA
│   ├── QA-TESTING-MESSAGE.md       Testing guidelines
│   ├── VERIFICATION-CHECKLIST.md   System verification checklist
│   ├── SYSTEMATIC-VERIFICATION-PROCESS.md   Verification methodology
│   ├── VERIFICATION-RESULTS-ANALYSIS.md   Results analysis
│   ├── DUPLICATE-TRANSACTION-ID-ANALYSIS.md   Issue analysis
│   ├── DUPLICATE-TRANSACTION-ID-VERIFICATION.md   Fix verification
│   └── DUPLICATE-TRANSACTION-MONITORING.md   Ongoing monitoring
│
├── 08-project-management/          ← Project Management
│   ├── COMPLETENESS-CHECKLIST.md   Documentation completeness
│   └── ENTITY-DOCUMENTATION-CHECKLIST.md   Entity checklist
│
├── data/                           ← Data Files (CSV)
│   ├── Check Transaction Counter Values.csv
│   ├── Check for Multiple Transaction Records.csv
│   └── Check Database for Duplicates.csv
│
└── archive/                        ← Archived/Outdated Files
    └── 04-INTEGRATIONS-OLD.md      Superseded by 05-INTEGRATIONS.md
```

---

## 📊 File Count by Directory

| Directory | File Count | Description |
|-----------|------------|-------------|
| `00-navigation/` | 4 files | Navigation and index files |
| `01-getting-started/` | 3 files | Quick start guides |
| `02-architecture/` | 4 files | System architecture docs |
| `03-user-guide/` | 4 files | User-facing documentation |
| `04-developer-guide/` | 6 files | Developer documentation |
| `05-integrations/` | 6 files | Integration documentation |
| `06-features/` | 3 files | Feature-specific docs |
| `07-qa-testing/` | 7 files | Testing and QA docs |
| `08-project-management/` | 2 files | Project management |
| `data/` | 3 files | CSV data files |
| `archive/` | 1 file | Archived documentation |
| **TOTAL** | **43 files** | Complete documentation set |

---

## 🎯 Navigation Strategy

### For New Users
1. Start at `docs/README.md`
2. Follow link to `00-navigation/README.md`
3. Choose your role-based path

### For Developers
1. Go directly to `01-getting-started/00-QUICK-REFERENCE.md`
2. Then browse `02-architecture/` and `04-developer-guide/`

### For Business Users
1. Start with `01-getting-started/00-OVERVIEW.md`
2. Then read `03-user-guide/` documentation

### For System Admins
1. Read `01-getting-started/00-SYSTEM-OVERVIEW.md`
2. Then explore `05-integrations/`

---

## 🔄 Maintenance Guidelines

### Adding New Documentation

1. **Determine the correct directory** based on content type:
   - Getting started guides → `01-getting-started/`
   - Technical architecture → `02-architecture/`
   - User guides → `03-user-guide/`
   - Developer guides → `04-developer-guide/`
   - Integrations → `05-integrations/`
   - New features → `06-features/`
   - Testing/QA → `07-qa-testing/`
   - Project management → `08-project-management/`
   - Data files → `data/`

2. **Update navigation files:**
   - Add entry to `00-navigation/README.md`
   - Update `00-navigation/00-DOCUMENTATION-INDEX.md` if needed

3. **Follow naming conventions:**
   - Core docs: Use numbered prefixes (e.g., `01-FILE-NAME.md`)
   - Feature docs: Use descriptive names (e.g., `FEATURE-NAME.md`)
   - Always use UPPERCASE with hyphens

### Archiving Documentation

1. Move outdated file to `archive/` directory
2. Update `00-navigation/README.md` to reference archived file
3. Add reason for archiving in the archive section

### Updating Links

When reorganizing files:
1. Use relative paths: `../directory/file.md`
2. Update all navigation files
3. Search for broken links using text search
4. Test critical navigation paths

---

## ✅ Benefits of This Structure

### Logical Organization
- **Clear hierarchy** - Easy to find related documents
- **Separation of concerns** - Technical vs. user vs. management docs
- **Scalability** - Easy to add new documents

### Easy Navigation
- **Role-based paths** - Each user type has a clear starting point
- **Numbered directories** - Shows recommended reading order
- **Descriptive names** - Self-documenting structure

### Maintainability
- **Isolated changes** - Changes in one area don't affect others
- **Version control friendly** - Git diffs are cleaner
- **Future-proof** - Easy to extend with new categories

---

## 🗺️ Quick Access by Topic

### Architecture & Technical
- `02-architecture/01-ARCHITECTURE.md`
- `02-architecture/02-DATABASE-SCHEMA.md`
- `02-architecture/03-API-DOCUMENTATION.md`

### Business Processes
- `03-user-guide/02-BUSINESS-WORKFLOWS.md`
- `03-user-guide/01-USER-ROLES.md`
- `03-user-guide/03-REPORTS.md`

### Development
- `04-developer-guide/06-DEVELOPMENT-WORKFLOW.md`
- `04-developer-guide/07-BUSINESS-LOGIC.md`
- `04-developer-guide/10-BUSINESS-RULES-VALIDATION.md`

### Integrations
- `05-integrations/05-INTEGRATIONS.md` (master integration doc)
- `05-integrations/ESP32-RELAY-INTEGRATION.md` (boom/light control)
- `05-integrations/05-DEPLOYMENT.md` (deployment)

### Quality Assurance
- `07-qa-testing/VERIFICATION-CHECKLIST.md`
- `07-qa-testing/QA-TESTING-MESSAGE.md`

---

**For complete navigation, see [README.md](README.md)**

