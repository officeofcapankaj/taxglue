# 1. OBJECTIVE

Implement critical data structure and architectural improvements for TaxGlue:

**Phase 1 (Immediate):**
1. Fix hardcoded Supabase credentials - move to environment variables
2. Fix insecure RLS policies - implement proper tenant isolation
3. Consolidate duplicate database schema files

**Phase 2 (High Priority):**
4. Extract common utilities (sidebar, client-selector) into shared components
5. Standardize JSON data files with versioning

**Phase 3 (Medium):**
6. Document backend architecture decision

---

## IMPLEMENTATION STATUS

### Phase 1: Critical Security Fixes
- [ ] Step 1: Remove hardcoded credentials from `js/supabase-api.js`
- [ ] Step 2: Create `.env.example` with environment variable placeholders
- [ ] Step 3: Update `js/supabase-api.js` to read from environment variables
- [ ] Step 4: Fix RLS policies in `supabase-rls-setup.sql`
- [ ] Step 5: Consolidate `supabase-tables.sql` and `supabase-rls-setup.sql`

### Phase 2: High Priority Improvements
- [ ] Step 6: Extract sidebar component to `js/shared/sidebar.js`
- [ ] Step 7: Extract client-selector to `js/shared/client-selector.js`
- [ ] Step 8: Standardize JSON data files with version metadata

### Phase 3: Documentation
- [ ] Step 9: Update DEVELOPMENT.md with backend decision
- [ ] Step 10: Add gitignore entry for .env files

---

## FILES TO MODIFY

1. `js/supabase-api.js` - Remove hardcoded credentials, use environment variables
2. `js/config.js` - Update to use environment variables
3. `.env.example` - Create with placeholder values
4. `.gitignore` - Add .env to ignore list
5. `supabase-rls-setup.sql` - Fix RLS policies with auth.uid()
6. `supabase-tables.sql` - Consolidate schema definitions
7. `database/schema.sql` - Create consolidated schema file
8. `js/shared/sidebar.js` - Create shared sidebar component
9. `js/shared/client-selector.js` - Create shared client selector
10. `data/clients.json` - Add version metadata
11. `DEVELOPMENT.md` - Document backend decision

---

# 2. CONTEXT SUMMARY

**Current Architecture Analysis:**

| Feature | Current State | Adequate? | Notes |
|---------|-------------|-----------|-------|
| Organization/Team Access | Users directly own client records via `user_id` | ❌ No | Needs new multi-tenant tables |
| Drill-Down Reports | None - flat summary reports only | ❌ No | Need click-through to details |
| Manual/Excel Entry | Manual forms only | ❌ No | Need Excel import feature |
| Export (Word/Excel/PDF) | HTML display only | ❌ No | Need export libraries |

**Current Report Flow:**
- Reports generated client-side in browser (JavaScript modules)
- Data loaded from localStorage or API and rendered as HTML tables
- No drill-down, no export capability
- No Excel import capability

**Proposed Architecture Change:** ENHANCE (Not Rebuild)
- Keep client-side rendering for interactivity
- Add drill-down via modal/page navigation
- Add Excel import using SheetJS library
- Add export using jsPDF (PDF), SheetJS (Excel), docx.js (Word)

**Files Impacted:**
- Database: New organization tables
- Frontend: New report drill-down, import/export features
- Backend: New organization API routes


# 3. APPROACH OVERVIEW

**Technology:** Supabase (Online) only - No offline mode

**Part A: Multi-Tenant Organization**
- Organization-first architecture with membership-based access
- Role-based permissions for team members
- Data ownership via organization_id
- **Migrate existing user data** to new organization model

**Part B: Enhanced Reporting**

For drill-down and export features:
1. **Drill-Down to Voucher Level**: Click account → Shows voucher list → Click voucher for details
2. **Dynamic Excel Templates**: Templates generated based on page fields
3. **Library Integration**: Add SheetJS (Excel), jsPDF (PDF), docx.js (Word)
4. **Excel Import**: Parse uploaded Excel files to populate data tables

# 4. IMPLEMENTATION STEPS

## Part A: Organization System (Steps 1-7 as before)

### Step 1: Create Organization Database Schema
**Goal:** Establish the core multi-tenant tables

**Method:** Add new database migration with:
- `organizations` table (id, name, owner_user_id, subscription_plan, status, created_at)
- `organization_members` table (id, organization_id, user_id, role, status, invited_by, invited_at, joined_at)
- `organization_roles` table (id, role_name, description, is_system_role)
- `role_permissions` table (id, role_id, module, permission_type, is_allowed)

**Reference:** New file: `database/migrations/004_organization_tables.sql`

### Step 2: Update Existing Tables for Organization Ownership
**Goal:** Migrate data ownership from user-level to organization-level

**Method:** 
- Add `organization_id` column to all data tables
- **Migrate existing users' data**: Create organization for each existing user and associate their data
- Migration script:
  1. Create organization for each unique user_id in clients table
  2. Update all client records with corresponding organization_id
  3. Copy to other tables: accounts, vouchers, trial_balance, employees, etc.

**Migration Note:** This ensures existing users retain access to their data after the upgrade

### Step 3: Update RLS Policies for Organization-Based Access
**Goal:** Secure data access at organization level

**Method:**
- Replace `user_id`-based RLS policies with `organization_id`-based policies

### Step 4: Create Organization Management API
**Goal:** Backend endpoints for organization operations

**Method:** Add Express routes for CRUD operations on organizations and members

### Step 5: Create Organization Management Frontend
**Goal:** UI for managing organizations and team members

**Method:** Create new pages in `app/` directory

### Step 6: Update Authentication Flow
**Goal:** Create organization on signup

**Method:** Modify signup to auto-create organization

### Step 7: Define Default Roles & Permissions
**Goal:** Pre-configure standard roles with simple permissions

**Method:** Use binary permission model:
- **View Only**: Can see data but cannot edit or create
- **Make Changes**: Can view, create, edit, and delete data

**Default Role Configuration:**
| Role | Permission Level | Description |
|------|----------------|-------------|
| Owner | Make Changes | Full access to all features |
| Accountant | Make Changes | Can manage clients, accounts, vouchers, payroll |
| Auditor | View Only | Read-only access to all data |
| Consultant | View Only | Read-only access to reports only |
| Custom | Configurable | Owner can create custom roles |

**Permission Matrix (Default):**
| Role | Clients | Accounts | Vouchers | Payroll | Reports | Settings |
|------|---------|----------|---------|---------|---------|----------|
| Owner | ✓ Change | ✓ Change | ✓ Change | ✓ Change | ✓ Change | ✓ Change |
| Accountant | ✓ Change | ✓ Change | ✓ Change | ✓ Change | View Only | View Only |
| Auditor | View Only | View Only | View Only | View Only | View Only | None |
| Consultant | View Only | View Only | View Only | None | View Only | None |

---

## Part B: Enhanced Reporting (NEW Steps 8-13)

### Step 8: Add Data Linking for Drill-Down
**Goal:** Enable drill-down from reports to voucher level

**Method:**
- Reports must include `voucher_id` references to source vouchers
- Add API endpoint: `GET /api/vouchers/by-account/:accountId`
- Drill-down flow: Report → Account → List of Vouchers → Voucher Details

**Drill-Down Levels:**
1. **Level 1**: Click account in Trial Balance → Shows list of vouchers (date, voucher no, debit/credit)
2. **Level 2**: Click voucher → Shows full voucher details (date, type, narration, all line items)

**Reference:** Enhanced `server/routes/reports.js`

### Step 9: Create Drill-Down Modal Component
**Goal:** Display detailed transactions when clicking report line items

**Method:** Create reusable modal component:
- `app/components/drilldown-modal.html`
- Shows vouchers/transactions for selected account
- Date range filter, voucher type filter

### Step 10: Integrate Excel Import Library
**Goal:** Enable bulk data entry via Excel templates

**Method:**
- Add SheetJS (xlsx) library
- Create Excel template files dynamically based on the fields in each page/form
- Create import handler that parses Excel and inserts into database

**Reference:** New `js/import/excel-import.js`

### Step 11: Create Dynamic Excel Template Generator
**Goal:** Templates include fields required in respective pages

**Method:** 
Templates shall include columns matching the input fields in each page:

**Client Template:**
- Name, Constitution, Address, City, District, State, Pincode, Phone, Email, GSTIN, PAN

**Account Template:**
- Code, Name, Nature (Assets/Liability/Income/Expense), Type (Direct/Indirect/Capital), Opening Balance

**Voucher Template:**
- Date, Voucher No, Voucher Type, Narration, Account Name, Debit Amount, Credit Amount

**Employee Template:**
- Employee Code, First Name, Last Name, Date of Joining, Department, Designation, PAN, Aadhaar, UAN, Bank Details

**Template Generation:**
- Each data entry page has "Download Template" button
- Template contains only the fields relevant to that page
- Users download, fill data, and upload to import

**Reference:** New `js/import/template-generator.js`

### Step 12: Integrate Export Libraries
**Goal:** Enable export to Word, Excel, PDF

**Method:**
- Add libraries: jsPDF, docx.js, SheetJS
- Create export functions for each report type
- Add export buttons to report UI

**Reference:** New `js/export/report-export.js`

### Step 13: Update Report Modules with Drill-Down & Export
**Goal:** Add drill-down and export to all report modules

**Method:**
- Update `trialBalance.js` with click-to-drill-down
- Update `balanceSheet.js` with drill-down
- Add export buttons to all report pages
- Update template files: `modules/trial-balance.html`, `modules/balance-sheet.html`

---

# 5. TESTING AND VALIDATION

**Part A Success Conditions (Organization System):**
1. New user registration creates an organization automatically
2. **Existing users' data migrated** to new organization structure seamlessly
3. Owner can view and manage team members in their organization
4. Owner can invite users with specific roles (accountant/auditor/consultant)
5. Invited users can log in and see the organization data based on their role permissions
6. RLS policies correctly restrict access to user's organization only
7. Demo user can still login and access their data

**Part B Success Conditions (Reporting):**
1. Clicking any account in Trial Balance shows related vouchers
2. Clicking any line item in Balance Sheet/PL shows underlying transactions
3. Excel template import creates multiple records correctly
4. Trial Balance exports to Excel with proper format
5. Balance Sheet exports to PDF with formatting intact
6. Reports can be exported to Word document

**Verification Steps:**
- Generate Trial Balance → Click account row → Verify voucher list appears
- Download Excel template → Fill data → Upload → Verify data imported
- Click "Export PDF" on Balance Sheet → Verify PDF downloads with proper formatting
- Click "Export Excel" on Trial Balance → Verify Excel file opens correctly
- Upload bank statement → Verify auto-matching works
- Fill form → Wait 30s → Verify auto-saved
- Create invoice → Generate E-invoice → Verify IRN generated

---

## Part C Success Conditions (Competitive Improvements):
1. Upload Bank Statement CSV → Auto-matched with vouchers → Can manually match unmatched
2. Auto-save every 30s → Works across browser refresh
3. Generate E-invoice → IRN generated → QR code shown

---

## Final Feature Table After All Improvements:

---

# 6. COMPETITOR ANALYSIS & IMPROVEMENTS

## Competitor Comparison: TaxGlue vs Market Leaders

| Feature | TaxGlue (Planned) | TallyPrime | Zoho Books | Busy | Vyapar |
|---------|-------------------|------------|------------|------|--------|
| **Multi-User/Teams** | ✅ Organization + Roles | ⚠️ Limited | ✅ Multi-user | ⚠️ Limited | ✅ Team |
| **Role Permissions** | ✅ View Only / Change | ❌ Basic | ✅ Role-based | ❌ Basic | ⚠️ Basic |
| **Drill-Down Reports** | ✅ Planned | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Excel Import** | ✅ Planned | ⚠️ Manual | ✅ Yes | ⚠️ Manual | ✅ Yes |
| **Excel Export** | ✅ Planned | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **PDF Export** | ✅ Planned | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Word Export** | ✅ Planned | ❌ No | ❌ No | ❌ No | ❌ No |
| **GST Compliance** | ✅ Existing | ✅ Excellent | ✅ Good | ✅ Good | ✅ Good |
| **TDS/Payroll** | ✅ Existing | ⚠️ Add-on | ✅ Yes | ⚠️ Add-on | ✅ Yes |
| **Mobile App** | ❌ No | ❌ No | ✅ Yes | ❌ No | ✅ Yes |
| **Auto-Save** | ⚠️ localStorage | ✅ Yes | ✅ Yes | ⚠️ Manual | ✅ Yes |
| **Bank Recon** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **E-Invoice/E-Waybill** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **AI Features** | ❌ No | ❌ No | ✅ Yes | ❌ No | ✅ Yes |

## Competitive Advantages of Our Plan:
1. ✅ **Word Export** - Only TaxGlue offers this (unique differentiator)
2. ✅ **Dynamic Excel Templates** - Templates generated per page fields
3. ✅ **Simple Binary Permissions** - Easy to understand: View Only / Make Changes
4. ✅ **Organization Model** - Modern multi-tenant SaaS approach

## Suggested Improvements from Competitor Analysis:

### High Priority Additions:
1. **Bank Reconciliation** - Critical feature missing
   - Competitors: All include this
   - Add: `bank_reconciliation` table, match transactions with bank statements

2. **Auto-Save** - Prevent data loss
   - Current: localStorage manual save
   - Add: Auto-save to database every 30 seconds

3. **E-Invoice / E-Waybill** - GST compliance
   - Add: Integration with NIC portal for einvoice generation
   - Status: Must-have for business clients

### Medium Priority Additions:
4. **Mobile App** - Growing need
   - Add: PWA (Progressive Web App) for mobile access
   - Use: React Native or PWA convertor

5. **Dashboard Analytics** - Quick insights
   - Add: Executive dashboard with KPIs
   - Charts: Revenue, expenses, profit trends

### Nice-to-Have Additions:
6. **AI-Powered Insights** - Chat-based assistance
   - Add: AI chatbot for accounting queries
   - Use: OpenAI or similar for natural language queries

7. **Document Management** - Store invoices/attachments
   - Add: File upload with cloud storage
   - Link: Attach documents to vouchers

8. **Email Integration** - Send invoices/reports
   - Add: Send reports via email directly
   - Use: SendGrid or similar

---

## Recommended Additional Steps for Implementation:

### Step 14: Add Bank Reconciliation
**Goal:** Enable automatic bank statement matching

**Method:**
- Add `bank_reconciliation` table with columns: id, client_id, fy, bank_account, statement_date, debit, credit, matched, voucher_id, status
- Add API endpoint: `POST /api/bank-recon/import` - Upload bank statement CSV
- Add API endpoint: `POST /api/bank-recon/match` - Auto-match transactions
- Create UI: `app/bank-reconciliation.html`

**Reference:** New table in `supabase-tables.sql`

### Step 15: Add Auto-Save Feature
**Goal:** Prevent data loss from browser close

**Method:**
- Add auto-save hook in forms
- Save draft data every 30 seconds to `drafts` table
- Recover unsaved data on page reload
- Show "Last saved" timestamp in UI

**Reference:** New `js/utils/autosave.js`

### Step 16: Add E-Invoice Integration
**Goal:** Generate GST e-invoices directly

**Method:**
- Add `e_invoices` table: id, client_id, invoice_data, irn, qr_code, status, created_at
- Integrate with GSTN e-invoice API
- Generate IRN, QR code
- Push to e-invoice portal

**Reference:** New `supabase/functions/generate-einvoice/index.ts`

---

## FINAL IMPLEMENTATION STEPS SUMMARY

**Part A: Organization System (Steps 1-7)**
- Step 1: Organization tables
- Step 2: Update existing tables + Migrate existing users
- Step 3: RLS policies
- Step 4: Organization API
- Step 5: Organization UI
- Step 6: Auth flow
- Step 7: Roles & permissions

**Part B: Enhanced Reporting (Steps 8-13)**
- Step 8: Drill-down data linking
- Step 9: Drill-down modal
- Step 10: Excel import library
- Step 11: Dynamic templates
- Step 12: Export libraries
- Step 13: Update report modules

**Part C: Competitive Improvements (Steps 14-16)**
- Step 14: Bank Reconciliation
- Step 15: Auto-Save
- Step 16: E-Invoice

---

## Final Feature List After Improvements:

| Priority | Feature | Competitor Advantage |
|----------|---------|---------------------|
| Must-Have | Bank Reconciliation | Match market |
| Must-Have | Auto-Save | Better than Tally |
| Must-Have | E-Invoice | Business requirement |
| Should Have | Mobile (PWA) | Match Vyapar |
| Should Have | Dashboard Analytics | Better UX |
| Nice-to-Have | AI Chat | Match Zoho |
| Nice-to-Have | Document Storage | Complete solution |
| **Unique** | Word Export | Differentiator |
| **Unique** | Dynamic Excel | Better than all |

---

# 7. DATA STRUCTURE & ARCHITECTURAL IMPROVEMENTS

## Executive Summary

After thorough analysis of the TaxGlue codebase, the following critical issues and recommendations have been identified for data structure and architectural improvements.

---

## 7.1 CRITICAL ISSUES IDENTIFIED

### Issue 1: Hardcoded Supabase Credentials 🔴 CRITICAL
**Severity**: SECURITY
**File**: `js/supabase-api.js` (Lines 8-9)

```javascript
const SUPABASE_URL = "https://jgjeuybgideeqcjxvlmn.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Impact**: Production credentials exposed in client-side code
**Recommendation**: Move to environment variables via `.env` file and import at runtime

---

### Issue 2: Insecure Row Level Security Policies 🔴 CRITICAL
**Severity**: SECURITY
**File**: `supabase-rls-setup.sql`

All RLS policies use `USING (true)` allowing unrestricted access:
```sql
CREATE POLICY "Allow public read access to clients" ON clients 
  FOR SELECT TO anon, authenticated USING (true);
```

**Impact**: Any authenticated user can access any organization's data
**Recommendation**: Implement proper user-based access control using `auth.uid() = user_id`

---

### Issue 3: Duplicate Table Definitions 🟠 HIGH
**Severity**: MAINTAINABILITY
**Files**: `supabase-tables.sql`, `supabase-rls-setup.sql`

Both files define identical tables with conflicting schema:
- `supabase-tables.sql`: Uses UUID primary keys
- `supabase-rls-setup.sql`: Uses SERIAL primary keys

**Impact**: Confusion about correct schema, potential deployment errors
**Recommendation**: Consolidate into single `database/schema.sql`

---

### Issue 4: Duplicate Backend Servers 🟡 MEDIUM
**Severity**: MAINTAINABILITY
**Files**: `server.py`, `server_new.py`, `server/index.js`

Three different server implementations create maintenance burden and confusion.

**Recommendation**: Choose one primary backend (Node.js/Express recommended for consistency with frontend)

---

## 7.2 DATA STRUCTURE IMPROVEMENTS

### Recommendation 1: Consolidate Database Schema
**Current**: Two conflicting SQL files
**Proposed**: Single `database/schema.sql` with all tables, RLS, and indexes

**Proposed Structure**:
```
database/
├── schema.sql          # Single source of truth
├── migrations/
│   ├── 001_clients.sql
│   ├── 002_accounting.sql
│   └── 003_organization.sql
└── seeds/
    └── default_accounts.sql
```

---

### Recommendation 2: Standardize JSON Data Files
**Current**: No consistent schema across `data/` directory
**Proposed**: Add versioning and metadata to all JSON files

**Current `data/clients.json`**:
```json
[
  {
    "id": "demo-1",
    "user_id": "admin",
    ...
  }
]
```

**Proposed Structure**:
```json
{
  "version": "1.0",
  "lastUpdated": "2026-03-29T10:00:00Z",
  "metadata": {
    "generatedBy": "seed",
    "notes": "Demo clients for testing"
  },
  "data": [
    {
      "id": "demo-1",
      "owner_id": "admin",
      ...
    }
  ]
}
```

---

### Recommendation 3: Add Data Validation Layer
**Current**: Direct insert/update without validation
**Proposed**: Create validators for all entity types

**Proposed Structure**:
```
js/
├── validators/
│   ├── client.validator.js
│   ├── voucher.validator.js
│   └── tds-transaction.validator.js
└── api/
    └── client-wrapper.js  # Centralized with interceptors
```

---

## 7.3 ARCHITECTURAL IMPROVEMENTS

### Recommendation 4: Reorganize Frontend Structure
**Current**: Flat directory with mixed concerns
**Proposed**: Feature-based organization

**Current Structure**:
```
app/
  ├── bookkeeping.html    # Mixed HTML + CSS + JS
  ├── clients.html
  ├── dashboard.html
  └── ...
```

**Proposed Structure**:
```
app/
├── pages/
│   ├── dashboard/
│   │   ├── dashboard.html
│   │   └── dashboard.js
│   ├── clients/
│   │   ├── clients.html
│   │   └── clients.js
│   └── bookkeeping/
│       ├── bookkeeping.html
│       └── bookkeeping.js
├── components/
│   ├── sidebar/
│   │   ├── sidebar.html
│   │   └── sidebar.js
│   ├── client-selector/
│   │   ├── client-selector.html
│   │   └── client-selector.js
│   └── drilldown-modal/
│       ├── drilldown-modal.html
│       └── drilldown-modal.js
└── shared/
    ├── styles/
    │   └── main.css
    └── utils/
        ├── format.js
        └── excel.js
```

---

### Recommendation 5: Extract Common Utilities
**Current**: Code duplication across HTML modules
**Identified Duplications**:
- Sidebar HTML/CSS (duplicated in ~8 files)
- Client/FY selection (duplicated in ~10 files)
- Table styling (duplicated in ~6 files)
- Success/error messages (duplicated everywhere)

**Proposed Utilities**:
```javascript
// js/shared/sidebar.js
export function initSidebar(activePage) { ... }

// js/shared/client-selector.js
export function initClientSelector(onChange) { ... }

// js/shared/table-formatter.js
export function formatCurrency(amount) { ... }
export function formatDate(date) { ... }

// js/shared/notifications.js
export function showSuccess(message) { ... }
export function showError(message) { ... }
```

---

### Recommendation 6: Module Loader System
**Goal**: Enable lazy loading for better performance

**Proposed Implementation**:
```javascript
// js/core/module-loader.js
export async function loadModule(moduleName) {
  const module = await import(`../modules/${moduleName}.js`);
  return module.default;
}

// Usage in HTML
<script type="module">
  import { loadModule } from '/js/core/module-loader.js';
  
  // Lazy load heavy modules
  if (needsAIChat) {
    await loadModule('ai-chat');
  }
</script>
```

---

### Recommendation 7: Consolidate Backend Servers
**Current State**:
- `server.py` - Python Flask (main)
- `server_new.py` - Python Flask alternative
- `server/index.js` - Node.js Express

**Recommendation**: Standardize on Node.js/Express for:
- Consistent language with frontend (JavaScript)
- Better Vercel deployment support
- Modern async patterns
- Package ecosystem alignment

**Migration Plan**:
1. Deprecate `server.py` and `server_new.py`
2. Move any Flask-specific features to Express
3. Document decision in `DEVELOPMENT.md`
4. Update CI/CD for single backend

---

### Recommendation 8: Add API Versioning
**Current**: Routes lack versioning (`/api/clients`)
**Proposed**: Implement `/api/v1/` prefix

**Benefits**:
- Backward compatibility during changes
- Clear migration path for API consumers
- Version-specific documentation

**Implementation**:
```javascript
// server/index.js
app.use('/api/v1/auth', authRoutesV1);
app.use('/api/v1/clients', clientRoutesV1);
app.use('/api/v1/accounts', accountRoutesV1);
```

---

## 7.4 SECURITY IMPROVEMENTS

### Fix RLS Policies (Immediate)

**Current (Insecure)**:
```sql
CREATE POLICY "Allow public read access to clients" ON clients 
  FOR SELECT TO anon, authenticated USING (true);
```

**Proposed (Secure)**:
```sql
-- Tenant isolation via user_id
CREATE POLICY "Users can only access own clients" ON clients 
  FOR ALL USING (auth.uid() = user_id);

-- Or organization-based (after migration)
CREATE POLICY "Users can only access org data" ON clients 
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));
```

---

### Create API Client Wrapper (Recommended)

```javascript
// js/api/safe-client.js
export class SafeClient {
  constructor(supabase) {
    this.client = supabase;
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // Auto-refresh expired tokens
    // Normalize error responses
    // Add request logging
    // Rate limiting indicators
  }
  
  async query(table, params) {
    // Validation before query
    // Error handling wrapper
    // Return standardized response
  }
}
```

---

## 7.5 PRIORITY SUMMARY

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 CRITICAL | Remove hardcoded credentials | Security | Low |
| 🔴 CRITICAL | Fix RLS policies | Security | Medium |
| 🟠 HIGH | Consolidate database schema | Maintainability | Medium |
| 🟠 HIGH | Extract common utilities | Maintainability | High |
| 🟡 MEDIUM | Reorganize frontend structure | Scalability | High |
| 🟡 MEDIUM | Consolidate backend servers | Maintainability | High |
| 🟡 MEDIUM | Add API versioning | Future-proofing | Medium |
| 🟢 LOW | Create technical documentation | DX | Low |

---

## 7.6 RECOMMENDED IMMEDIATE ACTIONS

1. **Remove hardcoded Supabase credentials** from `js/supabase-api.js`
2. **Fix RLS policies** in `supabase-rls-setup.sql` to use `auth.uid()`
3. **Consolidate** `supabase-tables.sql` and `supabase-rls-setup.sql` into one file
4. **Extract** sidebar and client-selector into shared components
5. **Document** decision on primary backend (recommend Node.js)
